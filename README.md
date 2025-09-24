# Gardena Land - Production Deployment

## 📦 Package Contents

- `backend/` - Strapi CMS backend with SQLite database
- `frontend/` - Static frontend files  
- `nginx.conf` - Nginx configuration
- `ecosystem.config.js` - PM2 process manager config
- `deploy.sh` - Automated deployment script

## 🚀 Deployment Steps

### Prerequisites
- Ubuntu/Debian server
- Node.js 18+ and npm
- Nginx
- PM2 (`npm install -g pm2`)

### Quick Deploy
```bash
sudo ./deploy.sh
```

### Manual Deploy

1. **Upload files to server**
```bash
scp -r gardena-deployment-* user@server:/tmp/
```

2. **Install backend dependencies**
```bash
cd backend
npm install --production
```

3. **Configure environment**
```bash
cp .env.production .env
# Edit .env with your secrets
```

4. **Start Strapi with PM2**
```bash
pm2 start ecosystem.config.js
```

5. **Configure Nginx**
```bash
sudo cp nginx.conf /etc/nginx/sites-available/gardena
sudo ln -s /etc/nginx/sites-available/gardena /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 Security

1. Change all default keys in `.env`:
   - APP_KEYS
   - API_TOKEN_SALT
   - ADMIN_JWT_SECRET
   - TRANSFER_TOKEN_SALT
   - JWT_SECRET

2. Configure firewall:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

3. Setup SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d your-domain.com
```

## 📊 Database

The project uses SQLite database located at `backend/.tmp/data.db`

## 🐳 Docker (local preview)

1. **(Optional) Згенерувати контент для старту**
   ```bash
   npm install
   npm run prefetch
   ```
   > Створює `frontend/generated/content.{json,js}`. Якщо пропустити — фронтенд все одно підтягне дані напряму зі Strapi після запуску.

2. **Зібрати образи**
   ```bash
   docker-compose build
   ```

3. **Запустити контейнери**
   ```bash
   docker-compose up
   ```

4. **URL-и сервісів**
   - Frontend: http://localhost:8080
   - Strapi (admin/API): http://localhost:1337

Volumes `backend-uploads` та `backend-data` зберігають завантажені файли й SQLite між рестартами.

To backup:
```bash
cp backend/.tmp/data.db backup-$(date +%Y%m%d).db
```

## 🔧 Management

Start/Stop/Restart:
```bash
pm2 start gardena-strapi
pm2 stop gardena-strapi
pm2 restart gardena-strapi
pm2 logs gardena-strapi
```

## 📝 Admin Access

First admin user: 
- URL: http://your-domain.com/admin
- Create new admin on first visit

## 🌐 Frontend Updates

To update frontend only:
1. Upload new files to `/var/www/gardena/frontend/`
2. No restart needed

To update backend:
1. Upload files to `/var/www/gardena/backend/`
2. Run `pm2 restart gardena-strapi`
