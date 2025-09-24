# 🚀 ISPManager Deployment Guide for Strapi + Next.js Projects

## 📋 Prerequisites

- ISPManager with Node.js support
- Domain configured in ISPManager
- SSH access to server
- Git repository with your project

## 🏗️ Project Structure Requirements

Your project must have this structure for ISPManager compatibility:

```
/var/www/username/data/www/your-site.com/
├── app.js              # ISPManager entry point (we'll create this)
├── package.json        # Wrapper package.json (we'll create this)
├── backend/            # Strapi CMS
│   ├── package.json
│   ├── node_modules/
│   ├── config/
│   ├── src/
│   └── .env
└── frontend/          # Next.js (optional, can be separate)
    ├── package.json
    └── node_modules/
```

## 📝 Step-by-Step Deployment

### Step 1: Create Site in ISPManager

1. Login to ISPManager
2. Navigate to **Sites** → **Create Site**
3. Configure:
   - **Domain**: your-site.com
   - **Handler**: Node.js
   - **Node.js Version**: 18.20.8 or higher
   - **Connection Method**: Port (recommended) or Socket
   - **Port**: 3002 (or any available port)

### Step 2: Prepare Entry Point Files

#### Create `app.js` in root directory:

```javascript
#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Navigate to backend directory
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3002';
process.env.HOST = '0.0.0.0';

// Start Strapi using npm
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

#### Create wrapper `package.json` in root:

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "ISPManager wrapper for Strapi",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "install-all": "cd backend && npm install",
    "build": "cd backend && npm run build"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 3: Configure Strapi

#### Update `backend/package.json`:

```json
{
  "scripts": {
    "start": "strapi start",
    "build": "strapi build",
    "develop": "strapi develop"
  }
}
```

#### Create `backend/.env`:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3002
APP_KEYS=your-random-keys-here
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
JWT_SECRET=your-jwt-secret
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=./.tmp/data.db
```

### Step 4: Deploy Code

#### Option A: Via Git (Recommended)

```bash
# SSH to server
ssh username@server-ip

# Navigate to site directory
cd /var/www/username/data/www/your-site.com

# Clone repository
git clone https://github.com/yourusername/yourrepo.git .

# Create wrapper files
# (Create app.js and package.json as shown above)
```

#### Option B: Upload Files

Use ISPManager File Manager to upload your project files.

### Step 5: Install Dependencies

#### Via ISPManager:
1. Go to **Sites** → Select your site
2. Click **...** → **NPM Install**

#### Via SSH:
```bash
cd /var/www/username/data/www/your-site.com/backend
npm install
npm run build
```

### Step 6: Configure Nginx

Add these locations to your Nginx configuration:

```nginx
# File: /etc/nginx/vhosts/username/your-site.com.conf

# Strapi Admin Panel
location /admin {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Strapi API
location /api {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Strapi Uploads
location /uploads {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}

# Other Strapi routes
location ~ ^/(content-manager|content-type-builder|upload|users-permissions|i18n|email) {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Step 7: Start Application

1. In ISPManager: **Sites** → Select site → **...** → **Restart (Node.js)**
2. Check status: Green Node.js icon = Running

## 🔧 Troubleshooting

### Problem: MODULE_NOT_FOUND Error

**Symptom**: ISPManager shows error "Cannot find module"

**Solution**: 
- Ensure `app.js` exists in root directory
- Check that `backend` folder exists
- Verify paths in `app.js` are correct

### Problem: Port Already in Use

**Symptom**: Error "EADDRINUSE: address already in use"

**Solution**:
```bash
# Kill old processes
pkill -f "node.*your-site"

# Or find and kill specific process
netstat -tlpn | grep 3002
kill -9 <PID>
```

### Problem: 502 Bad Gateway

**Symptom**: Nginx returns 502 error

**Solution**:
- Check if Node.js app is running (green icon in ISPManager)
- Verify port in `.env` matches Nginx config
- Check pm2 logs:
```bash
su - username
/usr/lib/ispnodejs/bin/pm2 logs
```

### Problem: Database Errors

**Symptom**: Strapi can't connect to database

**Solution**:
- Check database file permissions:
```bash
chown -R username:username /var/www/username/data/www/your-site.com/backend/.tmp
chmod 755 /var/www/username/data/www/your-site.com/backend/.tmp
```

## 📊 Monitoring

### Check Application Status
```bash
# As user
su - username
/usr/lib/ispnodejs/bin/pm2 list
/usr/lib/ispnodejs/bin/pm2 info your-site.com
```

### View Logs
```bash
# PM2 logs
/var/www/username/data/.pm2/logs/your-site.com-out.log
/var/www/username/data/.pm2/logs/your-site.com-error.log

# Strapi logs
/var/www/username/data/www/your-site.com/backend/logs/
```

### Monitor Resources
```bash
/usr/lib/ispnodejs/bin/pm2 monit
```

## 🔄 Continuous Deployment

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to ISPManager

on:
  push:
    branches: [ main, production ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Server
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        password: ${{ secrets.SERVER_PASSWORD }}
        port: 22
        script: |
          cd /var/www/username/data/www/your-site.com
          git pull origin main
          cd backend
          npm install
          npm run build
          
          # Restart via pm2
          su - username -c "/usr/lib/ispnodejs/bin/pm2 restart your-site.com"
```

### Required GitHub Secrets
- `SERVER_HOST`: Your server IP
- `SERVER_USER`: SSH username
- `SERVER_PASSWORD`: SSH password

## ✅ Deployment Checklist

Before deployment:
- [ ] Backend code tested locally
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Nginx configuration prepared

During deployment:
- [ ] Create site in ISPManager
- [ ] Upload/clone code
- [ ] Create `app.js` wrapper
- [ ] Create wrapper `package.json`
- [ ] Install dependencies
- [ ] Build Strapi (`npm run build`)
- [ ] Configure Nginx
- [ ] Set correct file permissions

After deployment:
- [ ] Test admin panel: https://your-site.com/admin
- [ ] Test API: https://your-site.com/api
- [ ] Check logs for errors
- [ ] Verify auto-restart on server reboot
- [ ] Set up monitoring/alerts

## 🛡️ Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique keys
   - Rotate keys regularly

2. **File Permissions**
   ```bash
   chown -R username:username /var/www/username/data/www/your-site.com
   chmod 750 /var/www/username/data/www/your-site.com
   chmod 640 /var/www/username/data/www/your-site.com/backend/.env
   ```

3. **Database Security**
   - Use PostgreSQL/MySQL for production
   - Regular backups
   - Restrict database access

4. **API Security**
   - Enable rate limiting
   - Use API tokens
   - Configure CORS properly

## 📚 Additional Resources

- [ISPManager Documentation](https://ispmanager.com/docs)
- [Strapi Deployment Guide](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment.html)
- [PM2 Documentation](https://pm2.keymetrics.io/)

## 🆘 Common Commands Reference

```bash
# Restart application
su - username -c "/usr/lib/ispnodejs/bin/pm2 restart your-site.com"

# View logs
tail -f /var/www/username/data/.pm2/logs/your-site.com-out.log

# Check status
/usr/lib/ispnodejs/bin/pm2 status

# Rebuild Strapi
cd /var/www/username/data/www/your-site.com/backend && npm run build

# Clear Strapi cache
cd /var/www/username/data/www/your-site.com/backend && rm -rf .cache && npm run build
```

---

**Note**: Replace `username`, `your-site.com`, and port numbers with your actual values.