#!/bin/bash
# Скрипт для розгортання G-Shop.info на ISPmanager
# Запустіть цей скрипт на сервері після підключення по SSH

echo "🚀 Початок розгортання G-Shop.info..."

# Перейти до директорії сайту
cd /var/www/pashland/data/www/g-shop.info

# Переміщення frontend файлів в корінь
echo "📁 Налаштування структури файлів..."
if [ -d "frontend" ]; then
    mv frontend/* . 2>/dev/null || true
    mv frontend/.* . 2>/dev/null || true
    rmdir frontend 2>/dev/null || true
fi

# Створення .env файлу для backend
echo "⚙️ Створення .env файлу..."
cat > backend/.env << 'EOF'
HOST=0.0.0.0
PORT=1337
APP_KEYS=JHN8s92hHSN2sHJKs82jSKs92,KJSh92JSh29JSks92JSK29s
API_TOKEN_SALT=Jhs82JSks92JSks
ADMIN_JWT_SECRET=JKShs92JSks92JSks92JSksj92JSks92
TRANSFER_TOKEN_SALT=Kjs92JSks92JSks
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
JWT_SECRET=LKShs92JSks92JSks92JSksj92JSks92
NODE_ENV=production
EOF

# Встановлення npm залежностей
echo "📦 Встановлення залежностей (це може зайняти кілька хвилин)..."
cd backend
npm install --omit=dev

# Побудова Strapi
echo "🔨 Побудова Strapi..."
npm run build

# Створення ecosystem.config.js для PM2
echo "📝 Створення PM2 конфігурації..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'g-shop-backend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/pashland/data/www/g-shop.info/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 1337
      }
    }
  ]
};
EOF

# Запуск через PM2
echo "🚀 Запуск backend через PM2..."
pm2 stop g-shop-backend 2>/dev/null || true
pm2 delete g-shop-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup || true

# Створення .htaccess для проксі
echo "🌐 Налаштування .htaccess..."
cd /var/www/pashland/data/www/g-shop.info
cat > .htaccess << 'EOF'
RewriteEngine On

# Проксі для /admin та /api до Strapi backend
RewriteCond %{REQUEST_URI} ^/(admin|api|content-manager|upload|users-permissions|i18n|content-type-builder|email|_health)
RewriteRule ^(.*)$ http://127.0.0.1:1337/$1 [P,L]

# Проксі для статичних файлів Strapi admin panel
RewriteCond %{REQUEST_URI} ^/admin/.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$
RewriteRule ^(.*)$ http://127.0.0.1:1337/$1 [P,L]

# Frontend файли
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^$ index.html [L]
EOF

# Встановлення прав доступу
echo "🔒 Встановлення прав доступу..."
chmod 755 backend
chmod 755 uploads
chmod 755 logs
chmod 644 .htaccess

# Перевірка статусу
echo "✅ Розгортання завершено!"
echo ""
echo "📊 Статус PM2:"
pm2 status
echo ""
echo "🌐 Ваш сайт має бути доступний за адресами:"
echo "   Frontend: https://g-shop.info"
echo "   Backend Admin: https://g-shop.info/admin"
echo ""
echo "Якщо backend не запустився, перевірте логи: pm2 logs g-shop-backend"