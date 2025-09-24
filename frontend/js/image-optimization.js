/**
 * Image Optimization and Lazy Loading Module
 * Handles WebP support, responsive images, and performance optimization
 */

(function() {
    'use strict';
    
    // WebP support detection
    let webpSupported = false;
    
    /**
     * Initialize image optimization
     */
    function initImageOptimization() {
        detectWebPSupport().then(supported => {
            webpSupported = supported;
            console.log('WebP support:', supported ? 'Yes' : 'No');
            
            initAdvancedLazyLoading();
            initResponsiveImages();
            preloadCriticalImages();
            optimizeImageLoading();
        });
    }
    
    /**
     * Detect WebP support
     */
    function detectWebPSupport() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = function () {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }
    
    /**
     * Advanced lazy loading with Intersection Observer
     */
    function initAdvancedLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            loadAllImages();
            return;
        }
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // Observe all images with data-src
        const lazyImages = document.querySelectorAll('img[data-src], img[data-lazy]');
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
        
        // Observe background images
        const lazyBackgrounds = document.querySelectorAll('[data-bg]');
        lazyBackgrounds.forEach(element => {
            imageObserver.observe(element);
        });
    }
    
    /**
     * Load individual image with WebP support
     */
    function loadImage(img) {
        const src = img.getAttribute('data-src') || img.getAttribute('data-lazy');
        const bgSrc = img.getAttribute('data-bg');
        
        if (bgSrc) {
            // Handle background images
            const optimizedSrc = getOptimizedImageSrc(bgSrc);
            img.style.backgroundImage = `url(${optimizedSrc})`;
            img.classList.add('loaded');
        } else if (src) {
            // Handle regular images
            const optimizedSrc = getOptimizedImageSrc(src);
            
            // Create a new image to test loading
            const imageLoader = new Image();
            imageLoader.onload = function() {
                img.src = optimizedSrc;
                img.classList.add('loaded');
                img.classList.remove('loading');
            };
            imageLoader.onerror = function() {
                // Fallback to original image
                img.src = src;
                img.classList.add('loaded');
                img.classList.remove('loading');
            };
            
            img.classList.add('loading');
            imageLoader.src = optimizedSrc;
        }
    }
    
    /**
     * Get optimized image source (WebP if supported)
     */
    function getOptimizedImageSrc(originalSrc) {
        if (!webpSupported) {
            return originalSrc;
        }
        
        // Convert to WebP if supported
        const extension = originalSrc.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png'].includes(extension)) {
            return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        
        return originalSrc;
    }
    
    /**
     * Initialize responsive images
     */
    function initResponsiveImages() {
        const responsiveImages = document.querySelectorAll('img[data-sizes]');
        
        responsiveImages.forEach(img => {
            const sizes = JSON.parse(img.getAttribute('data-sizes'));
            const currentWidth = window.innerWidth;
            
            // Find appropriate size
            let selectedSrc = img.src;
            for (const size of sizes) {
                if (currentWidth >= size.minWidth) {
                    selectedSrc = getOptimizedImageSrc(size.src);
                    break;
                }
            }
            
            if (selectedSrc !== img.src) {
                img.src = selectedSrc;
            }
        });
    }
    
    /**
     * Preload critical images
     */
    function preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('img[data-critical]');
        
        criticalImages.forEach(img => {
            const src = img.getAttribute('data-src') || img.src;
            if (src) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = getOptimizedImageSrc(src);
                document.head.appendChild(link);
            }
        });
    }
    
    /**
     * Optimize image loading performance
     */
    function optimizeImageLoading() {
        // Add loading="lazy" to all images without it
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            if (!img.hasAttribute('data-critical')) {
                img.setAttribute('loading', 'lazy');
            }
        });
        
        // Add decoding="async" for better performance
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
            }
        });
    }
    
    /**
     * Fallback for browsers without Intersection Observer
     */
    function loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src], img[data-lazy]');
        lazyImages.forEach(loadImage);
    }
    
    /**
     * Handle window resize for responsive images
     */
    function handleResize() {
        initResponsiveImages();
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageOptimization);
    } else {
        initImageOptimization();
    }
    
    // Handle window resize
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Export functions for external use
    window.ImageOptimization = {
        loadImage: loadImage,
        getOptimizedImageSrc: getOptimizedImageSrc,
        webpSupported: () => webpSupported
    };
    
})();