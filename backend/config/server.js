module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', ['key1', 'key2']),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  // Enhanced static file serving configuration
  static: {
    // Enable serving static files
    serve: true,
    // Cache configuration for static assets
    cache: {
      enabled: env.bool('STATIC_CACHE_ENABLED', true),
      maxAge: env.int('STATIC_CACHE_MAX_AGE', 31536000), // 1 year default
      // Different cache strategies for different file types
      rules: {
        html: env.int('HTML_CACHE_MAX_AGE', 300), // 5 minutes for HTML
        css: env.int('CSS_CACHE_MAX_AGE', 31536000), // 1 year for CSS
        js: env.int('JS_CACHE_MAX_AGE', 31536000), // 1 year for JS
        images: env.int('IMAGE_CACHE_MAX_AGE', 31536000), // 1 year for images
        fonts: env.int('FONT_CACHE_MAX_AGE', 31536000) // 1 year for fonts
      }
    },
    // Compression settings
    compression: {
      enabled: env.bool('STATIC_COMPRESSION_ENABLED', true),
      level: env.int('COMPRESSION_LEVEL', 6),
      threshold: env.int('COMPRESSION_THRESHOLD', 1024) // Compress files > 1KB
    }
  },
  // Enhanced admin panel configuration
  admin: {
    url: env('ADMIN_URL', '/admin'),
    serveAdminPanel: env.bool('SERVE_ADMIN', true),
    // Admin panel optimization
    build: {
      backend: env('ADMIN_BACKEND_URL', '/admin'),
      absoluteUrl: env('ADMIN_ABSOLUTE_URL', false)
    },
    // Admin session configuration
    session: {
      rolling: env.bool('ADMIN_SESSION_ROLLING', true),
      maxAge: env.int('ADMIN_SESSION_MAX_AGE', 24 * 60 * 60 * 1000), // 24 hours
      renew: env.bool('ADMIN_SESSION_RENEW', false)
    },
    // Admin rate limiting
    rateLimit: {
      enabled: env.bool('ADMIN_RATE_LIMIT_ENABLED', true),
      interval: env.int('ADMIN_RATE_LIMIT_INTERVAL', 60000), // 1 minute
      max: env.int('ADMIN_RATE_LIMIT_MAX', 500) // 500 requests per minute
    }
  },
  // Enhanced API configuration
  api: {
    rest: {
      defaultLimit: env.int('API_DEFAULT_LIMIT', 25),
      maxLimit: env.int('API_MAX_LIMIT', 100),
      withCount: env.bool('API_WITH_COUNT', true)
    },
    // API response optimization
    response: {
      // Enable response compression
      compression: env.bool('API_COMPRESSION_ENABLED', true),
      // Cache headers for API responses
      cache: {
        enabled: env.bool('API_CACHE_ENABLED', true),
        ttl: env.int('API_CACHE_TTL', 300), // 5 minutes default
        // Different cache settings for different endpoints
        endpoints: {
          '/api/site-setting': env.int('SITE_SETTING_CACHE_TTL', 1800), // 30 minutes
          '/api/brands': env.int('BRANDS_CACHE_TTL', 3600), // 1 hour
          '/api/categories': env.int('CATEGORIES_CACHE_TTL', 3600), // 1 hour
          '/api/products': env.int('PRODUCTS_CACHE_TTL', 900) // 15 minutes
        }
      },
      // Response size limits
      limits: {
        json: env('API_JSON_LIMIT', '2mb'),
        text: env('API_TEXT_LIMIT', '256kb'),
        form: env('API_FORM_LIMIT', '256kb')
      }
    }
  },
  // Server timeout configuration
  server: {
    // Request timeout
    timeout: env.int('SERVER_TIMEOUT', 30000), // 30 seconds
    // Keep alive timeout
    keepAliveTimeout: env.int('KEEP_ALIVE_TIMEOUT', 5000), // 5 seconds
    // Headers timeout
    headersTimeout: env.int('HEADERS_TIMEOUT', 60000), // 60 seconds
    // Max request size
    maxRequestSize: env('MAX_REQUEST_SIZE', '100mb'),
    // Enable graceful shutdown
    gracefulShutdown: {
      enabled: env.bool('GRACEFUL_SHUTDOWN_ENABLED', true),
      timeout: env.int('GRACEFUL_SHUTDOWN_TIMEOUT', 10000) // 10 seconds
    }
  },
  // Health check configuration
  health: {
    enabled: env.bool('HEALTH_CHECK_ENABLED', true),
    endpoint: env('HEALTH_CHECK_ENDPOINT', '/_health'),
    // Health check details
    checks: {
      database: env.bool('HEALTH_CHECK_DATABASE', true),
      storage: env.bool('HEALTH_CHECK_STORAGE', true),
      memory: env.bool('HEALTH_CHECK_MEMORY', true),
      uptime: env.bool('HEALTH_CHECK_UPTIME', true)
    }
  },
  // Logging configuration
  logger: {
    level: env('LOG_LEVEL', 'info'),
    // Log performance metrics
    performance: env.bool('LOG_PERFORMANCE', true),
    // Log slow queries (queries taking longer than threshold)
    slowQueries: {
      enabled: env.bool('LOG_SLOW_QUERIES', true),
      threshold: env.int('SLOW_QUERY_THRESHOLD', 1000) // 1 second
    },
    // Request logging
    requests: {
      enabled: env.bool('LOG_REQUESTS', env('NODE_ENV') === 'development'),
      // Log only slow requests in production
      slowOnly: env.bool('LOG_SLOW_REQUESTS_ONLY', env('NODE_ENV') === 'production'),
      slowThreshold: env.int('SLOW_REQUEST_THRESHOLD', 2000) // 2 seconds
    }
  },
  // Performance monitoring
  performance: {
    // Enable performance monitoring
    enabled: env.bool('PERFORMANCE_MONITORING', true),
    // Memory usage alerts
    memory: {
      alertThreshold: env.int('MEMORY_ALERT_THRESHOLD', 80), // 80% of available memory
      maxUsage: env.int('MEMORY_MAX_USAGE', 90) // 90% before warnings
    },
    // Response time monitoring
    responseTime: {
      alertThreshold: env.int('RESPONSE_TIME_ALERT_THRESHOLD', 2000), // 2 seconds
      sampling: env.float('RESPONSE_TIME_SAMPLING', 0.1) // Sample 10% of requests
    }
  },
  // Environment-specific optimizations
  optimization: {
    // Development specific settings
    development: {
      // Disable caching in development
      cache: env.bool('DEV_CACHE_ENABLED', false),
      // Enable detailed logging
      verboseLogging: env.bool('DEV_VERBOSE_LOGGING', true),
      // Hot reload settings
      hotReload: env.bool('DEV_HOT_RELOAD', true)
    },
    // Production specific settings
    production: {
      // Enable all caching in production
      cache: env.bool('PROD_CACHE_ENABLED', true),
      // Reduce logging verbosity
      verboseLogging: env.bool('PROD_VERBOSE_LOGGING', false),
      // Enable clustering
      cluster: env.bool('PROD_CLUSTER_ENABLED', false),
      clusterWorkers: env.int('CLUSTER_WORKERS', 0) // 0 = auto-detect
    }
  },
  // Custom routes for landing page integration
  routes: {
    // Landing page specific routes
    landing: {
      enabled: env.bool('LANDING_ROUTES_ENABLED', true),
      // Custom routes that should serve the landing page
      customRoutes: env.array('CUSTOM_LANDING_ROUTES', [
        '/gardena',
        '/fiskars', 
        '/husqvarna',
        '/products',
        '/contact'
      ])
    },
    // API optimization routes
    api: {
      // Enable API route optimization
      optimization: env.bool('API_ROUTE_OPTIMIZATION', true),
      // Prefix for all API routes
      prefix: env('API_ROUTE_PREFIX', '/api'),
      // Version header
      version: env('API_VERSION', 'v1')
    }
  }
});