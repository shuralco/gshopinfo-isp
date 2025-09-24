const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

module.exports = (config, { strapi }) => {
  // Configuration with defaults
  const middlewareConfig = {
    cacheEnabled: config?.cache?.enabled !== false,
    cacheTTL: config?.cache?.ttl || 5 * 60 * 1000, // 5 minutes
    compressionEnabled: false, // Disable compression to fix encoding issues
    compressionLevel: config?.compression?.level || 6,
    errorPagePath: config?.errorPage?.path || null,
    performanceMetrics: config?.metrics?.enabled !== false,
    debugMode: config?.debug || false,
    ...config
  };

  // Cache for index.html content
  let indexCache = {
    content: null,
    compressed: null,
    lastModified: null,
    expires: null
  };

  // Performance metrics
  let metrics = {
    hits: 0,
    cacheHits: 0,
    errors: 0,
    avgResponseTime: 0,
    lastRequestTime: null
  };

  // Initialize logger with deployment context
  const logger = (() => {
    try {
      const loggerPath = path.join(process.cwd(), 'utils', 'logger.js');
      if (fs.existsSync(loggerPath)) {
        return require(loggerPath);
      }
    } catch (error) {
      // Fallback to Strapi logger
    }
    return strapi.log;
  })();

  // Excluded paths that should not trigger SPA fallback
  const excludedPaths = [
    '/api',
    '/admin',
    '/uploads',
    '/_health',
    '/i18n',
    '/content-manager',
    '/content-type-builder',
    '/users-permissions',
    '/documentation',
    '/graphql',
    '/.well-known',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ];

  // Check if request should be excluded from SPA fallback
  const shouldExclude = (url) => {
    return excludedPaths.some(path => url.startsWith(path)) ||
           url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/i);
  };

  // Load and cache index.html content
  const loadIndexContent = () => {
    const startTime = Date.now();
    
    try {
      const indexPath = path.join(strapi.dirs.static.public, 'index.html');
      
      if (!fs.existsSync(indexPath)) {
        logger.warn && logger.warn('Index.html not found at path', { path: indexPath }, 'spa-fallback');
        return null;
      }

      const stats = fs.statSync(indexPath);
      const now = Date.now();

      // Check if cache is valid
      if (middlewareConfig.cacheEnabled && 
          indexCache.content && 
          indexCache.lastModified === stats.mtime.getTime() &&
          indexCache.expires > now) {
        
        metrics.cacheHits++;
        
        if (middlewareConfig.debugMode) {
          logger.debug && logger.debug('Serving index.html from cache', { 
            path: indexPath,
            cacheHit: true 
          }, 'spa-fallback');
        }
        
        return indexCache;
      }

      // Read fresh content
      const content = fs.readFileSync(indexPath, 'utf8');
      
      // Prepare compressed version if compression is enabled
      let compressed = null;
      if (middlewareConfig.compressionEnabled) {
        compressed = zlib.gzipSync(content, { level: middlewareConfig.compressionLevel });
      }

      // Update cache
      indexCache = {
        content,
        compressed,
        lastModified: stats.mtime.getTime(),
        expires: now + middlewareConfig.cacheTTL
      };

      const loadTime = Date.now() - startTime;
      
      logger.info && logger.info('Index.html loaded and cached', {
        path: indexPath,
        size: content.length,
        compressed: compressed ? compressed.length : null,
        loadTime,
        cacheEnabled: middlewareConfig.cacheEnabled
      }, 'spa-fallback');

      return indexCache;

    } catch (error) {
      metrics.errors++;
      
      logger.error && logger.error('Failed to load index.html', error, 'spa-fallback');
      return null;
    }
  };

  // Load custom error page if configured
  const loadErrorPage = () => {
    if (!middlewareConfig.errorPagePath) return null;
    
    try {
      const errorPath = path.join(strapi.dirs.static.public, middlewareConfig.errorPagePath);
      if (fs.existsSync(errorPath)) {
        return fs.readFileSync(errorPath, 'utf8');
      }
    } catch (error) {
      logger.warn && logger.warn('Failed to load custom error page', error, 'spa-fallback');
    }
    
    return null;
  };

  // Update performance metrics
  const updateMetrics = (responseTime) => {
    metrics.hits++;
    metrics.lastRequestTime = Date.now();
    
    // Calculate rolling average response time
    if (metrics.avgResponseTime === 0) {
      metrics.avgResponseTime = responseTime;
    } else {
      metrics.avgResponseTime = (metrics.avgResponseTime * 0.9) + (responseTime * 0.1);
    }
  };

  // Get current metrics
  const getMetrics = () => ({
    ...metrics,
    cacheHitRate: metrics.hits > 0 ? (metrics.cacheHits / metrics.hits * 100).toFixed(2) + '%' : '0%',
    errorRate: metrics.hits > 0 ? (metrics.errors / metrics.hits * 100).toFixed(2) + '%' : '0%',
    avgResponseTimeMs: Math.round(metrics.avgResponseTime)
  });

  // Health check function
  const healthCheck = () => {
    try {
      const indexPath = path.join(strapi.dirs.static.public, 'index.html');
      const exists = fs.existsSync(indexPath);
      const cacheValid = indexCache.content !== null && indexCache.expires > Date.now();
      
      return {
        status: exists ? 'healthy' : 'unhealthy',
        indexFileExists: exists,
        cacheStatus: middlewareConfig.cacheEnabled ? (cacheValid ? 'valid' : 'expired') : 'disabled',
        metrics: getMetrics(),
        config: {
          cacheEnabled: middlewareConfig.cacheEnabled,
          compressionEnabled: middlewareConfig.compressionEnabled,
          cacheTTL: middlewareConfig.cacheTTL
        }
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        metrics: getMetrics()
      };
    }
  };

  // Expose health check and metrics to Strapi
  if (strapi.spaFallback) {
    strapi.spaFallback.healthCheck = healthCheck;
    strapi.spaFallback.getMetrics = getMetrics;
  } else {
    strapi.spaFallback = { healthCheck, getMetrics };
  }

  // Main middleware function
  return async (ctx, next) => {
    const startTime = Date.now();
    
    // Handle root path immediately
    if (ctx.url === '/' || ctx.url === '/index.html') {
      try {
        const indexData = loadIndexContent();
        
        if (indexData && indexData.content) {
          // Determine if client accepts gzip
          const acceptsGzip = ctx.acceptsEncodings('gzip') === 'gzip' && 
                             middlewareConfig.compressionEnabled && 
                             indexData.compressed;

          // Set response headers
          ctx.type = 'html';
          ctx.set('Content-Type', 'text/html; charset=utf-8');
          ctx.status = 200;
          
          // Set caching headers
          if (middlewareConfig.cacheEnabled) {
            ctx.set('Cache-Control', `public, max-age=${Math.floor(middlewareConfig.cacheTTL / 1000)}`);
            ctx.set('Last-Modified', new Date(indexData.lastModified).toUTCString());
          } else {
            ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          }

          // Serve compressed or regular content
          if (acceptsGzip) {
            ctx.set('Content-Encoding', 'gzip');
            ctx.body = indexData.compressed;
            if (middlewareConfig.cacheEnabled) metrics.cacheHits++;
          } else {
            ctx.body = indexData.content;
          }

          // Update metrics and log
          const responseTime = Date.now() - startTime;
          updateMetrics(responseTime);
          
          if (middlewareConfig.debugMode) {
            logger.debug && logger.debug(`SPA fallback served index.html for ${ctx.url} in ${responseTime}ms`, null, 'spa-fallback');
          }
          
          return; // Skip calling next()
        }
      } catch (error) {
        metrics.errors++;
        logger.error && logger.error('Error serving root index.html', error, 'spa-fallback');
      }
    }
    
    await next();
    
    // Only handle 404 responses for non-excluded paths (and not root paths)
    if (ctx.status === 404 && !shouldExclude(ctx.url) && ctx.url !== '/' && ctx.url !== '/index.html') {
      try {
        const indexData = loadIndexContent();
        
        if (indexData && indexData.content) {
          // Determine if client accepts gzip
          const acceptsGzip = ctx.acceptsEncodings('gzip') === 'gzip' && 
                             middlewareConfig.compressionEnabled && 
                             indexData.compressed;

          // Set response headers
          ctx.type = 'html';
          ctx.set('Content-Type', 'text/html; charset=utf-8');
          ctx.status = 200;
          
          // Set caching headers
          if (middlewareConfig.cacheEnabled) {
            ctx.set('Cache-Control', `public, max-age=${Math.floor(middlewareConfig.cacheTTL / 1000)}`);
            ctx.set('Last-Modified', new Date(indexData.lastModified).toUTCString());
          } else {
            ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          }

          // Serve compressed or regular content
          if (acceptsGzip) {
            ctx.set('Content-Encoding', 'gzip');
            ctx.body = indexData.compressed;
          } else {
            ctx.body = indexData.content;
          }

          const responseTime = Date.now() - startTime;
          updateMetrics(responseTime);

          // Log successful fallback
          if (middlewareConfig.debugMode) {
            logger.debug && logger.debug('SPA fallback served', {
              url: ctx.url,
              compressed: acceptsGzip,
              responseTime,
              cacheHit: indexData === indexCache
            }, 'spa-fallback');
          } else {
            logger.info && logger.info(`SPA fallback served for: ${ctx.url}`, {
              responseTime,
              compressed: acceptsGzip
            }, 'spa-fallback');
          }

        } else {
          // Serve custom error page if available
          const errorContent = loadErrorPage();
          if (errorContent) {
            ctx.type = 'html';
            ctx.status = 404;
            ctx.body = errorContent;
            
            logger.info && logger.info(`Custom error page served for: ${ctx.url}`, null, 'spa-fallback');
          } else {
            // Keep original 404 status
            const responseTime = Date.now() - startTime;
            updateMetrics(responseTime);
            
            logger.warn && logger.warn(`SPA fallback unavailable for: ${ctx.url}`, {
              reason: 'index.html not found or not readable'
            }, 'spa-fallback');
          }
        }

      } catch (error) {
        metrics.errors++;
        const responseTime = Date.now() - startTime;
        updateMetrics(responseTime);
        
        logger.error && logger.error('Error in SPA fallback middleware', error, 'spa-fallback');
        
        // Don't modify the response on error, let it pass through
      }
    }
  };
};