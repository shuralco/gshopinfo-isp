#!/bin/bash

# Скрипт для деплою на ISPManager
# Використання: ./deploy-to-isp.sh

SERVER_USER="root"
SERVER_HOST="167.235.7.222"
SERVER_PATH="/var/www/pashland/data/www/g-shop.info"
NODE_PATH="/var/www/pashland/data/.nvm/versions/node/v18.20.8/bin"

echo "======================================="
echo "Деплой на ISPManager сервер"
echo "======================================="

# Створюємо архів з потрібними файлами
echo "1. Створюю архів для деплою..."
tar -czf deploy-package.tar.gz \
    app.js \
    ecosystem.config.js \
    package.json \
    isp-config.js \
    backend/ \
    frontend/

echo "2. Завантажую файли на сервер..."
scp deploy-package.tar.gz ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

echo "3. Підключаюсь до сервера та розпаковую..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /var/www/pashland/data/www/g-shop.info

# Створюємо backup поточної версії
echo "Створюю backup..."
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz app.js ecosystem.config.js package.json backend/ frontend/ 2>/dev/null || true

# Розпаковуємо нові файли
echo "Розпаковую нові файли..."
tar -xzf deploy-package.tar.gz

# Створюємо директорію для логів
mkdir -p logs

# Встановлюємо залежності
echo "Встановлюю залежності backend..."
cd backend
/var/www/pashland/data/.nvm/versions/node/v18.20.8/bin/npm install

# Збираємо Strapi
echo "Збираю Strapi..."
/var/www/pashland/data/.nvm/versions/node/v18.20.8/bin/npm run build

# Повертаємось в головну директорію
cd /var/www/pashland/data/www/g-shop.info

# Перезапускаємо PM2
echo "Перезапускаю додаток..."
pm2 stop g-shop-strapi 2>/dev/null || true
pm2 delete g-shop-strapi 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "Деплой завершено!"
pm2 status
ENDSSH

# Видаляємо локальний архів
rm deploy-package.tar.gz

echo "======================================="
echo "Деплой успішно завершено!"
echo "Перевірте роботу: http://g-shop.info"
echo "======================================="