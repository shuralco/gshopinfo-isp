const zlib = require('zlib');

module.exports = (config, { strapi }) => {
  const defaults = {
    enabled: true,
    threshold: 1024, // compress responses > 1KB
    level: 6, // compression level (1-9)
    filter: (contentType) => {
      return /text|javascript|json|css|xml|svg/.test(contentType);
    }
  };

  const settings = { ...defaults, ...config };

  if (!settings.enabled) {
    return async (ctx, next) => {
      await next();
    };
  }

  return async (ctx, next) => {
    await next();

    // Only compress if response is successful and has body
    if (ctx.status < 200 || ctx.status >= 300 || !ctx.body) {
      return;
    }

    // Check if content type should be compressed
    const contentType = ctx.response.get('Content-Type') || '';
    if (!settings.filter(contentType)) {
      return;
    }

    // Check if client accepts gzip
    const acceptEncoding = ctx.request.get('Accept-Encoding') || '';
    if (!acceptEncoding.includes('gzip')) {
      return;
    }

    // Get body as string or buffer
    let body;
    if (typeof ctx.body === 'string') {
      body = Buffer.from(ctx.body, 'utf8');
    } else if (Buffer.isBuffer(ctx.body)) {
      body = ctx.body;
    } else if (typeof ctx.body === 'object') {
      body = Buffer.from(JSON.stringify(ctx.body), 'utf8');
    } else {
      return; // Skip compression for other types
    }

    // Only compress if body is larger than threshold
    if (body.length < settings.threshold) {
      return;
    }

    try {
      // Compress the body
      const compressed = zlib.gzipSync(body, { level: settings.level });
      
      // Set compressed body and headers
      ctx.body = compressed;
      ctx.set('Content-Encoding', 'gzip');
      ctx.set('Content-Length', compressed.length);
      
      // Remove Vary header if set by other middleware
      ctx.vary('Accept-Encoding');
      
    } catch (error) {
      strapi.log.error('Compression error:', error);
      // Don't fail the request, just don't compress
    }
  };
};