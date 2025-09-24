const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = (config, { strapi }) => {
  // Configuration with defaults
  const healthConfig = {
    endpoint: config?.endpoint || '/_health',
    enableDetailedCheck: config?.detailed !== false,
    enableMetrics: config?.metrics !== false,
    checkDatabase: config?.database !== false,
    checkStorage: config?.storage !== false,
    checkMemory: config?.memory !== false,
    checkUptime: config?.uptime !== false,
    checkLandingPage: config?.landingPage !== false,
    memoryThreshold: config?.memoryThreshold || 90, // 90% memory usage threshold
    responseTimeThreshold: config?.responseTimeThreshold || 5000, // 5 seconds
    ...config
  };

  // Initialize logger
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

  // Health check metrics storage
  let healthMetrics = {
    startTime: Date.now(),
    checks: 0,
    lastCheck: null,
    lastStatus: null,
    errors: [],
    uptime: 0,
    memory: {
      used: 0,
      total: 0,
      percentage: 0
    },
    database: {
      connected: false,
      responseTime: 0,
      lastError: null
    },
    storage: {
      accessible: false,
      freeSpace: 0,
      totalSpace: 0,
      lastError: null
    },
    landingPage: {
      accessible: false,
      responseTime: 0,
      lastError: null
    }
  };

  // Check database connectivity
  const checkDatabase = async () => {
    const startTime = Date.now();
    
    try {
      // Test database connection with a simple query
      const result = await strapi.db.connection.raw('SELECT 1');
      const responseTime = Date.now() - startTime;
      
      healthMetrics.database = {
        connected: true,
        responseTime,
        lastError: null
      };
      
      return {
        status: 'healthy',
        connected: true,
        responseTime,
        details: 'Database connection successful'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      healthMetrics.database = {
        connected: false,
        responseTime,
        lastError: error.message
      };
      
      logger.error && logger.error('Database health check failed', error, 'health-check');
      
      return {
        status: 'unhealthy',
        connected: false,
        responseTime,
        error: error.message,
        details: 'Database connection failed'
      };
    }
  };

  // Check storage accessibility
  const checkStorage = async () => {
    try {
      const publicDir = path.join(strapi.dirs.static.public);
      const indexPath = path.join(publicDir, 'index.html');
      
      // Check if public directory exists and is accessible
      const publicExists = fs.existsSync(publicDir);
      const indexExists = fs.existsSync(indexPath);
      
      // Get storage space information
      let freeSpace = 0;
      let totalSpace = 0;
      
      try {
        const stats = fs.statSync(publicDir);
        // Get disk space (platform dependent)
        if (process.platform !== 'win32') {
          const { execSync } = require('child_process');
          const dfOutput = execSync(`df ${publicDir}`, { encoding: 'utf8' });
          const lines = dfOutput.split('\n');
          if (lines.length > 1) {
            const parts = lines[1].split(/\s+/);
            totalSpace = parseInt(parts[1]) * 1024; // Convert from KB to bytes
            freeSpace = parseInt(parts[3]) * 1024;
          }
        }
      } catch (error) {
        // Ignore disk space errors
      }
      
      healthMetrics.storage = {
        accessible: publicExists && indexExists,
        freeSpace,
        totalSpace,
        lastError: null
      };
      
      if (publicExists && indexExists) {
        return {
          status: 'healthy',
          publicDir: {
            exists: publicExists,
            path: publicDir
          },
          indexFile: {
            exists: indexExists,
            path: indexPath
          },
          diskSpace: {
            free: freeSpace,
            total: totalSpace,
            freeGB: Math.round(freeSpace / (1024 * 1024 * 1024) * 100) / 100,
            totalGB: Math.round(totalSpace / (1024 * 1024 * 1024) * 100) / 100
          },
          details: 'Storage is accessible and landing page files are present'
        };
      } else {
        const error = `Missing: ${!publicExists ? 'public directory' : ''} ${!indexExists ? 'index.html' : ''}`;
        
        healthMetrics.storage = {
          accessible: false,
          freeSpace,
          totalSpace,
          lastError: error
        };
        
        return {
          status: 'unhealthy',
          publicDir: {
            exists: publicExists,
            path: publicDir
          },
          indexFile: {
            exists: indexExists,
            path: indexPath
          },
          error,
          details: 'Required storage files are missing'
        };
      }
    } catch (error) {
      healthMetrics.storage = {
        accessible: false,
        freeSpace: 0,
        totalSpace: 0,
        lastError: error.message
      };
      
      logger.error && logger.error('Storage health check failed', error, 'health-check');
      
      return {
        status: 'unhealthy',
        error: error.message,
        details: 'Storage accessibility check failed'
      };
    }
  };

  // Check memory usage
  const checkMemory = () => {
    try {
      const memUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPercentage = (usedMem / totalMem) * 100;
      
      healthMetrics.memory = {
        used: usedMem,
        total: totalMem,
        percentage: memPercentage
      };
      
      const nodeMemUsage = {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external
      };
      
      const isHealthy = memPercentage < healthConfig.memoryThreshold;
      
      return {
        status: isHealthy ? 'healthy' : 'warning',
        system: {
          total: totalMem,
          used: usedMem,
          free: freeMem,
          percentage: Math.round(memPercentage * 100) / 100,
          totalGB: Math.round(totalMem / (1024 * 1024 * 1024) * 100) / 100,
          usedGB: Math.round(usedMem / (1024 * 1024 * 1024) * 100) / 100,
          freeGB: Math.round(freeMem / (1024 * 1024 * 1024) * 100) / 100
        },
        node: {
          rss: nodeMemUsage.rss,
          heapTotal: nodeMemUsage.heapTotal,
          heapUsed: nodeMemUsage.heapUsed,
          external: nodeMemUsage.external,
          rssMB: Math.round(nodeMemUsage.rss / (1024 * 1024) * 100) / 100,
          heapUsedMB: Math.round(nodeMemUsage.heapUsed / (1024 * 1024) * 100) / 100
        },
        threshold: healthConfig.memoryThreshold,
        details: isHealthy ? 'Memory usage is within acceptable limits' : 'Memory usage is above threshold'
      };
    } catch (error) {
      logger.error && logger.error('Memory health check failed', error, 'health-check');
      
      return {
        status: 'error',
        error: error.message,
        details: 'Memory check failed'
      };
    }
  };

  // Check uptime and performance
  const checkUptime = () => {
    try {
      const uptime = Date.now() - healthMetrics.startTime;
      const systemUptime = os.uptime() * 1000; // Convert to milliseconds
      
      healthMetrics.uptime = uptime;
      
      return {
        status: 'healthy',
        application: {
          uptime,
          uptimeSeconds: Math.floor(uptime / 1000),
          uptimeMinutes: Math.floor(uptime / (1000 * 60)),
          uptimeHours: Math.floor(uptime / (1000 * 60 * 60)),
          startTime: new Date(healthMetrics.startTime).toISOString()
        },
        system: {
          uptime: systemUptime,
          uptimeSeconds: Math.floor(systemUptime / 1000),
          uptimeHours: Math.floor(systemUptime / (1000 * 60 * 60))
        },
        details: 'Application is running normally'
      };
    } catch (error) {
      logger.error && logger.error('Uptime health check failed', error, 'health-check');
      
      return {
        status: 'error',
        error: error.message,
        details: 'Uptime check failed'
      };
    }
  };

  // Check landing page accessibility (internal)
  const checkLandingPage = async () => {
    const startTime = Date.now();
    
    try {
      const indexPath = path.join(strapi.dirs.static.public, 'index.html');
      
      if (!fs.existsSync(indexPath)) {
        const responseTime = Date.now() - startTime;
        
        healthMetrics.landingPage = {
          accessible: false,
          responseTime,
          lastError: 'index.html not found'
        };
        
        return {
          status: 'unhealthy',
          accessible: false,
          responseTime,
          error: 'index.html not found',
          path: indexPath,
          details: 'Landing page file is missing'
        };
      }
      
      // Read and validate HTML content
      const content = fs.readFileSync(indexPath, 'utf8');
      const responseTime = Date.now() - startTime;
      
      const isValidHTML = content.includes('<html') && content.includes('</html>');
      const hasTitle = content.includes('<title');
      const hasBody = content.includes('<body');
      
      healthMetrics.landingPage = {
        accessible: isValidHTML,
        responseTime,
        lastError: null
      };
      
      if (isValidHTML) {
        return {
          status: 'healthy',
          accessible: true,
          responseTime,
          validation: {
            isValidHTML,
            hasTitle,
            hasBody,
            size: content.length
          },
          path: indexPath,
          details: 'Landing page is accessible and valid'
        };
      } else {
        return {
          status: 'unhealthy',
          accessible: false,
          responseTime,
          validation: {
            isValidHTML,
            hasTitle,
            hasBody,
            size: content.length
          },
          error: 'Invalid HTML structure',
          path: indexPath,
          details: 'Landing page file is corrupted or invalid'
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      healthMetrics.landingPage = {
        accessible: false,
        responseTime,
        lastError: error.message
      };
      
      logger.error && logger.error('Landing page health check failed', error, 'health-check');
      
      return {
        status: 'unhealthy',
        accessible: false,
        responseTime,
        error: error.message,
        details: 'Landing page accessibility check failed'
      };
    }
  };

  // Get SPA fallback metrics if available
  const getSpaFallbackMetrics = () => {
    try {
      if (strapi.spaFallback && strapi.spaFallback.getMetrics) {
        return strapi.spaFallback.getMetrics();
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Perform comprehensive health check
  const performHealthCheck = async () => {
    const startTime = Date.now();
    
    try {
      const checks = {};
      let overallStatus = 'healthy';
      let criticalErrors = 0;
      let warnings = 0;
      
      // Perform individual checks based on configuration
      if (healthConfig.checkDatabase) {
        checks.database = await checkDatabase();
        if (checks.database.status === 'unhealthy') {
          criticalErrors++;
          overallStatus = 'unhealthy';
        }
      }
      
      if (healthConfig.checkStorage) {
        checks.storage = await checkStorage();
        if (checks.storage.status === 'unhealthy') {
          criticalErrors++;
          overallStatus = 'unhealthy';
        }
      }
      
      if (healthConfig.checkMemory) {
        checks.memory = checkMemory();
        if (checks.memory.status === 'warning') {
          warnings++;
          if (overallStatus === 'healthy') {
            overallStatus = 'warning';
          }
        } else if (checks.memory.status === 'error') {
          criticalErrors++;
          overallStatus = 'unhealthy';
        }
      }
      
      if (healthConfig.checkUptime) {
        checks.uptime = checkUptime();
        if (checks.uptime.status === 'error') {
          warnings++;
        }
      }
      
      if (healthConfig.checkLandingPage) {
        checks.landingPage = await checkLandingPage();
        if (checks.landingPage.status === 'unhealthy') {
          criticalErrors++;
          overallStatus = 'unhealthy';
        }
      }
      
      // Get additional metrics if enabled
      let metrics = null;
      if (healthConfig.enableMetrics) {
        metrics = {
          spaFallback: getSpaFallbackMetrics(),
          healthChecks: {
            total: healthMetrics.checks,
            lastCheck: healthMetrics.lastCheck,
            lastStatus: healthMetrics.lastStatus,
            errors: healthMetrics.errors.slice(-5) // Last 5 errors
          },
          system: {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            pid: process.pid,
            loadAverage: os.loadavg()
          }
        };
      }
      
      const responseTime = Date.now() - startTime;
      
      // Update metrics
      healthMetrics.checks++;
      healthMetrics.lastCheck = new Date().toISOString();
      healthMetrics.lastStatus = overallStatus;
      
      const result = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime,
        summary: {
          criticalErrors,
          warnings,
          checksPerformed: Object.keys(checks).length,
          overallHealth: overallStatus
        },
        checks,
        ...(metrics && { metrics })
      };
      
      // Log health check result
      if (overallStatus === 'healthy') {
        logger.debug && logger.debug('Health check completed successfully', {
          status: overallStatus,
          responseTime,
          criticalErrors,
          warnings
        }, 'health-check');
      } else {
        logger.warn && logger.warn('Health check found issues', {
          status: overallStatus,
          responseTime,
          criticalErrors,
          warnings,
          checks: Object.keys(checks).filter(key => 
            checks[key].status === 'unhealthy' || checks[key].status === 'error'
          )
        }, 'health-check');
      }
      
      return result;
      
    } catch (error) {
      healthMetrics.errors.push({
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      });
      
      // Keep only last 10 errors
      if (healthMetrics.errors.length > 10) {
        healthMetrics.errors = healthMetrics.errors.slice(-10);
      }
      
      logger.error && logger.error('Health check failed', error, 'health-check');
      
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        details: 'Health check system failure'
      };
    }
  };

  // Main middleware function
  return async (ctx, next) => {
    // Check if this is a health check request
    if (ctx.path === healthConfig.endpoint) {
      const healthResult = await performHealthCheck();
      
      // Set appropriate HTTP status code
      if (healthResult.status === 'healthy') {
        ctx.status = 200;
      } else if (healthResult.status === 'warning') {
        ctx.status = 200; // Still OK, but with warnings
      } else {
        ctx.status = 503; // Service Unavailable
      }
      
      ctx.type = 'application/json';
      ctx.body = healthResult;
      
      return; // Don't continue to next middleware
    }
    
    // Continue to next middleware for non-health-check requests
    await next();
  };
};