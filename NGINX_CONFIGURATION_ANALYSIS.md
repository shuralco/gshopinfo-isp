# 🔍 NGINX Configuration Analysis & Solution

## 📊 Configuration Comparison

### 1. **Individual Location Blocks** (nginx_config_correct.txt & nginx_config_final.txt)
```nginx
location ^~ /admin { proxy_pass http://localhost:3002; }
location ^~ /api { proxy_pass http://localhost:3002; }
location ^~ /uploads { proxy_pass http://localhost:3002; }
# ... 12 separate blocks total
```
- **Pros:** Explicit, easy to understand each path
- **Cons:** Repetitive, harder to maintain, can miss new Strapi paths

### 2. **Single Regex Pattern** (nginx_config_fixed.txt) ✅ OPTIMAL
```nginx
location ~ ^/(admin|api|uploads|content-manager|...)(/.*)?$ {
    proxy_pass http://localhost:3002;
}
```
- **Pros:** Concise, maintainable, catches all paths in one block
- **Cons:** Regex slightly less performant than prefix match

### 3. **With Break Directive** (nginx_config_update.txt)
```nginx
location ~ ^/(admin|api|uploads|...)(/.*)?$ {
    proxy_pass http://localhost:3002;
    break;  # Stops processing other locations
}
```
- **Issue:** Has nested location blocks in frontend section causing conflicts

## 🎯 Key Findings

### Critical Issues Identified:

1. **Missing Strapi Paths** - Original configs only proxied `/admin`, `/api`, `/uploads`
   - Missing: `/content-manager`, `/content-type-builder`, `/users-permissions`, etc.
   - Result: Admin panel requests returned HTML instead of JSON

2. **Location Priority Conflicts**
   - Nginx processes locations in specific order:
     1. Exact match `=`
     2. Prefix match `^~` (stops searching)
     3. Regex match `~` or `~*`
     4. Regular prefix match
   - Frontend catch-all `/` must come AFTER Strapi locations

3. **Duplicate @fallback Handlers**
   - Multiple configs had conflicting @fallback blocks
   - One pointing to Unix socket, another to localhost:3002

## ✅ Optimal Solution

### Configuration Structure:
```nginx
server {
    # 1. SSL & Basic Setup
    ssl_certificate ...
    root /var/www/pashland/data/www/g-shop.info;
    
    # 2. Strapi Admin/API (MUST BE FIRST)
    location ~ ^/(admin|api|uploads|content-manager|...)(/.*)?$ {
        proxy_pass http://localhost:3002;
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # 3. Static Assets
    location ~* \.(js|css|png|jpg|...)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 4. Frontend Catch-All (MUST BE LAST)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔧 Critical Configuration Elements

### Required Strapi Paths:
- `/admin` - Admin panel UI
- `/api` - REST API endpoints
- `/uploads` - Media library
- `/content-manager` - Content management API
- `/content-type-builder` - Schema builder API
- `/users-permissions` - Auth & permissions
- `/i18n` - Internationalization
- `/upload` - File upload endpoint
- `/email` - Email plugin
- `/admin-roles` - RBAC management
- `/strapi` - Core Strapi routes
- `/_health` - Health check
- `/auth` - Authentication routes
- `/graphql` - GraphQL endpoint (if enabled)
- `/documentation` - API docs (if enabled)

### WebSocket/SSE Support:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_buffering off;
proxy_cache_bypass $http_upgrade;
```

### Timeout Settings (for large operations):
```nginx
proxy_connect_timeout 600s;
proxy_send_timeout 600s;
proxy_read_timeout 600s;
```

## 📝 ISPManager Specific Notes

1. **Socket vs Port:**
   - ISPManager expects Unix socket but Strapi works better with port
   - Solution: Configure Strapi on port 3002, proxy through nginx

2. **File Structure:**
   - ISPManager looks in root for package.json
   - Strapi is in /backend subfolder
   - Solution: Wrapper package.json and server.js in root

3. **Process Management:**
   - ISPManager uses its own process manager
   - Conflicts with PM2
   - Solution: Let ISPManager handle process, disable PM2

## 🚀 Deployment Checklist

1. ✅ All Strapi paths proxied to backend
2. ✅ Static files served with proper caching
3. ✅ Frontend catch-all comes last
4. ✅ WebSocket headers for admin hot-reload
5. ✅ CORS headers for API access
6. ✅ Security headers (HSTS, XSS, etc.)
7. ✅ Gzip compression enabled
8. ✅ Client max body size for uploads
9. ✅ No duplicate or conflicting locations
10. ✅ No nested location blocks in catch-all

## 💡 Testing Commands

```bash
# Test Strapi API
curl -I https://g-shop.info/api/
# Should return: Content-Type: application/json

# Test Admin Panel API
curl -I https://g-shop.info/content-manager/
# Should return: Content-Type: application/json (NOT text/html)

# Test Static Files
curl -I https://g-shop.info/static/js/main.js
# Should return: Cache-Control: public, immutable

# Test Frontend
curl -I https://g-shop.info/
# Should return: Content-Type: text/html
```

## 🎯 Final Solution

The optimal configuration uses a **single regex location** for all Strapi paths, avoiding repetition while ensuring all admin panel routes work correctly. The key insight was that nginx was returning HTML for critical admin API paths like `/content-manager`, causing the infinite spinner as the admin panel couldn't load its data.