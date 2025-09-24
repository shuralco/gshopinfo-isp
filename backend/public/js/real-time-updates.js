/**
 * Real-time updates using Server-Sent Events (SSE)
 */

class RealTimeUpdates {
    constructor() {
        this.eventSource = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.isConnected = false;
        this.init();
    }

    init() {
        this.connect();
        this.addConnectionIndicator();
    }

    connect() {
        try {
            this.eventSource = new EventSource('/api/events');
            
            this.eventSource.onopen = () => {
                console.log('🔌 SSE connection opened');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
                this.updateConnectionStatus('connected');
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing SSE message:', error);
                }
            };

            this.eventSource.onerror = (error) => {
                console.error('SSE connection error:', error);
                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                this.handleReconnect();
            };

        } catch (error) {
            console.error('Error creating SSE connection:', error);
            this.handleReconnect();
        }
    }

    handleMessage(data) {
        console.log('📡 Received SSE update:', data);

        switch (data.type) {
            case 'connected':
                console.log('✅ SSE connected successfully');
                break;
            
            case 'ping':
                // Keep-alive ping, no action needed
                break;
            
            case 'update':
                this.handleContentUpdate(data.data);
                break;
            
            default:
                console.log('Unknown SSE message type:', data.type);
        }
    }

    handleContentUpdate(updateData) {
        console.log('🔄 Processing content update:', updateData);
        
        // Show update notification
        this.showUpdateNotification(updateData);
        
        // Trigger content reload based on update type
        switch (updateData.type) {
            case 'site-setting':
                this.reloadSiteSettings();
                break;
            case 'hero-section':
                this.reloadHeroSection();
                break;
            case 'product':
                this.reloadProducts();
                break;
            case 'testimonial':
                this.reloadTestimonials();
                break;
            case 'brand':
            case 'category':
                this.reloadBrands();
                break;
            default:
                // Reload all content for unknown types
                this.reloadAllContent();
        }
    }

    async reloadSiteSettings() {
        try {
            const response = await fetch('/api/site-setting');
            const data = await response.json();
            
            if (window.dynamicLoader) {
                window.dynamicLoader.loadSiteSettings(data.data);
                console.log('✅ Site settings reloaded');
            }
        } catch (error) {
            console.error('Error reloading site settings:', error);
        }
    }

    async reloadHeroSection() {
        try {
            const response = await fetch('/api/hero-section');
            const data = await response.json();
            
            if (window.dynamicLoader) {
                window.dynamicLoader.loadHeroSection(data.data);
                console.log('✅ Hero section reloaded');
            }
        } catch (error) {
            console.error('Error reloading hero section:', error);
        }
    }

    async reloadProducts() {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            
            if (window.dynamicLoader) {
                window.dynamicLoader.loadProducts(data.data);
                console.log('✅ Products reloaded');
            }
        } catch (error) {
            console.error('Error reloading products:', error);
        }
    }

    async reloadTestimonials() {
        try {
            const response = await fetch('/api/testimonials');
            const data = await response.json();
            
            if (window.dynamicLoader) {
                window.dynamicLoader.loadTestimonials(data.data);
                console.log('✅ Testimonials reloaded');
            }
        } catch (error) {
            console.error('Error reloading testimonials:', error);
        }
    }

    async reloadBrands() {
        try {
            const response = await fetch('/api/brands?populate=categories');
            const data = await response.json();
            
            if (window.dynamicLoader) {
                window.dynamicLoader.data.brands = data.data || [];
                window.dynamicLoader.updateBrands();
                console.log('✅ Brands and categories reloaded');
            }
        } catch (error) {
            console.error('Error reloading brands:', error);
        }
    }

    async reloadAllContent() {
        console.log('🔄 Reloading all content...');
        if (window.dynamicLoader) {
            await window.dynamicLoader.loadAllData();
            console.log('✅ All content reloaded');
        }
    }

    showUpdateNotification(updateData) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
        `;
        
        const typeLabels = {
            'site-setting': 'Налаштування сайту',
            'hero-section': 'Головна секція',
            'product': 'Товар',
            'testimonial': 'Відгук',
            'brand': 'Бренд',
            'category': 'Категорія'
        };
        
        const actionLabels = {
            'updated': 'оновлено',
            'created': 'створено',
            'deleted': 'видалено'
        };
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🔄</span>
                <div>
                    <div style="font-weight: 600;">Контент оновлено!</div>
                    <div style="opacity: 0.9; font-size: 12px;">
                        ${typeLabels[updateData.type] || updateData.type} ${actionLabels[updateData.action] || updateData.action}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    addConnectionIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'sse-connection-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 10px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ef4444;
            z-index: 1000;
            transition: background-color 0.3s ease;
            box-shadow: 0 0 8px rgba(0,0,0,0.3);
        `;
        indicator.title = 'Real-time connection status';
        document.body.appendChild(indicator);
    }

    updateConnectionStatus(status) {
        const indicator = document.getElementById('sse-connection-indicator');
        if (indicator) {
            if (status === 'connected') {
                indicator.style.background = '#10b981';
                indicator.title = 'Real-time connection: Connected';
            } else {
                indicator.style.background = '#ef4444';
                indicator.title = 'Real-time connection: Disconnected';
            }
        }
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay);
            
            // Exponential backoff
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        } else {
            console.error('❌ Max reconnection attempts reached');
            this.updateConnectionStatus('failed');
        }
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
            this.isConnected = false;
            this.updateConnectionStatus('disconnected');
            console.log('🔌 SSE connection closed');
        }
    }
}

// Initialize real-time updates when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeUpdates = new RealTimeUpdates();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.realTimeUpdates) {
        window.realTimeUpdates.disconnect();
    }
});