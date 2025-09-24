#!/bin/bash

echo "🚀 Deploying Gardena Land..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (use sudo)"
  exit 1
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
cd backend
npm install --production
cd ..

# Setup directories
echo "📁 Setting up directories..."
mkdir -p /var/www/gardena
cp -r backend /var/www/gardena/
cp -r frontend /var/www/gardena/

# Set permissions
chown -R www-data:www-data /var/www/gardena
chmod -R 755 /var/www/gardena

# Setup Nginx
echo "🔧 Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/gardena
ln -sf /etc/nginx/sites-available/gardena /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Setup PM2
echo "🔧 Setting up PM2..."
pm2 delete gardena-strapi 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "🌐 Frontend: http://your-domain.com"
echo "🔧 Admin: http://your-domain.com/admin"
echo "📊 API: http://your-domain.com/api"
