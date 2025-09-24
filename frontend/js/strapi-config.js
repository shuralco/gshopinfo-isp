/**
 * Strapi API Configuration
 */
(function() {
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : 'https://g-shop.info';
    const defaultBaseUrl = `${normalizedOrigin}/api`;

    const config = {
        BASE_URL: defaultBaseUrl,
        READ_TOKEN: '15f1eb0059afee5532c0e79fc7443dc3e14eee6c7c52d0f346cab3b274dec6fab0d7f44118fafe8ec32faa5bcd59c585819f62507bc89ef46a4700f63e7f9050f95227a1972167ef124750a8a6c',
        WRITE_TOKEN: '15f1eb0059afee5532c0e79fc7443dc3e14eee6c7c52d0f346cab3b274dec6fab0d7f44118fafe8ec32faa5bcd59c585819f62507bc89ef46a4700f63e7f9050f95227a1972167ef124750a8a6c',
        DEV_MODE: false
    };

    if (typeof window !== 'undefined' && window.STRAPI_OVERRIDES) {
        Object.assign(config, window.STRAPI_OVERRIDES);
    }

    window.STRAPI_CONFIG = config;
    console.log('✅ Strapi configuration loaded', config);
})();
