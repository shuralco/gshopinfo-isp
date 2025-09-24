'use strict';

/**
 * Rate limiting middleware for contact form
 */

const rateLimit = new Map();

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const ip = ctx.request.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 3; // max 3 requests per 15 minutes

    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
      return await next();
    }

    const userRateLimit = rateLimit.get(ip);
    
    if (now > userRateLimit.resetTime) {
      // Reset window
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
      return await next();
    }

    if (userRateLimit.count >= maxRequests) {
      return ctx.tooManyRequests('Забагато запитів. Спробуйте через 15 хвилин.');
    }

    userRateLimit.count++;
    return await next();
  };
};