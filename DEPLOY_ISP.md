# Інструкція з розгортання на ISPManager

## Дані для підключення
- **Хост**: 167.235.7.222
- **Користувач**: root (або pashland для деплою)
- **Пароль**: qaqa1234
- **Робоча директорія**: /var/www/pashland/data/www/g-shop.info/
- **Node.js**: v18.20.8
- **Сокет**: /var/www/pashland/data/nodejs/0.sock

## Файли, які потрібно завантажити на сервер

1. **app.js** - основний файл запуску програми через сокет
2. **ecosystem.config.js** - конфігурація PM2
3. **package.json** - головний package.json для запуску
4. **backend/** - вся директорія з Strapi CMS
5. **frontend/** - директорія з фронтенд додатком (якщо потрібно)
6. **isp-config.js** - альтернативна конфігурація

## Кроки для деплою через SSH

```bash
# 1. Підключитися до сервера
ssh root@167.235.7.222
# або
ssh pashland@167.235.7.222

# 2. Перейти в робочу директорію
cd /var/www/pashland/data/www/g-shop.info/

# 3. Створити директорію для логів
mkdir -p logs

# 4. Завантажити файли (через scp або rsync з локальної машини)
# З локальної машини:
scp -r app.js ecosystem.config.js package.json backend/ frontend/ root@167.235.7.222:/var/www/pashland/data/www/g-shop.info/

# 5. Встановити залежності для backend
cd /var/www/pashland/data/www/g-shop.info/backend
/var/www/pashland/data/.nvm/versions/node/v18.20.8/bin/npm install

# 6. Зібрати Strapi і згенерувати статичний контент
# npm run build тепер спочатку виконує scripts/prefetch-strapi.js, який забирає дані зі Strapi
# та зберігає їх у frontend/generated/content.{json,js}
/var/www/pashland/data/.nvm/versions/node/v18.20.8/bin/npm run build

# 7. Повернутись в головну директорію
cd /var/www/pashland/data/www/g-shop.info/

# 8. Встановити PM2 (якщо ще не встановлено)
/var/www/pashland/data/.nvm/versions/node/v18.20.8/bin/npm install -g pm2

# 9. Запустити додаток через PM2
pm2 start ecosystem.config.js

# 10. Зберегти конфігурацію PM2
pm2 save

# 11. Налаштувати автозапуск
pm2 startup

# 12. Перевірити статус
pm2 status

## Оновлення контенту без ручних правок фронтенду

- Після змін у Strapi виконуйте `npm run build` (або `npm run prefetch` локально), щоб оновлені дані потрапили у `frontend/generated/content.json` та `content.js`.
- Фронтенд підвантажує ці файли під час віддачі `index.html`, тому нові тексти з'являються одразу після білду.
- Якщо білд не виконувався, `dynamic-loader.js` fallback-ом звернеться напряму до Strapi, але це призведе до додаткових запитів і пізнішої появи контенту.
pm2 logs g-shop-strapi
```

## Альтернативний запуск через ISPManager панель

1. Зайти в ISPManager панель
2. Перейти в розділ "Node.js"
3. Створити новий додаток з такими параметрами:
   - Назва: g-shop-strapi
   - Версія Node.js: 18.20.8
   - Скрипт запуску: app.js
   - Робоча директорія: /var/www/pashland/data/www/g-shop.info/
   - Порт/Сокет: /var/www/pashland/data/nodejs/0.sock

## Перевірка роботи

```bash
# Перевірити чи працює сокет
ls -la /var/www/pashland/data/nodejs/0.sock

# Перевірити логи
tail -f /var/www/pashland/data/www/g-shop.info/logs/out.log
tail -f /var/www/pashland/data/www/g-shop.info/logs/error.log

# PM2 логи
pm2 logs g-shop-strapi
```

## Команди управління

```bash
# Зупинити додаток
pm2 stop g-shop-strapi

# Перезапустити додаток
pm2 restart g-shop-strapi

# Видалити з PM2
pm2 delete g-shop-strapi

# Переглянути детальну інформацію
pm2 describe g-shop-strapi
```

## Важливі примітки

1. Переконайтеся, що файл `.env.production` в директорії `backend/` має правильні налаштування бази даних та інші параметри
2. Якщо використовується SQLite база даних, переконайтеся що файл бази має правильні права доступу
3. Перевірте, що всі необхідні порти відкриті в файрволі
4. При використанні Nginx як реверс-проксі, налаштуйте його для роботи з сокетом

## Налаштування Nginx (якщо потрібно)

```nginx
upstream nodejs_app {
    server unix:/var/www/pashland/data/nodejs/0.sock;
}

server {
    listen 80;
    server_name g-shop.info www.g-shop.info;

    location / {
        proxy_pass http://nodejs_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
