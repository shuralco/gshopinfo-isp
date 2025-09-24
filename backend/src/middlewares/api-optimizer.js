module.exports = (config, { strapi }) => {
  const defaults = {
    enabled: true,
    cacheEnabled: true,
    cacheTTL: 300000, // 5 minutes
    minifyResponse: true,
    removeEmptyFields: true,
    optimizeImages: true
  };

  const settings = { ...defaults, ...config };

  if (!settings.enabled) {
    return async (ctx, next) => {
      await next();
    };
  }

  // Simple in-memory cache
  const cache = new Map();

  const cleanupCache = () => {
    const now = Date.now();
    for (const [key, data] of cache.entries()) {
      if (now - data.timestamp > settings.cacheTTL) {
        cache.delete(key);
      }
    }
  };

  const generateCacheKey = (ctx) => {
    return `${ctx.method}:${ctx.url}:${JSON.stringify(ctx.query)}`;
  };

  const minifyJSON = (obj) => {
    if (!settings.minifyResponse) return obj;
    
    const minify = (item) => {
      if (Array.isArray(item)) {
        return item.map(minify);
      } else if (item && typeof item === 'object') {
        const minified = {};
        for (const [key, value] of Object.entries(item)) {
          if (settings.removeEmptyFields && (value === null || value === undefined || value === '')) {
            continue;
          }
          minified[key] = minify(value);
        }
        return minified;
      }
      return item;
    };

    return minify(obj);
  };

  return async (ctx, next) => {
    // Only optimize API requests
    if (!ctx.path.startsWith('/api')) {
      await next();
      return;
    }

    // Check cache for GET requests
    if (settings.cacheEnabled && ctx.method === 'GET') {
      const cacheKey = generateCacheKey(ctx);
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < settings.cacheTTL) {
        ctx.body = cached.data;
        ctx.set('X-Cache', 'HIT');
        ctx.set('Cache-Control', `public, max-age=${Math.floor(settings.cacheTTL / 1000)}`);
        return;
      }
    }

    // Cleanup cache occasionally
    if (Math.random() < 0.01) { // 1% chance
      cleanupCache();
    }

    await next();

    // Optimize response
    if (ctx.body && typeof ctx.body === 'object') {
      ctx.body = minifyJSON(ctx.body);
      
      // Cache successful GET responses
      if (settings.cacheEnabled && ctx.method === 'GET' && ctx.status === 200) {
        const cacheKey = generateCacheKey(ctx);
        cache.set(cacheKey, {
          data: ctx.body,
          timestamp: Date.now()
        });
        ctx.set('X-Cache', 'MISS');
      }
      
      // Set cache headers
      if (ctx.method === 'GET' && ctx.status === 200) {
        ctx.set('Cache-Control', `public, max-age=${Math.floor(settings.cacheTTL / 1000)}`);
      }
    }
  };
};