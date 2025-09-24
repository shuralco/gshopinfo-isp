#!/bin/bash

# ISPManager Deployment Script for G-Shop.info
# This script handles the deployment process on the ISPManager server

set -e

# Configuration
DEPLOY_USER="pashland"
DEPLOY_PATH="/var/www/pashland/data/www/g-shop.info"
BACKUP_PATH="/var/www/pashland/backups/gshop"
SOCKET_PATH="/var/www/pashland/data/nodejs/0.sock"
NODE_APP_NAME="g-shop.info"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    mkdir -p ${BACKUP_PATH}
    mkdir -p ${DEPLOY_PATH}
    mkdir -p /var/www/pashland/data/nodejs
}

# Backup current deployment
backup_current() {
    log_info "Creating backup of current deployment..."
    
    if [ -f "${DEPLOY_PATH}/backend/database.db" ]; then
        cp "${DEPLOY_PATH}/backend/database.db" "${BACKUP_PATH}/database_${TIMESTAMP}.db" || true
        cp "${DEPLOY_PATH}/backend/database.db-shm" "${BACKUP_PATH}/database_${TIMESTAMP}.db-shm" 2>/dev/null || true
        cp "${DEPLOY_PATH}/backend/database.db-wal" "${BACKUP_PATH}/database_${TIMESTAMP}.db-wal" 2>/dev/null || true
        log_success "Database backed up"
    fi
    
    if [ -d "${DEPLOY_PATH}/backend/public/uploads" ]; then
        tar -czf "${BACKUP_PATH}/uploads_${TIMESTAMP}.tar.gz" -C "${DEPLOY_PATH}/backend/public" uploads || true
        log_success "Uploads backed up"
    fi
    
    if [ -f "${DEPLOY_PATH}/backend/.env" ]; then
        cp "${DEPLOY_PATH}/backend/.env" "${BACKUP_PATH}/env_${TIMESTAMP}" || true
        log_success "Environment file backed up"
    fi
}

# Stop application via ISPManager
stop_application() {
    log_info "Stopping Node.js application via ISPManager..."
    
    # Try ISPManager command first
    if command -v /usr/local/mgr5/sbin/mgrctl &> /dev/null; then
        /usr/local/mgr5/sbin/mgrctl -m ispmgr nodeapp.stop elid=${NODE_APP_NAME} 2>/dev/null || true
    fi
    
    # Kill any remaining Node.js processes for this app
    pkill -f "node.*${DEPLOY_PATH}" 2>/dev/null || true
    
    # Remove socket file if exists
    if [ -S "${SOCKET_PATH}" ]; then
        rm -f "${SOCKET_PATH}"
    fi
    
    sleep 3
    log_success "Application stopped"
}

# Start application via ISPManager
start_application() {
    log_info "Starting Node.js application via ISPManager..."
    
    # Ensure proper permissions
    chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_PATH}
    chmod 755 ${DEPLOY_PATH}
    chmod 755 ${DEPLOY_PATH}/backend
    
    # Ensure socket directory has proper permissions
    chown ${DEPLOY_USER}:${DEPLOY_USER} /var/www/pashland/data/nodejs
    chmod 755 /var/www/pashland/data/nodejs
    
    # Try ISPManager command
    if command -v /usr/local/mgr5/sbin/mgrctl &> /dev/null; then
        /usr/local/mgr5/sbin/mgrctl -m ispmgr nodeapp.start elid=${NODE_APP_NAME}
        sleep 5
        
        # Check if started
        if /usr/local/mgr5/sbin/mgrctl -m ispmgr nodeapp.status elid=${NODE_APP_NAME} | grep -q "running"; then
            log_success "Application started via ISPManager"
            return 0
        fi
    fi
    
    # Fallback: start manually as the user
    log_warning "ISPManager start failed, trying manual start..."
    su - ${DEPLOY_USER} -c "cd ${DEPLOY_PATH} && nohup node app.js > /var/log/gshop.log 2>&1 &"
    sleep 5
    
    # Check if socket exists
    if [ -S "${SOCKET_PATH}" ]; then
        log_success "Application started manually"
        return 0
    else
        log_error "Failed to start application"
        return 1
    fi
}

# Check application health
check_health() {
    log_info "Checking application health..."
    
    # Check if socket exists
    if [ -S "${SOCKET_PATH}" ]; then
        log_success "Socket file exists"
    else
        log_warning "Socket file not found"
    fi
    
    # Check if process is running
    if pgrep -f "node.*${DEPLOY_PATH}" > /dev/null; then
        log_success "Node.js process is running"
    else
        log_error "Node.js process not found"
        return 1
    fi
    
    # Check API endpoint (internal)
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/api | grep -q "200\|301\|302"; then
        log_success "API is responding"
    else
        log_warning "API check failed (may be normal if using socket only)"
    fi
    
    return 0
}

# Clean old backups
cleanup_backups() {
    log_info "Cleaning old backups (keeping last 5)..."
    
    cd ${BACKUP_PATH}
    ls -t database_*.db 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    ls -t uploads_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    ls -t env_* 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    
    log_success "Old backups cleaned"
}

# Rollback deployment
rollback() {
    log_error "Deployment failed! Starting rollback..."
    
    if [ -d "${DEPLOY_PATH}_old" ]; then
        rm -rf "${DEPLOY_PATH}"
        mv "${DEPLOY_PATH}_old" "${DEPLOY_PATH}"
        start_application
        log_warning "Rolled back to previous deployment"
    else
        log_error "No backup found for rollback!"
    fi
}

# Main deployment process
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ISPManager Deployment Script${NC}"
    echo -e "${GREEN}  Target: ${NODE_APP_NAME}${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    # Pre-deployment tasks
    create_directories
    backup_current
    stop_application
    
    # The actual file sync is handled by GitHub Actions
    # This script focuses on ISPManager-specific operations
    
    log_info "Deployment files should be synced by CI/CD"
    
    # Post-deployment tasks
    if start_application; then
        if check_health; then
            cleanup_backups
            log_success "Deployment completed successfully!"
            exit 0
        else
            rollback
            exit 1
        fi
    else
        rollback
        exit 1
    fi
}

# Run main function
main "$@"