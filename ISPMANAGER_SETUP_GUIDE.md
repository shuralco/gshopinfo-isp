# 📋 ІНСТРУКЦІЯ ПРАВИЛЬНОГО НАЛАШТУВАННЯ STRAPI В ISPMANAGER

## 🎯 ПРАВИЛЬНА СТРУКТУРА ДЛЯ ISPMANAGER

ISPManager очікує, що Node.js додаток буде в кореневій папці сайту. Але зараз Strapi знаходиться в підпапці `/backend`. Є два варіанти вирішення:

---

## ✅ ВАРІАНТ 1: ПЕРЕНЕСТИ STRAPI В КОРІНЬ (РЕКОМЕНДОВАНО)

### Крок 1: Підготовка на сервері

```bash
# Підключіться по SSH
ssh root@167.235.7.222

# Перейдіть в папку сайту
cd /var/www/pashland/data/www/g-shop.info

# Зупиніть поточний Strapi
pkill -f strapi

# Створіть резервну копію
cp -r backend backend_backup_$(date +%Y%m%d)

# Перенесіть всі файли Strapi в корінь
mv backend/* .
mv backend/.* . 2>/dev/null

# Перенесіть public файли в папку public_html
mkdir -p public_html
mv public/* public_html/ 2>/dev/null

# Видаліть порожню папку backend
rmdir backend
```

### Крок 2: Налаштування в ISPManager

1. **Зайдіть в ISPManager → Node.js**

2. **Встановіть параметри:**
   ```
   Кореневий каталог: /var/www/pashland/data/www/g-shop.info
   Версія Node.js: 18.20.8
   Команда запуску: npm start
   Режим: production
   Порт/Socket: /var/www/pashland/data/nodejs/0.sock
   ```

3. **Змінні оточення (Environment Variables):**
   ```
   NODE_ENV=production
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS=toBeModified1,toBeModified2
   API_TOKEN_SALT=toBeModified
   ADMIN_JWT_SECRET=7iulq/cLsrBnmg1QUoWNQg==
   TRANSFER_TOKEN_SALT=toBeModified
   JWT_SECRET=KOimj8Zqy5YQfnJI5otR0w==
   DATABASE_CLIENT=sqlite
   DATABASE_FILENAME=.tmp/data.db
   USE_SOCKET=true
   SOCKET_PATH=/var/www/pashland/data/nodejs/0.sock
   ADMIN_URL=/admin
   STRAPI_ADMIN_BACKEND_URL=https://g-shop.info
   PUBLIC_URL=/admin
   SERVE_ADMIN=true
   ```

4. **Натисніть "Встановити пакети" в ISPManager**

5. **Натисніть "Запустити"**

---

## ✅ ВАРІАНТ 2: СТВОРИТИ WRAPPER В КОРЕНІ

### Крок 1: Створіть файли в корені

```bash
cd /var/www/pashland/data/www/g-shop.info
```

**Створіть `package.json` в корені:**
```json
{
  "name": "g-shop-wrapper",
  "version": "1.0.0",
  "description": "Wrapper for Strapi in backend folder",
  "main": "server.js",
  "scripts": {
    "start": "cd backend && npm start",
    "develop": "cd backend && npm run develop",
    "build": "cd backend && npm run build",
    "install": "cd backend && npm install"
  },
  "engines": {
    "node": ">=16.x.x <=20.x.x",
    "npm": ">=6.0.0"
  }
}
```

**Створіть `server.js` в корені:**
```javascript
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Change to backend directory
process.chdir(path.join(__dirname, 'backend'));

// Start Strapi
const strapi = spawn('npm', ['start'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    USE_SOCKET: 'true',
    SOCKET_PATH: '/var/www/pashland/data/nodejs/0.sock'
  }
});

strapi.on('error', (error) => {
  console.error('Failed to start Strapi:', error);
  process.exit(1);
});

strapi.on('close', (code) => {
  process.exit(code);
});
```

### Крок 2: В ISPManager

1. **Залиште кореневий каталог як є:**
   ```
   /var/www/pashland/data/www/g-shop.info
   ```

2. **Встановіть пакети та запустіть**

---

## 🔧 ДОДАТКОВІ НАЛАШТУВАННЯ

### Nginx конфігурація для ISPManager

В ISPManager → Nginx settings додайте:

```nginx
# API та Admin proxy
location /api {
    proxy_pass http://unix:/var/www/pashland/data/nodejs/0.sock:;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /admin {
    proxy_pass http://unix:/var/www/pashland/data/nodejs/0.sock:;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location /uploads {
    proxy_pass http://unix:/var/www/pashland/data/nodejs/0.sock:;
}

# Frontend files
location / {
    root /var/www/pashland/data/www/g-shop.info/public;
    try_files $uri $uri/ /index.html;
}
```

---

## 📦 ВСТАНОВЛЕННЯ ПАКЕТІВ ЧЕРЕЗ ISPMANAGER

### Якщо ISPManager пропонує встановити пакети:

1. **Натисніть "Встановити пакети"**
2. **Виберіть режим: Production**
3. **Дочекайтесь завершення**

### Якщо потрібно встановити додаткові пакети:

В ISPManager Terminal або SSH:

```bash
cd /var/www/pashland/data/www/g-shop.info/backend
npm install --production
```

---

## ✅ ПЕРЕВІРКА РОБОТИ

### 1. В ISPManager перевірте статус:
- Має показувати "Працює" 
- Socket файл має бути створений

### 2. Перевірте через браузер:
- Frontend: https://g-shop.info
- Admin: https://g-shop.info/admin
- API: https://g-shop.info/api/site-setting

### 3. Перевірте логи в ISPManager:
- Node.js → Логи
- Мають бути повідомлення про успішний старт

---

## 🚨 ЯКЩО ВИНИКЛИ ПРОБЛЕМИ

### Помилка: Cannot find module
```bash
cd /var/www/pashland/data/www/g-shop.info/backend
npm install
npm run build
```

### Помилка: Permission denied для socket
```bash
chown pashland:pashland /var/www/pashland/data/nodejs/0.sock
chmod 660 /var/www/pashland/data/nodejs/0.sock
```

### Помилка: 502 Bad Gateway
1. Перевірте чи працює Node.js в ISPManager
2. Перевірте логи: `tail -f /var/www/httpd-logs/g-shop.info.error.log`
3. Перезапустіть через ISPManager

---

## 📝 ФІНАЛЬНИЙ ЧЕКЛИСТ

- [ ] Strapi файли в правильній директорії
- [ ] package.json доступний в кореневій папці (або через wrapper)
- [ ] Environment variables налаштовані в ISPManager
- [ ] Node.js версія 18.20.8
- [ ] Socket mode включений
- [ ] Nginx правильно проксує запити
- [ ] Admin panel build виконано (`npm run build`)
- [ ] Права доступу правильні (user: pashland)
- [ ] ISPManager показує статус "Працює"

---

## 🎯 РЕЗУЛЬТАТ

Після правильного налаштування:
1. ISPManager буде автоматично керувати Strapi процесом
2. Автоматичний перезапуск при збоях
3. Моніторинг через ISPManager інтерфейс
4. Логи доступні в панелі
5. Оновлення через "Встановити пакети"

**Адмін доступ:**
- URL: https://g-shop.info/admin
- Email: vladpowerpro@gmail.com
- Password: Qaqaqa12