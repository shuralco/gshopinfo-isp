# 🔐 GitHub Secrets Configuration

## Repository URL
https://github.com/shuralco/gshopinfo-isp

## Quick Setup Link
**Click here to add secrets**: https://github.com/shuralco/gshopinfo-isp/settings/secrets/actions/new

## Required Secrets

### 1. SERVER_HOST
- **Name**: `SERVER_HOST`
- **Value**: `167.235.7.222`

### 2. SERVER_USER  
- **Name**: `SERVER_USER`
- **Value**: `root`

### 3. SERVER_PASSWORD
- **Name**: `SERVER_PASSWORD`
- **Value**: `qaqa1234`

### 4. SSH_PRIVATE_KEY (Optional - for key-based auth)
Generate with:
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key
```

### 5. KNOWN_HOSTS
Get fingerprint:
```bash
ssh-keyscan -H 167.235.7.222
```

## How to Add Secrets

1. Go to: https://github.com/shuralco/gshopinfo-isp/settings/secrets/actions
2. Click "New repository secret"
3. Enter the Name and Value for each secret
4. Click "Add secret"

## Verify Secrets
After adding, you should see these secrets listed:
- ✅ SERVER_HOST
- ✅ SERVER_USER
- ✅ SERVER_PASSWORD
- ⚪ SSH_PRIVATE_KEY (optional)
- ⚪ KNOWN_HOSTS (optional)

## Test Deployment
After adding secrets, trigger deployment:
```bash
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

Then check: https://github.com/shuralco/gshopinfo-isp/actions