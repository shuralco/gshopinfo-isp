/**
 * Strapi API Configuration
 */
window.STRAPI_CONFIG = {
    // Strapi API Base URL
    BASE_URL: 'http://localhost:1337/api',
    
    // API Tokens
    READ_TOKEN: '15f1eb0059afee5532c0e79fc7443dc3e14eee6c7c52d0f346cab3b274dec6fab0d7f44118fafe8ec32faa5bcd59c585819f62507bc89ef46a4700f63e7f9050f95227a1972167ef124750a8a6c',
    WRITE_TOKEN: '15f1eb0059afee5532c0e79fc7443dc3e14eee6c7c52d0f346cab3b274dec6fab0d7f44118fafe8ec32faa5bcd59c585819f62507bc89ef46a4700f63e7f9050f95227a1972167ef124750a8a6c',
    
    // Development mode
    DEV_MODE: true
};

// Load configuration
console.log('✅ Strapi configuration loaded');