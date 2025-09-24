module.exports = (config, { strapi }) => {
  const defaults = {
    interval: 60000, // 1 minute
    max: 1000, // requests per interval
    apiMax: 100, // API specific limit
    adminMax: 500, // Admin specific limit
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (ctx) => {
      return ctx.ip || 'unknown';
    }
  };

  const settings = { ...defaults, ...config };

  // Simple in-memory rate limiter
  const requests = new Map();

  const cleanupOldRequests = () => {
    const now = Date.now();
    for (const [key, data] of requests.entries()) {
      if (now - data.firstRequest > settings.interval) {
        requests.delete(key);
      }
    }
  };

  return async (ctx, next) => {
    const key = settings.keyGenerator(ctx);
    const now = Date.now();

    // Cleanup old requests
    if (Math.random() < 0.01) { // 1% chance to cleanup
      cleanupOldRequests();
    }

    const requestData = requests.get(key) || {
      count: 0,
      firstRequest: now
    };

    // Reset if interval has passed
    if (now - requestData.firstRequest > settings.interval) {
      requestData.count = 0;
      requestData.firstRequest = now;
    }

    requestData.count++;
    requests.set(key, requestData);

    // Determine limit based on path
    let limit = settings.max;
    if (ctx.path.startsWith('/api')) {
      limit = settings.apiMax;
    } else if (ctx.path.startsWith('/admin')) {
      limit = settings.adminMax;
    }

    if (requestData.count > limit) {
      ctx.status = 429;
      ctx.body = {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Max ${limit} requests per ${settings.interval / 1000} seconds.`,
        retryAfter: Math.ceil((settings.interval - (now - requestData.firstRequest)) / 1000)
      };
      ctx.set('Retry-After', Math.ceil((settings.interval - (now - requestData.firstRequest)) / 1000));
      return;
    }

    await next();
  };
};