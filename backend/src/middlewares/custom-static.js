const fs = require('fs');
const path = require('path');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.path === '/' && ctx.method === 'GET') {
      try {
        const indexPath = path.join(strapi.dirs.static.public, 'index.html');
        if (fs.existsSync(indexPath)) {
          ctx.type = 'html';
          ctx.body = fs.readFileSync(indexPath, 'utf8');
          return;
        }
      } catch (err) {
        console.log('Error serving index.html:', err);
      }
    }
    
    await next();
  };
};