#!/var/www/pashland/data/.nvm/versions/node/v18.20.8/bin/node

const path = require('path');
const fs = require('fs');

// ISPManager socket configuration
const SOCKET_PATH = process.env.SOCKET_PATH || '/var/www/pashland/data/nodejs/0.sock';

// Change to backend directory
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

// Set environment
process.env.NODE_ENV = 'production';
process.env.HOST = '0.0.0.0';
process.env.PORT = '3002';

// Clean up old socket if exists
if (fs.existsSync(SOCKET_PATH)) {
  try {
    fs.unlinkSync(SOCKET_PATH);
  } catch (err) {
    console.log('Could not remove old socket:', err.message);
  }
}

console.log('Starting Strapi...');
console.log('Port:', process.env.PORT);
console.log('Socket:', SOCKET_PATH);

// Load and start Strapi
try {
  const strapi = require(path.join(backendPath, 'node_modules', '@strapi', 'strapi'));
  
  strapi({
    dir: backendPath,
    autoReload: false
  }).start().then(() => {
    console.log('Strapi is running on port', process.env.PORT);
  }).catch(err => {
    console.error('Failed to start Strapi:', err);
    process.exit(1);
  });
} catch (err) {
  console.error('Error loading Strapi:', err);
  process.exit(1);
}