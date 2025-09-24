/**
 * Performance Monitoring and Optimization
 * Tracks Core Web Vitals and provides optimization suggestions
 */

(function() {
    'use strict';
    
    let performanceData = {
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null
    };
    
    /**
     * Initialize performance monitoring
     */
    function initPerformanceMonitoring() {
        // Only run in production or when explicitly enabled
        if (location.hostname === 'localhost' && !window.ENABLE_PERFORMANCE_MONITORING) {
            console.log('Performance monitoring disabled in development');
            return;
        }
        
        measureCoreWebVitals();
        measureCustomMetrics();
        optimizePerformance();
        setupPerformanceObserver();
        
        // Report after page load
        window.addEventListener('load', () => {
            setTimeout(reportPerformanceData, 1000);
        });
    }
    
    /**
     * Measure Core Web Vitals
     */
    function measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                performanceData.lcp = lastEntry.startTime;
                
                if (lastEntry.startTime > 2500) {
                    console.warn('LCP is poor:', lastEntry.startTime + 'ms');
                    suggestLCPOptimizations();
                }
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observation not supported');
            }
        }
        
        // First Input Delay (FID)
        if ('PerformanceObserver' in window) {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    performanceData.fid = entry.processingStart - entry.startTime;
                    
                    if (entry.processingStart - entry.startTime > 100) {
                        console.warn('FID is poor:', entry.processingStart - entry.startTime + 'ms');
                        suggestFIDOptimizations();
                    }
                });
            });
            
            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observation not supported');
            }
        }
        
        // Cumulative Layout Shift (CLS)
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                performanceData.cls = clsValue;
                
                if (clsValue > 0.1) {
                    console.warn('CLS is poor:', clsValue);
                    suggestCLSOptimizations();
                }
            });
            
            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS observation not supported');
            }
        }
    }
    
    /**
     * Measure custom metrics
     */
    function measureCustomMetrics() {
        // First Contentful Paint
        if ('PerformanceObserver' in window) {
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                        performanceData.fcp = entry.startTime;
                    }
                });
            });
            
            try {
                fcpObserver.observe({ entryTypes: ['paint'] });
            } catch (e) {
                console.warn('FCP observation not supported');
            }
        }
        
        // Time to First Byte
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                const timing = window.performance.timing;
                performanceData.ttfb = timing.responseStart - timing.navigationStart;
                
                if (performanceData.ttfb > 600) {
                    console.warn('TTFB is poor:', performanceData.ttfb + 'ms');
                    suggestTTFBOptimizations();
                }
            });
        }
    }
    
    /**
     * Setup performance observer for resource timing
     */
    function setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    // Check for slow resources
                    if (entry.duration > 1000) {
                        console.warn('Slow resource detected:', entry.name, entry.duration + 'ms');
                    }
                    
                    // Check for large resources
                    if (entry.transferSize > 1000000) { // 1MB
                        console.warn('Large resource detected:', entry.name, (entry.transferSize / 1024 / 1024).toFixed(2) + 'MB');
                    }
                });
            });
            
            try {
                resourceObserver.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.warn('Resource observation not supported');
            }
        }
    }
    
    /**
     * Optimize performance automatically
     */
    function optimizePerformance() {
        // Preconnect to external domains
        preconnectToExternalDomains();
        
        // Optimize font loading
        optimizeFontLoading();
        
        // Optimize third-party scripts
        optimizeThirdPartyScripts();
        
        // Reduce main thread blocking
        reduceMainThreadBlocking();
        
        // Optimize images
        optimizeImagePerformance();
    }
    
    /**
     * Preconnect to external domains
     */
    function preconnectToExternalDomains() {
        const externalDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://www.google-analytics.com',
            'https://www.googletagmanager.com'
        ];
        
        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    /**
     * Optimize font loading
     */
    function optimizeFontLoading() {
        // Add font-display: swap to improve FCP
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Inter';
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Optimize third-party scripts
     */
    function optimizeThirdPartyScripts() {
        // Defer non-critical scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
                script.defer = true;
            }
        });
    }
    
    /**
     * Reduce main thread blocking
     */
    function reduceMainThreadBlocking() {
        // Use requestIdleCallback for non-critical tasks
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Initialize non-critical features
                initNonCriticalFeatures();
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(initNonCriticalFeatures, 1000);
        }
    }
    
    /**
     * Initialize non-critical features
     */
    function initNonCriticalFeatures() {
        // Initialize features that don't affect initial page load
        console.log('Initializing non-critical features...');
        
        // Example: Initialize analytics after main content loads
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID');
        }
    }
    
    /**
     * Optimize image performance
     */
    function optimizeImagePerformance() {
        // Add loading="lazy" to images below the fold
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            if (index > 2 && !img.hasAttribute('loading')) {
                img.loading = 'lazy';
            }
        });
    }
    
    /**
     * Optimization suggestions
     */
    function suggestLCPOptimizations() {
        console.group('LCP Optimization Suggestions:');
        console.log('1. Optimize images (use WebP, proper sizing)');
        console.log('2. Preload critical resources');
        console.log('3. Reduce server response time');
        console.log('4. Remove render-blocking resources');
        console.groupEnd();
    }
    
    function suggestFIDOptimizations() {
        console.group('FID Optimization Suggestions:');
        console.log('1. Break up long tasks');
        console.log('2. Optimize JavaScript execution');
        console.log('3. Use web workers for heavy computations');
        console.log('4. Reduce JavaScript bundle size');
        console.groupEnd();
    }
    
    function suggestCLSOptimizations() {
        console.group('CLS Optimization Suggestions:');
        console.log('1. Set size attributes on images and videos');
        console.log('2. Reserve space for ads and embeds');
        console.log('3. Avoid inserting content above existing content');
        console.log('4. Use CSS aspect-ratio for responsive images');
        console.groupEnd();
    }
    
    function suggestTTFBOptimizations() {
        console.group('TTFB Optimization Suggestions:');
        console.log('1. Optimize server configuration');
        console.log('2. Use CDN for static assets');
        console.log('3. Enable server-side caching');
        console.log('4. Optimize database queries');
        console.groupEnd();
    }
    
    /**
     * Report performance data
     */
    function reportPerformanceData() {
        console.group('Performance Report:');
        console.log('LCP:', performanceData.lcp ? performanceData.lcp.toFixed(2) + 'ms' : 'Not measured');
        console.log('FID:', performanceData.fid ? performanceData.fid.toFixed(2) + 'ms' : 'Not measured');
        console.log('CLS:', performanceData.cls ? performanceData.cls.toFixed(3) : 'Not measured');
        console.log('FCP:', performanceData.fcp ? performanceData.fcp.toFixed(2) + 'ms' : 'Not measured');
        console.log('TTFB:', performanceData.ttfb ? performanceData.ttfb.toFixed(2) + 'ms' : 'Not measured');
        console.groupEnd();
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metrics', {
                'custom_map': {
                    'metric_1': 'lcp',
                    'metric_2': 'fid',
                    'metric_3': 'cls'
                },
                'lcp': performanceData.lcp,
                'fid': performanceData.fid,
                'cls': performanceData.cls
            });
        }
    }
    
    /**
     * Get performance score
     */
    function getPerformanceScore() {
        let score = 100;
        
        // LCP scoring
        if (performanceData.lcp > 4000) score -= 30;
        else if (performanceData.lcp > 2500) score -= 15;
        
        // FID scoring
        if (performanceData.fid > 300) score -= 30;
        else if (performanceData.fid > 100) score -= 15;
        
        // CLS scoring
        if (performanceData.cls > 0.25) score -= 30;
        else if (performanceData.cls > 0.1) score -= 15;
        
        return Math.max(0, score);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
    } else {
        initPerformanceMonitoring();
    }
    
    // Export for external use
    window.PerformanceMonitor = {
        getPerformanceData: () => performanceData,
        getPerformanceScore: getPerformanceScore,
        reportPerformanceData: reportPerformanceData
    };
    
})();