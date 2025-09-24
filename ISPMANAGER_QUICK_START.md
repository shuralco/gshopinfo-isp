# ⚡ ISPManager Quick Start Guide

## 🎯 5-Minute Setup for Strapi on ISPManager

### Prerequisites
- ISPManager account with Node.js enabled
- SSH access
- Git repository with Strapi project

### Quick Commands

```bash
# 1. SSH to server
ssh username@your-server-ip

# 2. Navigate to site directory
cd /var/www/username/data/www/your-site.com

# 3. Clone your repository
git clone https://github.com/yourusername/yourrepo.git .

# 4. Create app.js file
cat > app.js << 'EOF'
#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);
process.env.NODE_ENV = 'production';
process.env.PORT = '3002';
process.env.HOST = '0.0.0.0';
const npm = spawn('npm', ['start'], {
  cwd: backendPath,
  env: process.env,
  stdio: 'inherit'
});
npm.on('error', (err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
EOF

# 5. Create wrapper package.json
cat > package.json << 'EOF'
{
  "name": "site-wrapper",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  }
}
EOF

# 6. Install dependencies and build
cd backend
npm install
npm run build

# 7. Create .env file
cat > .env << 'EOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=3002
APP_KEYS=random-key-1,random-key-2,random-key-3,random-key-4
API_TOKEN_SALT=random-salt
ADMIN_JWT_SECRET=random-secret
JWT_SECRET=random-jwt
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=./.tmp/data.db
EOF

# 8. Set permissions
cd ../..
chown -R username:username your-site.com
```

### ISPManager Settings

1. **Create Site**:
   - Handler: Node.js
   - Version: 18+
   - Connection: Port
   - Port: 3002

2. **Start Application**:
   - Sites → Your Site → Restart (Node.js)

### Nginx Quick Config

Add to `/etc/nginx/vhosts/username/your-site.com.conf`:

```nginx
location ~ ^/(admin|api|uploads|content-manager|content-type-builder|upload|users-permissions|i18n|email) {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Test Your Deployment

```bash
# Check if running
curl http://localhost:3002/admin

# Check pm2 status
su - username -c "/usr/lib/ispnodejs/bin/pm2 list"

# View logs
tail -f /var/www/username/data/.pm2/logs/*.log
```

### Common Fixes

**Port in use?**
```bash
pkill -f "node.*strapi"
```

**Module not found?**
```bash
# Make sure app.js is in root, not in backend/
ls -la /var/www/username/data/www/your-site.com/app.js
```

**502 Bad Gateway?**
```bash
# Restart via pm2
su - username -c "/usr/lib/ispnodejs/bin/pm2 restart all"
```

---

✅ **Success Indicators:**
- Green Node.js icon in ISPManager
- Admin panel accessible at `/admin`
- API responding at `/api`