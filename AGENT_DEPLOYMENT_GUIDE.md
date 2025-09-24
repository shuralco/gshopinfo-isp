# 🚀 ПОВНА ІНСТРУКЦІЯ ДЛЯ АГЕНТІВ: ДЕПЛОЙ G-SHOP.INFO

## 📋 ПОТОЧНИЙ СТАН ПРОЕКТУ

### ✅ Що вже готово:
1. **Повний код проекту** - Strapi CMS + Frontend
2. **Git репозиторій** - локально ініціалізовано з початковим commit
3. **GitHub Actions** - налаштовані workflow для автоматичного деплою
4. **Документація** - всі необхідні інструкції та конфігурації
5. **ISPManager конфігурація** - готові скрипти для інтеграції

### ❌ Що потрібно зробити:
1. Створити GitHub репозиторій
2. Налаштувати GitHub Secrets
3. Запушити код на GitHub
4. Налаштувати ISPManager
5. Перевірити автоматичний деплой

---

## 🔧 КРОК 1: СТВОРЕННЯ GITHUB РЕПОЗИТОРІЮ

### Варіант А: Через веб-інтерфейс GitHub
1. Зайдіть на https://github.com
2. Увійдіть в акаунт `pashlandus`
3. Натисніть "New repository"
4. Введіть назву: `gshopinfo-isp`
5. Виберіть "Public"
6. **НЕ** ініціалізуйте з README (у нас вже є)
7. Створіть репозиторій

### Варіант Б: Через GitHub CLI
```bash
# Встановити GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Авторизуватись
gh auth login

# Створити репозиторій
gh repo create pashlandus/gshopinfo-isp --public --source=. --remote=origin --push
```

---

## 📤 КРОК 2: ЗАВАНТАЖЕННЯ КОДУ НА GITHUB

```bash
cd /home/lionex/projects/gshopinfo-isp

# Якщо репозиторій створено через веб-інтерфейс
git remote set-url origin https://github.com/pashlandus/gshopinfo-isp.git
git push -u origin main

# Якщо через CLI - код вже завантажено
```

---

## 🔐 КРОК 3: НАЛАШТУВАННЯ GITHUB SECRETS

### Генерація SSH ключів:
```bash
# Виконати локально
cd /home/lionex/projects/gshopinfo-isp
./scripts/setup-deployment.sh

# Скрипт видасть:
# 1. Приватний ключ для GitHub Secrets
# 2. Публічний ключ для сервера
# 3. Fingerprint сервера
```

### Додавання секретів на GitHub:
1. Перейдіть на https://github.com/pashlandus/gshopinfo-isp/settings/secrets/actions
2. Додайте наступні секрети:

| Назва секрету | Значення |
|--------------|----------|
| `SSH_PRIVATE_KEY` | Приватний ключ зі скрипту setup-deployment.sh |
| `SERVER_HOST` | `167.235.7.222` |
| `SERVER_USER` | `root` |
| `SERVER_PASSWORD` | `qaqa1234` |
| `KNOWN_HOSTS` | Fingerprint зі скрипту |

---

## 🖥️ КРОК 4: НАЛАШТУВАННЯ СЕРВЕРА

### SSH підключення до сервера:
```bash
ssh root@167.235.7.222
# Пароль: qaqa1234
```

### Додавання SSH ключа (якщо використовуєте ключі):
```bash
mkdir -p /root/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> /root/.ssh/authorized_keys
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys
```

### Створення необхідних директорій:
```bash
# Директорія для бекапів
mkdir -p /var/www/pashland/backups/gshop

# Директорія для Node.js сокета
mkdir -p /var/www/pashland/data/nodejs
chown pashland:pashland /var/www/pashland/data/nodejs

# Основна директорія проекту
mkdir -p /var/www/pashland/data/www/g-shop.info
chown -R pashland:pashland /var/www/pashland/data/www/g-shop.info
```

### Створення файлу оточення:
```bash
cat > /var/www/pashland/data/www/g-shop.info/backend/.env << 'EOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=3002
APP_KEYS=your-random-app-keys-here
API_TOKEN_SALT=your-random-api-token-salt
ADMIN_JWT_SECRET=your-random-admin-jwt-secret
JWT_SECRET=your-random-jwt-secret
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=./database.db
STRAPI_ADMIN_BACKEND_URL=https://g-shop.info
USE_SOCKET=true
SOCKET_PATH=/var/www/pashland/data/nodejs/0.sock
EOF
```

### Генерація випадкових ключів:
```bash
# Для кожного секретного ключа
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ⚙️ КРОК 5: НАЛАШТУВАННЯ ISPMANAGER

### В панелі ISPManager:
1. Увійдіть в ISPManager
2. Перейдіть в розділ "WWW домени"
3. Знайдіть домен `g-shop.info`
4. Налаштування Node.js:
   - **Версія Node.js**: 18.20.8 або вище
   - **Точка входу**: `app.js`
   - **Робоча директорія**: `/var/www/pashland/data/www/g-shop.info`
   - **Режим**: Production
   - **Порт**: Автоматично (Socket)

### Оновлення Nginx конфігурації:
```bash
# Замінити конфігурацію nginx
cp /home/lionex/projects/gshopinfo-isp/nginx_optimal.conf /etc/nginx/vhosts/pashland/g-shop.info.conf

# Перевірити конфігурацію
nginx -t

# Перезавантажити nginx
systemctl reload nginx
```

---

## 🚀 КРОК 6: ПЕРШИЙ ДЕПЛОЙ

### Ручний деплой (для тестування):
```bash
cd /var/www/pashland/data/www/g-shop.info

# Клонувати репозиторій
git clone https://github.com/pashlandus/gshopinfo-isp.git .

# Встановити залежності backend
cd backend
npm install
npm run build

# Створити початкову базу даних
npm run strapi admin:create-user -- \
  --email=vladpowerpro@gmail.com \
  --password=Qaqaqa12 \
  --firstname=Admin \
  --lastname=User

# Запустити через ISPManager
# В панелі ISPManager натиснути "Перезапустити" для Node.js додатку
```

### Автоматичний деплой через GitHub Actions:
1. Зробіть будь-яку зміну в коді
2. Закомітьте та запушіть:
```bash
git add .
git commit -m "Trigger deployment"
git push origin main
```
3. Перейдіть на https://github.com/pashlandus/gshopinfo-isp/actions
4. Спостерігайте за процесом деплою

---

## ✅ КРОК 7: ПЕРЕВІРКА

### Перевірка фронтенду:
```bash
curl -I https://g-shop.info
# Повинен повернути 200 OK
```

### Перевірка API:
```bash
curl https://g-shop.info/api/
# Повинен повернути JSON
```

### Перевірка адмін панелі:
1. Відкрийте https://g-shop.info/admin
2. Увійдіть:
   - Email: `vladpowerpro@gmail.com`
   - Password: `Qaqaqa12`

### Перевірка автоматичного деплою:
```bash
# На сервері
tail -f /var/www/pashland/data/www/g-shop.info/logs/deployment.log
```

---

## 🔥 ШВИДКИЙ СТАРТ (ВСІ КОМАНДИ)

```bash
# 1. НА ЛОКАЛЬНІЙ МАШИНІ
cd /home/lionex/projects/gshopinfo-isp

# Створити GitHub репозиторій (якщо є gh)
gh auth login
gh repo create pashlandus/gshopinfo-isp --public --source=. --remote=origin --push

# Або запушити в існуючий
git remote set-url origin https://github.com/pashlandus/gshopinfo-isp.git
git push -u origin main

# Згенерувати SSH ключі
./scripts/setup-deployment.sh

# 2. НА GITHUB
# Додати secrets в https://github.com/pashlandus/gshopinfo-isp/settings/secrets/actions

# 3. НА СЕРВЕРІ (SSH)
ssh root@167.235.7.222

# Підготувати директорії
mkdir -p /var/www/pashland/backups/gshop
mkdir -p /var/www/pashland/data/nodejs
mkdir -p /var/www/pashland/data/www/g-shop.info
chown -R pashland:pashland /var/www/pashland/data

# Клонувати та запустити
cd /var/www/pashland/data/www/g-shop.info
git clone https://github.com/pashlandus/gshopinfo-isp.git .
cd backend
npm install
npm run build

# 4. В ISPMANAGER
# Створити Node.js додаток для g-shop.info

# 5. ТРИГЕР АВТОДЕПЛОЮ
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

---

## 🐛 ВИРІШЕННЯ ПРОБЛЕМ

### Помилка 502 Bad Gateway:
```bash
# Перевірити чи працює Node.js
ps aux | grep node

# Перевірити логи
tail -f /var/www/pashland/data/www/g-shop.info/logs/error.log

# Перезапустити через ISPManager
```

### Не працює автодеплой:
```bash
# Перевірити GitHub Actions
# https://github.com/pashlandus/gshopinfo-isp/actions

# Перевірити SSH доступ
ssh -i ~/.ssh/deploy_key root@167.235.7.222
```

### База даних відсутня:
```bash
cd /var/www/pashland/data/www/g-shop.info/backend
npm run strapi admin:create-user -- \
  --email=vladpowerpro@gmail.com \
  --password=Qaqaqa12 \
  --firstname=Admin \
  --lastname=User
```

### Nginx помилки:
```bash
nginx -t
systemctl reload nginx
tail -f /var/log/nginx/error.log
```

---

## 📞 КОНТАКТИ ТА ПІДТРИМКА

- **Сервер**: 167.235.7.222 (root/qaqa1234)
- **GitHub**: https://github.com/pashlandus/gshopinfo-isp
- **Сайт**: https://g-shop.info
- **Admin**: https://g-shop.info/admin (vladpowerpro@gmail.com/Qaqaqa12)

---

## 📝 ВАЖЛИВІ ФАЙЛИ

| Файл | Опис |
|------|------|
| `.github/workflows/deploy-production.yml` | GitHub Actions для автодеплою |
| `nginx_optimal.conf` | Оптимізована конфігурація Nginx |
| `scripts/deploy-ispmanager.sh` | Скрипт деплою для ISPManager |
| `backend/.env` | Змінні оточення (створити на сервері) |
| `package.json` | Wrapper для ISPManager |

---

## ✨ ФІНАЛЬНА ПЕРЕВІРКА

- [ ] GitHub репозиторій створено
- [ ] Код запушено на GitHub
- [ ] GitHub Secrets налаштовано
- [ ] SSH ключі додано на сервер
- [ ] ISPManager Node.js додаток створено
- [ ] Nginx конфігурація оновлена
- [ ] База даних створена
- [ ] Admin користувач створений
- [ ] Автодеплой працює
- [ ] Сайт доступний за адресою https://g-shop.info

**Після виконання всіх кроків сайт буде автоматично оновлюватись при кожному push в main гілку GitHub!**