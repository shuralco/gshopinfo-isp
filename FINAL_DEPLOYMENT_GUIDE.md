# 🚀 ФІНАЛЬНА ІНСТРУКЦІЯ ДЕПЛОЮ

## ✅ СТАТУС
- **Сайт працює**: https://g-shop.info
- **Admin**: https://g-shop.info/admin
- **GitHub**: https://github.com/shuralco/gshopinfo-isp

## 🔧 ЯК ДЕПЛОЇТИ

### Спосіб 1: GitHub Actions (Manual Run)
1. Перейдіть: https://github.com/shuralco/gshopinfo-isp/actions
2. Виберіть workflow: "Deploy to ISPManager (Working)"
3. Натисніть "Run workflow"
4. Виберіть branch: `main`
5. Натисніть зелену кнопку "Run workflow"

### Спосіб 2: SSH Deploy
```bash
ssh root@167.235.7.222
# Password: qaqa1234

cd /var/www/pashland/data/www/g-shop.info
git pull origin main
pkill -f "node.*strapi"
su - pashland -c "cd /var/www/pashland/data/www/g-shop.info && PORT=3002 node backend/node_modules/@strapi/strapi/bin/strapi.js start > /dev/null 2>&1 &"
```

## 📁 ФАЙЛИ КОНФІГУРАЦІЇ

### Branch Protection Rules
Файл `branch-protection-rules.json` містить 3 варіанти правил:
- **minimal** - мінімальний захист
- **recommended_safe** - рекомендовані з можливістю push
- **strict_with_bypass** - строгі з виключенням для адміна

### Налаштування правил GitHub:
1. https://github.com/shuralco/gshopinfo-isp/settings/branches
2. Add rule → Branch name pattern: `production`
3. Виберіть налаштування з `branch-protection-rules.json`
4. Save

## 🔐 SECRETS (вже налаштовані)
- SERVER_HOST = 167.235.7.222
- SERVER_USER = root  
- SERVER_PASSWORD = qaqa1234

## 🎯 ВАЖЛИВО
- GitHub Token потрібно створити новий: https://github.com/settings/tokens
- Workflows налаштовані на `main` гілку
- Для `production` гілки - змініть в workflows файлах

## 📊 ПЕРЕВІРКА
```bash
# Статус сайту
curl -I https://g-shop.info

# Процеси на сервері  
ssh root@167.235.7.222 "ps aux | grep strapi"

# GitHub Actions
https://github.com/shuralco/gshopinfo-isp/actions
```

---
**Сайт повністю функціональний!**