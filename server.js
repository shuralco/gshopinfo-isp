/**
 * Server.js - Fallback for direct node execution
 */

const path = require('path');

// Change to backend directory
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

// Set production environment
process.env.NODE_ENV = 'production';
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.PORT = process.env.PORT || '3002';

// Start Strapi
const strapi = require('@strapi/strapi');

strapi({
  dir: backendPath,
  autoReload: false
}).start();