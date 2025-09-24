# 🔍 АНАЛІЗ ПРОБЛЕМИ БЕЗКІНЕЧНОГО СПІНЕРА В АДМІН ПАНЕЛІ

## ✅ Що було зроблено для виправлення

1. **Виправлено конфігурацію для ISPManager**
   - Strapi тепер працює через Unix socket замість порту
   - Налаштовано правильні права доступу до socket файлу
2. **Виправлено помилки 502 Bad Gateway**
   - Оновлено nginx конфігурацію
   - Виправлено права доступу для користувача apache
   - Додано проксування всіх admin API (`/content-manager`, `/content-type-builder`, `/users-permissions`, `/i18n`, `/upload`)
3. **Перебудовано адмін панель**
   - Очищено всі кеші
   - Додано правильні environment variables (`ADMIN_JWT_SECRET`, `STRAPI_ADMIN_BACKEND_URL`)
   - Виконано clean build
4. **Налаштовано правильні URL**
   - Видалено всі посилання на localhost
   - Налаштовано абсолютні URL для API
5. **Додано попереднє наповнення контенту (SSG)**
   - Скрипт `scripts/prefetch-strapi.js` забирає дані зі Strapi під час `npm run build`
   - Згенеровані файли `frontend/generated/content.{json,js}` одразу містять актуальний контент для hero, site settings, features тощо
   - `dynamic-loader.js` прогріває DOM із локального кешу і лише потім оновлює дані напряму зі Strapi при потребі

## 📋 Для перевірки вручну

1. Відкрити в режимі інкогніто: https://g-shop.info/admin
2. Увійти з використанням:
   - Email: `vladpowerpro@gmail.com`
   - Password: `Qaqaqa12`
3. Натиснути `Login` та пересвідчитись, що дашборд завантажується без спінера

⚠️ Якщо все ще спостерігається безкінечний спінер, проблема ймовірно у frontend частині адмін панелі й потребує аналізу JavaScript помилок у консолі браузера. Всі backend компоненти налаштовані правильно.

## 🚨 Фактична причина інциденту

- Admin панель після логіну викликає API маршрути поза `/admin` (наприклад, `/content-manager/content-types`), але `nginx` їх віддавав як статичну сторінку. В результаті UI отримував HTML замість JSON і зависав на спінері.
- Виправлено: додано явне проксування всіх службових префіксів Strapi до бекенду/сокета. Перевірка `curl https://g-shop.info/content-manager/content-types` тепер повертає JSON.

## 📋 СПИСОК МОЖЛИВИХ ПРИЧИН

### 1. ❌ **WebSocket/SSE з'єднання**
- **Проблема**: Адмін панель намагається встановити real-time з'єднання через WebSocket або Server-Sent Events
- **Симптоми**: Консоль показує помилки EventSource, WebSocket connection failed
- **Рішення**: 
  - Перевірити налаштування nginx для WebSocket proxying
  - Додати headers: `Upgrade`, `Connection`
  - Вимкнути SSE в конфігурації Strapi

### 2. ❌ **CORS (Cross-Origin Resource Sharing)**
- **Проблема**: Frontend на https://g-shop.info не може отримати доступ до API через CORS політики
- **Симптоми**: В консолі помилки "CORS policy", "Access-Control-Allow-Origin"
- **Рішення**:
  - Додати CORS headers в nginx
  - Налаштувати CORS в Strapi config/middlewares.js
  - Додати `https://g-shop.info` в allowed origins

### 3. ❌ **Неправильні API endpoints**
- **Проблема**: Admin panel шукає API на неправильній адресі (localhost:1337 замість https://g-shop.info)
- **Симптоми**: 404 помилки для API запитів, failed to fetch
- **Рішення**:
  - Перебудувати admin з STRAPI_ADMIN_BACKEND_URL=https://g-shop.info
  - Перевірити що в build файлах немає localhost посилань

### 4. ❌ **JWT Token проблеми**
- **Проблема**: Токен авторизації не зберігається або не передається правильно
- **Симптоми**: 401 Unauthorized після логіну, постійні редіректи на логін
- **Рішення**:
  - Перевірити JWT_SECRET та ADMIN_JWT_SECRET в .env
  - Перевірити localStorage/sessionStorage в браузері
  - Налаштувати правильні cookies settings

### 5. ❌ **Socket vs Port конфлікт**
- **Проблема**: ISPManager очікує socket, але Strapi намагається використовувати port
- **Симптоми**: 502 Bad Gateway, connection refused
- **Рішення**:
  - Переконатись що USE_SOCKET=true
  - Перевірити права на /var/www/pashland/data/nodejs/0.sock
  - Правильно налаштувати proxy_pass в nginx

### 6. ❌ **Кешування браузера**
- **Проблема**: Старі JS файли кешовані в браузері з неправильними endpoints
- **Симптоми**: Працює в інкогніто але не в звичайному режимі
- **Рішення**:
  - Очистити кеш браузера повністю
  - Додати cache-busting headers в nginx
  - Використати версіонування для JS файлів

### 7. ❌ **Permissions/Roles проблеми**
- **Проблема**: Користувач не має правильних permissions для доступу до dashboard
- **Симптоми**: Логін успішний але dashboard не завантажується
- **Рішення**:
  - Перевірити роль користувача в базі даних
  - Переконатись що користувач має Super Admin роль
  - Перевірити permissions в Strapi admin

### 8. ❌ **Database connection**
- **Проблема**: Strapi не може підключитись до бази даних після логіну
- **Симптоми**: Timeout помилки, database connection lost
- **Рішення**:
  - Перевірити database.js конфігурацію
  - Переконатись що SQLite файл доступний
  - Перевірити права на .tmp/data.db

### 9. ❌ **Nginx proxy timeout**
- **Проблема**: Nginx закриває з'єднання занадто швидко
- **Симптоми**: 504 Gateway Timeout, connection reset
- **Рішення**:
  - Збільшити proxy_read_timeout
  - Додати proxy_connect_timeout 600s
  - Налаштувати keepalive

### 10. ❌ **React Router проблеми**
- **Проблема**: Admin panel React app не може правильно навігувати після логіну
- **Симптоми**: URL змінюється але сторінка не завантажується
- **Рішення**:
  - Перевірити базовий URL в React app
  - Налаштувати правильний basename для Router
  - Перебудувати admin з правильним PUBLIC_URL

## 🔧 ЩО ВЖЕ БУЛО ЗРОБЛЕНО:

✅ Налаштовано Unix socket замість порту  
✅ Виправлено права доступу до socket (apache:apache)  
✅ Додано всі необхідні environment variables  
✅ Перебудовано admin panel з clean build  
✅ Видалено всі посилання на localhost  
✅ Виправлено nginx proxy конфігурацію  
✅ Вимкнено rate limiting  

## 🎯 НАЙІМОВІРНІШІ ПРИЧИНИ:

На основі симптомів (логін працює, API відповідає, але dashboard показує безкінечний спінер), найімовірніші причини:

1. **WebSocket/SSE проблема** - адмін панель чекає на real-time з'єднання
2. **CORS блокування** - frontend не може отримати дані з API
3. **React Router / базовий URL** - неправильна навігація після логіну

## 📝 НАСТУПНІ КРОКИ ДЛЯ ДІАГНОСТИКИ:

1. **Відкрити консоль браузера** (F12) і перевірити:
   - Вкладка Console - червоні помилки
   - Вкладка Network - failed запити (червоні)
   - Вкладка Application - localStorage/sessionStorage

2. **Перевірити конкретні помилки**:
   ```javascript
   // В консолі браузера після логіну:
   localStorage.getItem('jwtToken')
   sessionStorage.getItem('jwtToken')
   ```

3. **Перевірити API відповідь**:
   ```bash
   curl -H "Authorization: Bearer [TOKEN]" https://g-shop.info/admin/users/me
   ```

4. **Перевірити WebSocket**:
   - Вкладка Network → WS
   - Подивитись чи є спроби WebSocket з'єднання

## 💡 ШВИДКЕ РІШЕННЯ:

Якщо проблема в WebSocket/SSE, можна спробувати вимкнути real-time features:

```javascript
// В /backend/config/server.js
module.exports = {
  // ...
  admin: {
    watchIgnoreFiles: ['**/node_modules/**'],
    features: {
      SSE: false, // Вимкнути Server-Sent Events
      websocket: false // Вимкнути WebSocket
    }
  }
};
```

Потім перебудувати admin panel і перезапустити Strapi.
