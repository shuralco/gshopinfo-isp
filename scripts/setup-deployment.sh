#!/bin/bash

# Setup script for GitHub Actions deployment to ISPManager
# Run this locally to prepare SSH keys and server configuration

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  GitHub Actions Deployment Setup${NC}"
echo -e "${GREEN}  For ISPManager Hosting${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Configuration
SERVER_HOST="167.235.7.222"
SERVER_USER="root"
DEPLOY_PATH="/var/www/pashland/data/www/g-shop.info"
GITHUB_REPO="pashlandus/gshopinfo-isp"

echo -e "${BLUE}Configuration:${NC}"
echo "  Server: $SERVER_HOST"
echo "  User: $SERVER_USER"
echo "  Deploy Path: $DEPLOY_PATH"
echo "  GitHub Repo: $GITHUB_REPO"
echo ""

# Step 1: Generate SSH key pair
echo -e "${YELLOW}Step 1: Generating SSH key pair...${NC}"
SSH_KEY_PATH="$HOME/.ssh/gshop_deploy_key"

if [ -f "$SSH_KEY_PATH" ]; then
    echo -e "${YELLOW}SSH key already exists at $SSH_KEY_PATH${NC}"
    read -p "Do you want to regenerate it? (y/N): " regenerate
    if [[ $regenerate =~ ^[Yy]$ ]]; then
        rm -f "$SSH_KEY_PATH" "$SSH_KEY_PATH.pub"
    else
        echo "Using existing key..."
    fi
fi

if [ ! -f "$SSH_KEY_PATH" ]; then
    ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -C "github-actions@g-shop.info"
    echo -e "${GREEN}✓ SSH key pair generated${NC}"
fi

# Step 2: Display private key for GitHub Secrets
echo ""
echo -e "${YELLOW}Step 2: GitHub Secrets Configuration${NC}"
echo -e "${BLUE}Add the following secrets to your GitHub repository:${NC}"
echo ""
echo "1. Go to: https://github.com/$GITHUB_REPO/settings/secrets/actions"
echo ""
echo "2. Add these secrets:"
echo ""
echo -e "${GREEN}SSH_PRIVATE_KEY:${NC}"
echo "---BEGIN PRIVATE KEY---"
cat "$SSH_KEY_PATH"
echo "---END PRIVATE KEY---"
echo ""
echo -e "${GREEN}SERVER_HOST:${NC}"
echo "$SERVER_HOST"
echo ""

# Step 3: Get known_hosts entry
echo -e "${YELLOW}Step 3: Getting server fingerprint...${NC}"
KNOWN_HOSTS=$(ssh-keyscan -H $SERVER_HOST 2>/dev/null)
echo -e "${GREEN}KNOWN_HOSTS:${NC}"
echo "$KNOWN_HOSTS"
echo ""

# Step 4: Setup server
echo -e "${YELLOW}Step 4: Server setup instructions${NC}"
echo ""
echo "Run these commands on the server to complete setup:"
echo ""
echo -e "${BLUE}# 1. Add the deploy key to authorized_keys:${NC}"
echo "mkdir -p /root/.ssh"
echo "cat >> /root/.ssh/authorized_keys << 'EOF'"
cat "$SSH_KEY_PATH.pub"
echo "EOF"
echo "chmod 700 /root/.ssh"
echo "chmod 600 /root/.ssh/authorized_keys"
echo ""
echo -e "${BLUE}# 2. Create necessary directories:${NC}"
echo "mkdir -p /var/www/pashland/backups/gshop"
echo "mkdir -p /var/www/pashland/data/nodejs"
echo "chown pashland:pashland /var/www/pashland/data/nodejs"
echo ""
echo -e "${BLUE}# 3. Ensure ISPManager Node.js app is configured:${NC}"
echo "# The app should be named 'g-shop.info' in ISPManager"
echo "# Entry point should be set to 'app.js'"
echo "# Working directory: /var/www/pashland/data/www/g-shop.info"
echo ""
echo -e "${BLUE}# 4. Create environment file:${NC}"
echo "cat > $DEPLOY_PATH/backend/.env << 'EOF'"
echo "HOST=0.0.0.0"
echo "PORT=1337"
echo "APP_KEYS=your-app-keys-here"
echo "API_TOKEN_SALT=your-api-token-salt"
echo "ADMIN_JWT_SECRET=your-admin-jwt-secret"
echo "TRANSFER_TOKEN_SALT=your-transfer-token-salt"
echo "DATABASE_CLIENT=sqlite"
echo "DATABASE_FILENAME=.tmp/data.db"
echo "JWT_SECRET=your-jwt-secret"
echo "EOF"
echo ""

# Step 5: Create test workflow
echo -e "${YELLOW}Step 5: Creating test workflow...${NC}"
cat > test-deployment.yml << 'EOF'
name: Test Deployment Connection

on:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test SSH Connection
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          echo "${{ secrets.KNOWN_HOSTS }}" >> ~/.ssh/known_hosts
          
          ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no \
            root@${{ secrets.SERVER_HOST }} \
            "echo 'SSH connection successful! Server time:' && date"
EOF

echo -e "${GREEN}✓ Test workflow created: test-deployment.yml${NC}"
echo ""

# Step 6: Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Add the secrets to GitHub (shown above)"
echo "2. Configure the server (commands shown above)"
echo "3. Copy test-deployment.yml to .github/workflows/"
echo "4. Run the test workflow to verify connection"
echo "5. Push to main branch to trigger deployment"
echo ""
echo -e "${YELLOW}Important files:${NC}"
echo "  SSH Private Key: $SSH_KEY_PATH"
echo "  SSH Public Key: $SSH_KEY_PATH.pub"
echo "  Test Workflow: test-deployment.yml"
echo ""
echo -e "${BLUE}To manually test the SSH connection:${NC}"
echo "ssh -i $SSH_KEY_PATH root@$SERVER_HOST 'echo Connected!'"
echo ""