# Deployment Guide for G-Shop.info on ISPManager

This guide explains how to set up automatic deployment from GitHub to ISPManager hosting.

## Overview

The deployment system uses GitHub Actions to automatically deploy code changes to the ISPManager server when pushing to the main branch.

### Architecture

- **Backend**: Strapi CMS running on port 1337 (proxied through ISPManager socket)
- **Frontend**: Static files served from `/public` directory
- **Database**: SQLite (preserved during deployments)
- **File Storage**: Uploads directory (preserved during deployments)

## Prerequisites

1. GitHub repository access
2. Server access (root SSH)
3. ISPManager control panel access
4. Node.js 18+ installed on server

## Quick Start

### 1. Generate SSH Keys (Local Machine)

Run the setup script to generate SSH keys and get configuration values:

```bash
chmod +x scripts/setup-deployment.sh
./scripts/setup-deployment.sh
```

This will:
- Generate an SSH key pair
- Display values for GitHub Secrets
- Show server setup commands

### 2. Configure GitHub Secrets

Go to your repository settings: `https://github.com/pashlandus/gshopinfo-isp/settings/secrets/actions`

Add these secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `SSH_PRIVATE_KEY` | Generated private key | For SSH authentication |
| `SERVER_HOST` | `167.235.7.222` | ISPManager server IP |
| `KNOWN_HOSTS` | Server fingerprint | From ssh-keyscan output |

### 3. Configure Server

SSH into the server as root and run:

```bash
# Add deploy key to authorized_keys
mkdir -p /root/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> /root/.ssh/authorized_keys
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys

# Create necessary directories
mkdir -p /var/www/pashland/backups/gshop
mkdir -p /var/www/pashland/data/nodejs
mkdir -p /var/www/pashland/data/www/g-shop.info

# Set permissions
chown -R pashland:pashland /var/www/pashland/data
chmod 755 /var/www/pashland/data/nodejs
```

### 4. Configure ISPManager Node.js App

In ISPManager control panel:

1. Go to **Web-server Settings** → **Node.js**
2. Create/Edit application with:
   - **Name**: `g-shop.info`
   - **Path**: `/var/www/pashland/data/www/g-shop.info`
   - **Entry Point**: `app.js`
   - **Node Version**: 18 or higher
   - **Environment**: Production

### 5. Create Environment File

Create `/var/www/pashland/data/www/g-shop.info/backend/.env`:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=<generate-random-keys>
API_TOKEN_SALT=<generate-random-salt>
ADMIN_JWT_SECRET=<generate-random-secret>
TRANSFER_TOKEN_SALT=<generate-random-salt>
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=./database.db
JWT_SECRET=<generate-random-secret>

# Optional: Email configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=noreply@g-shop.info
SMTP_PASSWORD=your-password

# Strapi API Token (for prefetch)
STRAPI_API_TOKEN=<your-api-token>
STRAPI_API_URL=https://g-shop.info/api
```

### 6. Initial Deployment

1. Push to main branch:
```bash
git add .
git commit -m "Setup automatic deployment"
git push origin main
```

2. Monitor deployment in GitHub Actions tab

3. Check deployment status:
```bash
curl https://g-shop.info/api
```

## Deployment Workflow

### Automatic Deployment

Every push to `main` branch triggers:

1. **Build Stage**
   - Checkout code
   - Install dependencies
   - Build Strapi backend
   
2. **Deploy Stage**
   - Backup current deployment
   - Sync files to server
   - Preserve database and uploads
   - Install production dependencies
   - Run prefetch script
   - Restart application via ISPManager
   
3. **Verify Stage**
   - Health checks
   - Automatic rollback on failure

### Manual Deployment

Trigger deployment manually from GitHub Actions:

1. Go to Actions tab
2. Select "Deploy to Production (ISPManager)"
3. Click "Run workflow"
4. Choose branch and options

## File Structure

```
/var/www/pashland/
├── backups/gshop/          # Automated backups
│   ├── db_*.db             # Database backups
│   └── uploads_*.tar.gz    # Upload backups
│
└── data/
    ├── nodejs/
    │   └── 0.sock          # ISPManager socket
    │
    └── www/g-shop.info/
        ├── app.js          # ISPManager entry point
        ├── package.json    # Root package (wrapper)
        ├── backend/        # Strapi application
        │   ├── .env        # Environment variables
        │   ├── database.db # SQLite database
        │   └── public/
        │       └── uploads/# User uploads
        ├── frontend/       # Static frontend
        └── scripts/        # Build scripts
```

## Monitoring

### Check Application Status

```bash
# Via ISPManager
/usr/local/mgr5/sbin/mgrctl -m ispmgr nodeapp.status elid=g-shop.info

# Check process
ps aux | grep "node.*g-shop.info"

# Check socket
ls -la /var/www/pashland/data/nodejs/0.sock

# Check logs
tail -f /var/www/pashland/data/www/g-shop.info/logs/error.log
```

### View Deployment Logs

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow run
4. View detailed logs

## Troubleshooting

### Deployment Fails

1. **SSH Connection Failed**
   - Verify SSH key in GitHub Secrets
   - Check server firewall
   - Test connection manually

2. **Build Errors**
   - Check Node.js version
   - Verify dependencies
   - Review build logs

3. **Application Won't Start**
   - Check ISPManager configuration
   - Verify socket permissions
   - Review error logs

### Rollback Procedure

Automatic rollback occurs on failure. Manual rollback:

```bash
# On server
cd /var/www/pashland/data/www
mv g-shop.info g-shop.info_failed
mv g-shop.info_old g-shop.info

# Restart via ISPManager
/usr/local/mgr5/sbin/mgrctl -m ispmgr nodeapp.restart elid=g-shop.info
```

### Database Issues

Restore from backup:

```bash
cd /var/www/pashland/backups/gshop
cp db_20240101_120000.db /var/www/pashland/data/www/g-shop.info/backend/database.db
chown pashland:pashland /var/www/pashland/data/www/g-shop.info/backend/database.db
```

## Security Considerations

1. **SSH Keys**: Use dedicated deploy keys, not personal keys
2. **Secrets**: Never commit sensitive data
3. **Permissions**: Minimize root access
4. **Backups**: Regular automated backups
5. **Monitoring**: Set up alerts for failures

## Maintenance

### Update Node.js Version

1. Update in ISPManager panel
2. Update GitHub workflow (`NODE_VERSION`)
3. Update package.json engines

### Clean Old Backups

Automatic cleanup keeps last 5 backups. Manual cleanup:

```bash
cd /var/www/pashland/backups/gshop
ls -t db_*.db | tail -n +6 | xargs rm -f
ls -t uploads_*.tar.gz | tail -n +6 | xargs rm -f
```

### Update Dependencies

```bash
# Local development
cd backend
npm update
npm audit fix
git commit -am "Update dependencies"
git push origin main
```

## Support

For issues with:
- **ISPManager**: Contact hosting support
- **Deployment**: Check GitHub Actions logs
- **Application**: Review Strapi logs

## Additional Resources

- [ISPManager Documentation](https://docs.ispsystem.com/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Strapi Documentation](https://docs.strapi.io/)
- [Node.js on ISPManager](https://docs.ispsystem.com/ispmanager/nodejs)