# 📘 Повна інструкція: Налаштування Strapi на ISPManager

## 🎯 Проблема
ISPManager очікує `app.js` або `server.js` в кореневій директорії сайту, але Strapi зазвичай знаходиться в піддиректорії `/backend`

## ✅ Рішення

### 1. Структура файлів
```
/var/www/username/data/www/site.com/
├── app.js              # Entry point для ISPManager (створюємо)
├── package.json        # Wrapper package.json (створюємо)  
├── backend/            # Strapi CMS (ваш проєкт)
│   ├── package.json    # Основний package.json Strapi
│   ├── node_modules/
│   ├── config/
│   ├── src/
│   └── database.db
└── public/            # Статичні файли

```

### 2. Створіть `app.js` в корені
```javascript
#!/usr/bin/env node
// ISPManager wrapper для Strapi
const { spawn } = require('child_process');
const path = require('path');

// Переходимо в backend директорію
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

// Налаштування середовища
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3002';
process.env.HOST = '0.0.0.0';

// Запускаємо Strapi через npm
const npm = spawn('npm', ['start'], {
  cwd: backendPath,
  env: process.env,
  stdio: 'inherit'
});

npm.on('error', (err) => {
  console.error('Failed to start Strapi:', err);
  process.exit(1);
});

npm.on('exit', (code) => {
  process.exit(code);
});
```

### 3. Створіть wrapper `package.json` в корені
```json
{
  "name": "your-site-name",
  "version": "1.0.0",
  "description": "ISPManager wrapper for Strapi",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "install-backend": "cd backend && npm install"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 4. Переконайтесь що `backend/package.json` має start скрипт
```json
{
  "scripts": {
    "start": "strapi start",
    "build": "strapi build",
    "develop": "strapi develop"
  }
}
```

## 🚀 Покрокова інструкція для ISPManager

### Крок 1: Створення сайту
1. В ISPManager → **Сайти** → **Створити сайт**
2. **Обробник**: Node.js
3. **Версія Node.js**: 18.20.8 або вище
4. **Спосіб підключення**: 
   - **Порт** (рекомендовано для Strapi)
   - АБО **Сокет файл** (потребує додаткового налаштування)

### Крок 2: Завантаження файлів
1. **Сайти** → Виберіть сайт → **Файли сайту**
2. Завантажте ваш проєкт (або клонуйте через git)
3. Створіть `app.js` та `package.json` в корені (код вище)

### Крок 3: Встановлення залежностей
1. **Через ISPManager**:
   - Сайти → Виберіть сайт → **...** → **Npm install**
   
2. **АБО через SSH**:
   ```bash
   cd /var/www/username/data/www/site.com/backend
   npm install
   npm run build  # для Strapi
   ```

### Крок 4: Налаштування Nginx
ISPManager автоматично створює конфігурацію, але для Strapi потрібні додаткові location:

```nginx
# В /etc/nginx/vhosts/username/site.com.conf
location /admin {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location /api {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /uploads {
    proxy_pass http://localhost:3002;
}

# Для всіх Strapi routes
location ~ ^/(content-manager|content-type-builder|upload|users-permissions|i18n|email|admin-roles) {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
}
```

### Крок 5: Створення .env файлу
В `backend/.env`:
```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3002
APP_KEYS=your-random-keys-here
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
JWT_SECRET=your-jwt-secret
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=./database.db
```

### Крок 6: Запуск
1. **ISPManager**: Сайти → Виберіть сайт → **...** → **Restart (Node.js)**
2. **Перевірка**: Зелена іконка Node.js = працює

## 🔍 Діагностика

### Перевірка через pm2
```bash
su - username
/usr/lib/ispnodejs/bin/pm2 list
/usr/lib/ispnodejs/bin/pm2 info site.com
```

### Логи
```bash
# Логи pm2
/var/www/username/data/.pm2/logs/site.com-out.log
/var/www/username/data/.pm2/logs/site.com-error.log

# Логи Strapi  
/var/www/username/data/www/site.com/backend/logs/
```

### Перевірка портів
```bash
netstat -tlpn | grep 3002
ps aux | grep node | grep site.com
```

## ⚠️ Типові проблеми

### 1. MODULE_NOT_FOUND
**Причина**: ISPManager не знаходить модулі
**Рішення**: Використовуйте абсолютні шляхи або spawn з npm

### 2. Порт зайнятий
**Причина**: Старий процес не зупинився
**Рішення**: 
```bash
pkill -f "node.*site.com"
# АБО через pm2
/usr/lib/ispnodejs/bin/pm2 delete site.com
```

### 3. 502 Bad Gateway
**Причина**: Nginx не може підключитись до Node.js
**Рішення**: Перевірте порт в .env та nginx конфігурації

### 4. Сокет файл не працює
**Причина**: Strapi погано працює з Unix sockets
**Рішення**: Використовуйте режим "Порт" замість "Сокет файл"

## 📝 Фінальний чеклист

- [ ] `app.js` створено в корені сайту
- [ ] `package.json` wrapper створено в корені
- [ ] `backend/package.json` має "start" скрипт
- [ ] `.env` файл налаштовано
- [ ] Nginx має правильні proxy_pass директиви
- [ ] Node.js версія >= 18.0.0
- [ ] База даних доступна (SQLite або інша)
- [ ] Права доступу правильні (chown -R username:username)

## 🎯 Результат
Після виконання всіх кроків:
- Сайт доступний на http://site.com
- Admin панель на http://site.com/admin
- API на http://site.com/api

---

**Ця інструкція працює для:**
- Strapi v4.x
- Next.js + Strapi
- Будь-який Node.js проєкт з піддиректорією