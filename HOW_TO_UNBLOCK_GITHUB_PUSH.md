# 🔓 ЯК РОЗБЛОКУВАТИ ПРАВА ДЛЯ PUSH В GITHUB

## 📝 Що потрібно зробити

### Варіант 1: ВИДАЛИТИ правила (найпростіше)
1. Перейдіть на: **https://github.com/shuralco/gshopinfo-isp/settings/branches**
2. Знайдіть "Branch protection rules"
3. Побачите правило для `production` (Набір правил 1)
4. Натисніть на нього
5. Прокрутіть вниз і натисніть **"Delete rule"** (червона кнопка)

### Варіант 2: ЗМІНИТИ правила
1. Перейдіть на: **https://github.com/shuralco/gshopinfo-isp/settings/branches**
2. Натисніть на правило для `production`
3. Змініть налаштування:
   - **ВІДКЛЮЧІТЬ** ☐ Require a pull request before merging
   - **ВІДКЛЮЧІТЬ** ☐ Require approvals
   - **АБО** додайте себе до виключень внизу сторінки
4. Натисніть "Save changes"

### Варіант 3: ДОДАТИ виключення для себе
1. В правилах для `production`
2. Знайдіть секцію **"Bypass list"** або **"Allow specified actors to bypass"**
3. Додайте користувача `shuralco`
4. Збережіть

## 🚀 Після розблокування

Зможете робити push напряму:
```bash
git checkout production
git add .
git commit -m "Your changes"
git push origin production  # Це запустить автоматичний деплой!
```

## 🔍 Перевірка статусу правил

Перейдіть на: https://github.com/shuralco/gshopinfo-isp/settings/branches

Якщо бачите:
- ✅ **No branch protection rules** - все добре, можна push
- ⚠️ **1 rule** - є правило, потрібно змінити або видалити

## 💡 Альтернативи (якщо не можете змінити)

### Manual Deploy через GitHub Actions:
1. https://github.com/shuralco/gshopinfo-isp/actions
2. Виберіть "Deploy to ISPManager (Working)"
3. Run workflow → виберіть branch `main` → Run

### Direct SSH Deploy:
```bash
sshpass -p "qaqa1234" ssh root@167.235.7.222 << 'EOF'
cd /var/www/pashland/data/www/g-shop.info
git pull origin main
pkill -f "node.*strapi"
su - pashland -c "cd /var/www/pashland/data/www/g-shop.info && PORT=3002 node backend/node_modules/@strapi/strapi/bin/strapi.js start > /dev/null 2>&1 &"
EOF
```

## 📌 Швидкі посилання

- **Налаштування гілок**: https://github.com/shuralco/gshopinfo-isp/settings/branches
- **GitHub Actions**: https://github.com/shuralco/gshopinfo-isp/actions
- **Репозиторій**: https://github.com/shuralco/gshopinfo-isp

---
**РЕКОМЕНДАЦІЯ**: Просто видаліть правило для `production` - це найшвидше!