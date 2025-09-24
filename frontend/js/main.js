/**
 * Main JavaScript file for Gardena-Land Landing Page
 * Handles interactive functionality and DOM manipulation
 */

(function() {
    'use strict';

    // DOM Ready handler
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Gardena-Land Landing Page - JavaScript Loaded Successfully');
        
        // Initialize all modules
        initNavigation();
        initMegaMenu();
        initSmoothScrolling();
        initLazyLoading();
        initContactLinks();
        initScrollHandler();
        initFAQAccordion();
        initTestimonialSlider();
        initContactForm();
        initStatsAnimation();
        initMobileMenu();
        
        // Initialize new animation modules
        initScrollAnimations();
        initParallaxEffects();
        initMicroAnimations();
        initSmoothScrollingEnhanced();
        initNavigationHighlighting();
        optimizeAnimations();
        
        // Initialize modern components
        initModernHeader();
        initModernMobileMenu();
        initModernHero();
        initModernMegaMenu();
        initScrollEffects();
        
        // Initialize SuperDesign components
        initSuperDesignComponents();
        initProductShowcase();
        initCTABanner();
        initImprovedTestimonials();
    });

    /**
     * Initialize navigation functionality
     */
    function initNavigation() {
        const navLinks = document.querySelectorAll('.nav-menu a, .nav-link-modern');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                this.classList.add('active');
            });
        });
    }
    
    /**
     * Initialize Modern Header with scroll effects
     */
    function initModernHeader() {
        const header = document.querySelector('.modern-header');
        if (!header) return;
        
        let lastScrollY = 0;
        let ticking = false;
        
        function updateHeader() {
            const scrollY = window.scrollY;
            
            // Add scrolled class
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide/show on scroll
            if (scrollY > lastScrollY && scrollY > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = scrollY;
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick);
    }
    
    /**
     * Initialize Modern Mobile Menu with Accessibility
     */
    function initModernMobileMenu() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const mobileOverlay = document.querySelector('.mobile-menu-overlay');
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        
        if (!mobileBtn || !mobileOverlay) return;
        
        // Add accessibility attributes to overlay
        mobileOverlay.setAttribute('role', 'dialog');
        mobileOverlay.setAttribute('aria-modal', 'true');
        mobileOverlay.setAttribute('aria-label', 'Mobile Navigation Menu');
        
        // Initialize aria-expanded
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileBtn.setAttribute('aria-controls', 'mobile-menu-overlay');
        mobileBtn.setAttribute('aria-label', 'Toggle navigation menu');
        
        // Add ID to overlay for aria-controls
        if (!mobileOverlay.id) {
            mobileOverlay.id = 'mobile-menu-overlay';
        }
        
        // Store last focused element
        let lastFocusedElement = null;
        
        // Get focusable elements for focus trap
        function getFocusableElements() {
            return mobileOverlay.querySelectorAll(
                'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
            );
        }
        
        // Trap focus within menu
        function trapFocus(e) {
            const focusableElements = getFocusableElements();
            if (focusableElements.length === 0) return;
            
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        }
        
        // Open menu
        function openMenu() {
            lastFocusedElement = document.activeElement;
            mobileBtn.classList.add('active');
            mobileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            mobileBtn.setAttribute('aria-expanded', 'true');
            
            // Focus first focusable element
            setTimeout(() => {
                const focusableElements = getFocusableElements();
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }, 100);
            
            // Add focus trap listener
            document.addEventListener('keydown', trapFocus);
        }
        
        // Close menu
        function closeMenu() {
            mobileBtn.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
            mobileBtn.setAttribute('aria-expanded', 'false');
            
            // Remove focus trap listener
            document.removeEventListener('keydown', trapFocus);
            
            // Restore focus to trigger button
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            } else {
                mobileBtn.focus();
            }
        }
        
        // Toggle menu on button click
        mobileBtn.addEventListener('click', () => {
            const isOpen = mobileBtn.classList.contains('active');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Close on link click
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileOverlay.classList.contains('active')) {
                closeMenu();
            }
        });
        
        // Close on overlay click (outside menu content)
        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) {
                closeMenu();
            }
        });
    }
    
    /**
     * Initialize Modern Hero animations
     */
    function initModernHero() {
        // Animate statistics counters
        const statNumbers = document.querySelectorAll('.stat-number');
        
        if (statNumbers.length === 0) return;
        
        const animateNumber = (element) => {
            const target = parseInt(element.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateNumber = () => {
                current += step;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateNumber);
                } else {
                    element.textContent = target;
                }
            };
            
            updateNumber();
        };
        
        // Use Intersection Observer for triggering animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(num => observer.observe(num));
        
        // Optimized Parallax for floating elements with performance improvements
        const floatingElements = document.querySelectorAll('.floating-element, .floating-brand-card');
        const heroGradientBg = document.querySelector('.hero-gradient-bg');
        
        if (floatingElements.length > 0 || heroGradientBg) {
            let ticking = false;
            let isTabVisible = true;
            
            // Add will-change for performance hint to browser
            floatingElements.forEach(element => {
                element.style.willChange = 'transform';
            });
            if (heroGradientBg) {
                heroGradientBg.style.willChange = 'transform';
            }
            
            function updateParallax() {
                if (!isTabVisible) {
                    ticking = false;
                    return;
                }
                
                const scrollY = window.scrollY;
                
                floatingElements.forEach((element, index) => {
                    const speed = 0.5 + (index * 0.1);
                    const yPos = -(scrollY * speed);
                    element.style.transform = `translateY(${yPos}px)`;
                });
                
                if (heroGradientBg) {
                    const bgSpeed = 0.3;
                    const bgYPos = -(scrollY * bgSpeed);
                    heroGradientBg.style.transform = `translateY(${bgYPos}px)`;
                }
                
                ticking = false;
            }
            
            function requestTick() {
                if (!ticking && isTabVisible) {
                    requestAnimationFrame(updateParallax);
                    ticking = true;
                }
            }
            
            // Throttle scroll events with requestAnimationFrame
            window.addEventListener('scroll', requestTick, { passive: true });
            
            // Pause animations when tab is hidden for performance
            document.addEventListener('visibilitychange', () => {
                isTabVisible = !document.hidden;
                if (!isTabVisible) {
                    // Pause CSS animations
                    floatingElements.forEach(element => {
                        element.style.animationPlayState = 'paused';
                    });
                    if (heroGradientBg) {
                        heroGradientBg.style.animationPlayState = 'paused';
                    }
                } else {
                    // Resume CSS animations
                    floatingElements.forEach(element => {
                        element.style.animationPlayState = 'running';
                    });
                    if (heroGradientBg) {
                        heroGradientBg.style.animationPlayState = 'running';
                    }
                }
            });
        }
    }
    
    /**
     * Initialize Modern Mega Menu with glassmorphism
     */
    function initModernMegaMenu() {
        const triggers = document.querySelectorAll('.mega-menu-trigger-modern, .mega-menu-trigger');
        
        triggers.forEach(trigger => {
            const container = trigger.closest('.brand-card-modern');
            if (!container) return;
            
            // Find or create dropdown
            let dropdown = container.querySelector('.mega-menu-modern');
            
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                
                const isOpen = dropdown && dropdown.classList.contains('active');
                
                // Close all other dropdowns
                document.querySelectorAll('.mega-menu-modern.active').forEach(menu => {
                    menu.classList.remove('active');
                });
                document.querySelectorAll('.mega-menu-trigger-modern, .mega-menu-trigger').forEach(t => {
                    t.setAttribute('aria-expanded', 'false');
                });
                
                if (!isOpen && dropdown) {
                    dropdown.classList.add('active');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.brand-card-modern')) {
                document.querySelectorAll('.mega-menu-modern.active').forEach(menu => {
                    menu.classList.remove('active');
                });
                document.querySelectorAll('.mega-menu-trigger-modern, .mega-menu-trigger').forEach(trigger => {
                    trigger.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }
    
    /**
     * Initialize scroll-based effects
     */
    function initScrollEffects() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('.modern-header')?.offsetHeight || 0;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, targetId);
                }
            });
        });
        
        // Active navigation highlighting
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link-modern');
        
        function highlightNav() {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const scrollY = window.scrollY + 100;
                
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-nav') === current) {
                    link.classList.add('active');
                }
            });
        }
        
        window.addEventListener('scroll', highlightNav);
        highlightNav(); // Initial check
    }

    /**
     * Initialize Mega Menu functionality
     * Handles hover/click interactions, keyboard navigation, and mobile support
     */
    function initMegaMenu() {
        const megaMenuContainers = document.querySelectorAll('.mega-menu-container');
        const overlay = createMegaMenuOverlay();
        
        megaMenuContainers.forEach(container => {
            const trigger = container.querySelector('.mega-menu-trigger');
            const dropdown = container.querySelector('.mega-menu-dropdown');
            
            if (!trigger || !dropdown) return;
            
            // Desktop hover behavior
            if (!window.isMobileDevice()) {
                container.addEventListener('mouseenter', () => {
                    openMegaMenu(container, overlay);
                });
                
                container.addEventListener('mouseleave', () => {
                    closeMegaMenu(container, overlay);
                });
            }
            
            // Click behavior for all devices
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMegaMenu(container, overlay);
            });
            
            // Keyboard navigation
            trigger.addEventListener('keydown', (e) => {
                handleMegaMenuKeyboard(e, container, overlay);
            });
            
            // Setup links with external URLs
            setupMegaMenuLinks(container);
            
            // Setup dropdown navigation
            setupDropdownNavigation(dropdown);
        });
        
        // Close on overlay click
        overlay.addEventListener('click', () => {
            closeAllMegaMenus(overlay);
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllMegaMenus(overlay);
            }
        });
        
        // Handle window resize for responsive behavior
        window.addEventListener('resize', debounce(() => {
            closeAllMegaMenus(overlay);
        }, 250));
        
        // Mobile-specific: close menu when tapping outside on mobile devices
        if (window.isMobileDevice()) {
            document.addEventListener('click', (e) => {
                // Check if the click target is outside any mega-menu-container
                if (!e.target.closest('.mega-menu-container')) {
                    closeAllMegaMenus(overlay);
                }
            });
        }
    }

    /**
     * Open mega menu
     */
    function openMegaMenu(container, overlay) {
        // Close other open menus
        closeAllMegaMenus(overlay, container);
        
        container.classList.add('active');
        overlay.classList.add('active');
        
        const trigger = container.querySelector('.mega-menu-trigger');
        const dropdown = container.querySelector('.mega-menu-dropdown');
        
        trigger.setAttribute('aria-expanded', 'true');
        dropdown.setAttribute('aria-hidden', 'false');
        
        // Focus first link for keyboard users
        const firstLink = dropdown.querySelector('.mega-menu-link');
        if (firstLink && document.activeElement === trigger) {
            setTimeout(() => firstLink.focus(), 100);
        }
        
        // Track menu open event
        if (typeof trackMegaMenuEvent === 'function') {
            const brandSection = container.closest('.brand-section');
            const brand = brandSection?.id || trigger?.dataset.brand || null;
            const category = trigger.getAttribute('data-category');
            
            if (brand) {
                trackMegaMenuEvent('mega_menu_open', {
                    brand: brand,
                    category: category
                });
            }
        }
    }

    /**
     * Close mega menu
     */
    function closeMegaMenu(container, overlay) {
        container.classList.remove('active');
        
        const trigger = container.querySelector('.mega-menu-trigger');
        const dropdown = container.querySelector('.mega-menu-dropdown');
        
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
        
        // Check if any menus are still open
        const openMenus = document.querySelectorAll('.mega-menu-container.active');
        if (openMenus.length === 0) {
            overlay.classList.remove('active');
        }
    }

    /**
     * Toggle mega menu
     */
    function toggleMegaMenu(container, overlay) {
        if (container.classList.contains('active')) {
            closeMegaMenu(container, overlay);
        } else {
            openMegaMenu(container, overlay);
        }
    }

    /**
     * Close all mega menus
     */
    function closeAllMegaMenus(overlay, except = null) {
        const openMenus = document.querySelectorAll('.mega-menu-container.active');
        openMenus.forEach(menu => {
            if (menu !== except) {
                closeMegaMenu(menu, overlay);
            }
        });
    }

    /**
     * Handle keyboard navigation for mega menu
     */
    function handleMegaMenuKeyboard(e, container, overlay) {
        const dropdown = container.querySelector('.mega-menu-dropdown');
        const links = dropdown.querySelectorAll('.mega-menu-link');
        
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                toggleMegaMenu(container, overlay);
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (container.classList.contains('active')) {
                    links[0]?.focus();
                } else {
                    openMegaMenu(container, overlay);
                }
                break;
            case 'Escape':
                closeMegaMenu(container, overlay);
                container.querySelector('.mega-menu-trigger').focus();
                break;
        }
    }

    /**
     * Handle navigation within dropdown
     */
    function setupDropdownNavigation(dropdown) {
        const links = dropdown.querySelectorAll('.mega-menu-link');
        
        links.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextIndex = (index + 1) % links.length;
                        links[nextIndex].focus();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        const prevIndex = (index - 1 + links.length) % links.length;
                        links[prevIndex].focus();
                        break;
                    case 'Escape':
                        const container = dropdown.closest('.mega-menu-container');
                        const trigger = container.querySelector('.mega-menu-trigger');
                        const overlay = document.querySelector('.mega-menu-overlay');
                        closeMegaMenu(container, overlay);
                        trigger.focus();
                        break;
                }
            });
        });
    }

    /**
     * Setup mega menu links with external URLs
     */
    function setupMegaMenuLinks(container) {
        const links = container.querySelectorAll('.mega-menu-link[data-category]');
        const trigger = container.querySelector('.mega-menu-trigger');
        const brandSection = container.closest('.brand-section');
        const brand = brandSection?.id || trigger?.dataset.brand || 'unknown';
        
        // Get configuration functions from mega-menu-config.js
        const generateUrlFunc = window.generateSubcategoryUrl || window.generateCategoryUrl;
        const getSubcategoriesFunc = window.getSubcategories;
        
        if (!generateUrlFunc) {
            console.warn('Mega menu URL generation functions not found');
            return;
        }
        
        if (!brand) {
            console.warn('Unable to determine brand for mega menu links');
            return;
        }
        
        links.forEach(link => {
            const category = link.getAttribute('data-category');
            const subcategory = link.getAttribute('data-subcategory');
            
            if (category) {
                // Generate proper URL based on category and subcategory
                let url;
                if (subcategory && generateUrlFunc === window.generateSubcategoryUrl) {
                    url = generateUrlFunc(brand, category, { slug: subcategory });
                } else if (window.generateCategoryUrl) {
                    url = window.generateCategoryUrl(brand, category, subcategory);
                } else {
                    url = '#';
                }
                
                link.href = url;
                
                // Set target for external links
                if (url !== '#') {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }
                
                // Add analytics tracking
                link.addEventListener('click', (e) => {
                    // Don't prevent default for valid external links
                    if (url === '#') {
                        e.preventDefault();
                        return;
                    }
                    
                    // Track click event
                    if (typeof trackMegaMenuEvent === 'function' && brand) {
                        trackMegaMenuEvent('mega_menu_link_click', {
                            brand: brand,
                            category: category,
                            subcategory: subcategory,
                            url: url
                        });
                    }
                    
                    // Close menu after click
                    const overlay = document.querySelector('.mega-menu-overlay');
                    setTimeout(() => {
                        closeAllMegaMenus(overlay);
                    }, 100);
                });
            }
        });
    }

    /**
     * Create mega menu overlay
     */
    function createMegaMenuOverlay() {
        let overlay = document.querySelector('.mega-menu-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mega-menu-overlay';
            document.body.appendChild(overlay);
        }
        
        return overlay;
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    function initSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]:not(.mega-menu-link)');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    e.preventDefault();
                    
                    // Calculate offset for fixed header
                    const headerHeight = document.querySelector('.site-header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    }
                }
            });
        });
    }
    
    /**
     * Initialize scroll-based animations for all sections
     */
    function initScrollAnimations() {
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            console.warn('Intersection Observer not supported');
            return;
        }
        
        const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-fade-in, .animate-slide-left, .animate-slide-right, .animate-scale-in');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add staggered delay for grouped elements
                    const parent = entry.target.closest('.stagger-container');
                    if (parent) {
                        const siblings = parent.querySelectorAll('.animate-on-scroll, .animate-fade-in, .animate-slide-left, .animate-slide-right, .animate-scale-in');
                        const index = Array.from(siblings).indexOf(entry.target);
                        
                        setTimeout(() => {
                            entry.target.classList.add('animated');
                        }, index * 100); // 100ms delay between elements
                    } else {
                        entry.target.classList.add('animated');
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Initialize parallax effects for background elements with performance optimization
     */
    function initParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        if (parallaxElements.length === 0) return;
        
        let ticking = false;
        let isTabVisible = true;
        
        // Add will-change for performance
        parallaxElements.forEach(element => {
            element.style.willChange = 'transform';
        });
        
        function updateParallax() {
            if (!isTabVisible) {
                ticking = false;
                return;
            }
            
            const scrollTop = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking && isTabVisible) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        // Only enable parallax on non-mobile devices
        if (!window.isMobileDevice()) {
            window.addEventListener('scroll', requestTick, { passive: true });
            
            // Pause when tab is hidden
            document.addEventListener('visibilitychange', () => {
                isTabVisible = !document.hidden;
            });
        }
    }

    /**
     * Initialize micro-animations for logos and icons
     */
    function initMicroAnimations() {
        // Logo hover animations
        const brandLogos = document.querySelectorAll('.brand-logo');
        brandLogos.forEach(logo => {
            logo.addEventListener('mouseenter', () => {
                logo.style.animation = 'logoFloat 2s ease-in-out infinite';
            });
            
            logo.addEventListener('mouseleave', () => {
                logo.style.animation = '';
            });
        });
        
        // Icon animations in feature cards
        const featureIcons = document.querySelectorAll('.feature-card .icon, .advantage-icon');
        featureIcons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.animation = 'iconBounce 0.6s ease-out';
            });
            
            icon.addEventListener('animationend', () => {
                icon.style.animation = '';
            });
        });
        
        // Button hover enhancements
        const buttons = document.querySelectorAll('.btn-primary, .form-submit, .contact-link');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.02)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }

    /**
     * Enhanced smooth scrolling with easing
     */
    function initSmoothScrollingEnhanced() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]:not(.mega-menu-link)');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    e.preventDefault();
                    
                    // Calculate offset for fixed header
                    const headerHeight = document.querySelector('.site-header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    // Enhanced smooth scroll with custom easing
                    smoothScrollTo(targetPosition, 800);
                    
                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    }
                    
                    // Update active navigation
                    updateActiveNavigation(targetId);
                }
            });
        });
    }

    /**
     * Custom smooth scroll function with easing
     */
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuart(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function easeInOutQuart(t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t*t*t + b;
            t -= 2;
            return -c/2 * (t*t*t*t - 2) + b;
        }
        
        requestAnimationFrame(animation);
    }

    /**
     * Initialize navigation highlighting based on scroll position
     */
    function initNavigationHighlighting() {
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        const sections = document.querySelectorAll('section[id], .brand-section[id]');
        
        if (sections.length === 0) return;
        
        function updateActiveNavigation(activeId = null) {
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            if (activeId) {
                // Set specific active link
                const activeLink = document.querySelector(`.nav-menu a[href="${activeId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            } else {
                // Determine active section based on scroll position
                const scrollPosition = window.pageYOffset + 100;
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    const sectionId = '#' + section.id;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        const activeLink = document.querySelector(`.nav-menu a[href="${sectionId}"]`);
                        if (activeLink) {
                            activeLink.classList.add('active');
                        }
                    }
                });
            }
        }
        
        // Update on scroll
        window.addEventListener('scroll', debounce(() => {
            updateActiveNavigation();
        }, 100));
        
        // Initial update
        updateActiveNavigation();
        
        // Export function for use in other modules
        window.updateActiveNavigation = updateActiveNavigation;
    }
    
    /**
     * Optimize animations for performance
     */
    function optimizeAnimations() {
        // Add GPU acceleration to animated elements
        const animatedElements = document.querySelectorAll('.brand-card, .feature-card, .product-card, .news-card, .advantage-card');
        animatedElements.forEach(element => {
            element.classList.add('gpu-accelerated');
        });
        
        // Pause animations when tab is not visible
        document.addEventListener('visibilitychange', () => {
            const animatedElements = document.querySelectorAll('[style*="animation"]');
            animatedElements.forEach(element => {
                if (document.hidden) {
                    element.style.animationPlayState = 'paused';
                } else {
                    element.style.animationPlayState = 'running';
                }
            });
        });
    }

    /**
     * Initialize lazy loading for images
     * Placeholder for future implementation with Intersection Observer
     */
    function initLazyLoading() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            const imageElements = document.querySelectorAll('img[data-lazy]');
            
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.lazy;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            imageElements.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers that don't support Intersection Observer
            console.log('Lazy loading not supported in this browser');
        }
    }

    /**
     * Initialize enhanced contact links functionality
     */
    function initContactLinks() {
        const contactLinks = document.querySelectorAll('[data-contact-type]');
        
        contactLinks.forEach(link => {
            const contactType = link.getAttribute('data-contact-type');
            
            link.addEventListener('click', function(e) {
                handleContactClick(e, this, contactType);
            });
            
            // Add hover effects for better UX
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }
    
    /**
     * Handle contact link clicks with fallbacks and analytics
     */
    function handleContactClick(event, element, contactType) {
        const href = element.getAttribute('href');
        const fallback = element.getAttribute('data-fallback');
        
        // Track contact interaction
        trackContactInteraction(contactType, href);
        
        // Handle Viber fallback for desktop
        if (contactType === 'viber' && !window.isMobileDevice()) {
            event.preventDefault();
            
            // Try to open Viber, fallback to phone call
            const viberWindow = window.open(href, '_blank');
            
            // Check if Viber opened successfully
            setTimeout(() => {
                if (viberWindow && viberWindow.closed) {
                    // Viber didn't open, show fallback options
                    showContactFallback(element, fallback);
                }
            }, 1000);
            
            // Fallback after 3 seconds
            setTimeout(() => {
                if (viberWindow) {
                    viberWindow.close();
                    showContactFallback(element, fallback);
                }
            }, 3000);
        }
        
        // Show success toast for successful contact attempts
        if (contactType === 'telegram' || contactType === 'email' || contactType === 'phone') {
            setTimeout(() => {
                showContactToast(contactType);
            }, 500);
        }
    }
    
    /**
     * Show contact fallback options
     */
    function showContactFallback(element, fallback) {
        if (!fallback) return;
        
        const toast = createToast(
            'Не вдалося відкрити Viber',
            `<a href="${fallback}" class="toast-link">Подзвонити замість цього</a>`,
            'warning',
            5000
        );
        
        // Handle fallback link click
        const fallbackLink = toast.querySelector('.toast-link');
        if (fallbackLink) {
            fallbackLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = fallback;
                toast.remove();
                trackContactInteraction('phone_fallback', fallback);
            });
        }
    }
    
    /**
     * Show contact success toast
     */
    function showContactToast(contactType) {
        const messages = {
            telegram: 'Переходимо в Telegram...',
            email: 'Відкриваємо поштовий клієнт...',
            phone: 'Набираємо номер...'
        };
        
        const message = messages[contactType] || 'Перенаправляємо...';
        createToast('Контакт', message, 'success', 2000);
    }
    
    /**
     * Create toast notification
     */
    function createToast(title, message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="toast-title">${title}</strong>
                <button class="toast-close" aria-label="Закрити">&times;</button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        
        // Style the toast
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            max-width: 400px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-left: 4px solid ${getToastColor(type)};
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                removeToast(toast);
            }, duration);
        }
        
        return toast;
    }
    
    /**
     * Remove toast with animation
     */
    function removeToast(toast) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    /**
     * Get toast color based on type
     */
    function getToastColor(type) {
        const colors = {
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }
    
    /**
     * Track contact interactions for analytics
     */
    function trackContactInteraction(contactType, href) {
        console.log(`Contact interaction: ${contactType} - ${href}`);
        
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_click', {
                'event_category': 'Contact',
                'event_label': contactType,
                'contact_method': contactType,
                'contact_url': href
            });
        }
        
        // Custom analytics can be added here
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'contact_interaction',
                'contact_type': contactType,
                'contact_url': href
            });
        }
    }

    /**
     * Utility function to detect mobile devices - Now using window.isMobileDevice from mega-menu-config.js
     */

    /**
     * Utility function to debounce function calls
     */
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

    /**
     * Initialize scroll handler for sticky header behavior
     */
    function initScrollHandler() {
        const header = document.querySelector('.site-header');
        
        // Guard against missing header element
        if (!header) {
            console.warn('Header element not found');
            return;
        }
        
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', debounce(function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.classList.add('header-hidden');
            } else {
                // Scrolling up
                header.classList.remove('header-hidden');
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, 100));
    }

    /**
     * Initialize FAQ Accordion functionality
     */
    function initFAQAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                question.addEventListener('click', function() {
                    const isActive = item.classList.contains('active');
                    
                    // Close all other FAQ items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherQuestion = otherItem.querySelector('.faq-question');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            if (otherQuestion && otherAnswer) {
                                otherQuestion.setAttribute('aria-expanded', 'false');
                                otherAnswer.setAttribute('aria-hidden', 'true');
                            }
                        }
                    });
                    
                    // Toggle current item
                    if (isActive) {
                        item.classList.remove('active');
                        question.setAttribute('aria-expanded', 'false');
                        answer.setAttribute('aria-hidden', 'true');
                    } else {
                        item.classList.add('active');
                        question.setAttribute('aria-expanded', 'true');
                        answer.setAttribute('aria-hidden', 'false');
                    }
                });
                
                // Add keyboard support
                question.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        question.click();
                    }
                });
                
                // Make questions focusable and set initial ARIA states
                question.setAttribute('tabindex', '0');
                question.setAttribute('role', 'button');
                question.setAttribute('aria-expanded', 'false');
                answer.setAttribute('aria-hidden', 'true');
            }
        });
    }

    /**
     * Initialize Testimonial Slider
     */
    function initTestimonialSlider() {
        const slider = document.querySelector('.testimonial-slider');
        const track = document.querySelector('.testimonial-track');
        const dots = document.querySelectorAll('.testimonial-dot');
        const cards = document.querySelectorAll('.testimonial-card');
        
        if (!slider || !track || dots.length === 0 || cards.length === 0) {
            return; // Exit if elements are not found
        }
        
        let currentSlide = 0;
        const totalSlides = cards.length;
        let autoSlideInterval;
        
        function goToSlide(slideIndex) {
            // Ensure slideIndex is within bounds
            currentSlide = (slideIndex + totalSlides) % totalSlides;
            
            // Move track
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
            
            // Update ARIA labels
            cards.forEach((card, index) => {
                card.setAttribute('aria-hidden', index !== currentSlide);
            });
        }
        
        function nextSlide() {
            goToSlide(currentSlide + 1);
        }
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 5000); // Auto-advance every 5 seconds
        }
        
        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
            }
        }
        
        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                stopAutoSlide();
                startAutoSlide(); // Restart auto-slide after manual interaction
            });
            
            // Keyboard support
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dot.click();
                }
            });
            
            dot.setAttribute('tabindex', '0');
            dot.setAttribute('role', 'button');
        });
        
        // Touch/swipe support
        let startX = 0;
        let isDragging = false;
        
        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            stopAutoSlide();
        });
        
        slider.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        slider.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    goToSlide(currentSlide + 1); // Swipe left - next slide
                } else {
                    goToSlide(currentSlide - 1); // Swipe right - previous slide
                }
            }
            
            isDragging = false;
            startAutoSlide();
        });
        
        // Pause auto-slide on hover
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
        
        // Initialize
        goToSlide(0);
        startAutoSlide();
    }

    /**
     * Initialize Contact Form functionality
     */
    function initContactForm() {
        const form = document.getElementById('contactForm');
        
        if (!form) return;
        
        // Float label functionality
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            const label = group.querySelector('label');
            
            if (input && label) {
                // Check initial state
                updateLabelState();
                
                input.addEventListener('focus', updateLabelState);
                input.addEventListener('blur', updateLabelState);
                input.addEventListener('input', updateLabelState);
                
                function updateLabelState() {
                    const hasValue = input.value.trim() !== '';
                    const isFocused = document.activeElement === input;
                    
                    if (hasValue || isFocused) {
                        label.classList.add('floating');
                    } else {
                        label.classList.remove('floating');
                    }
                }
            }
        });
        
        // Form validation and submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const submitButton = form.querySelector('.form-submit');
            
            // Basic validation
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const message = formData.get('message').trim();
            
            if (!name || !email || !message) {
                showFormMessage('Будь ласка, заповніть всі обов\'язкові поля.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showFormMessage('Будь ласка, введіть коректний email.', 'error');
                return;
            }
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Відправляється...';
            
            // Simulate form submission (replace with actual endpoint)
            setTimeout(() => {
                // Reset form
                form.reset();
                
                // Reset button
                submitButton.disabled = false;
                submitButton.textContent = 'Відправити повідомлення';
                
                // Show success message
                showFormMessage('Дякуємо! Ваше повідомлення відправлено. Ми зв\'яжемося з вами найближчим часом.', 'success');
                
                // Update floating labels
                formGroups.forEach(group => {
                    const label = group.querySelector('label');
                    if (label) {
                        label.classList.remove('floating');
                    }
                });
            }, 1500);
        });
        
        function showFormMessage(message, type) {
            // Remove existing message
            const existingMessage = form.querySelector('.form-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // Create message element
            const messageEl = document.createElement('div');
            messageEl.className = `form-message form-message-${type}`;
            messageEl.textContent = message;
            messageEl.style.cssText = `
                margin-top: 1rem;
                padding: 0.75rem;
                border-radius: 4px;
                font-size: 0.9rem;
                background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
                color: ${type === 'success' ? '#155724' : '#721c24'};
                border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
            `;
            
            form.appendChild(messageEl);
            
            // Remove message after 5 seconds
            setTimeout(() => {
                messageEl.remove();
            }, 5000);
        }
        
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
    }

    /**
     * Initialize Statistics Animation
     */
    function initStatsAnimation() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        if (statNumbers.length === 0) return;
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        statNumbers.forEach(stat => observer.observe(stat));
        
        function animateNumber(element) {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const start = performance.now();
            
            function updateNumber(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out)
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(easedProgress * target);
                
                element.textContent = current.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    element.textContent = target.toLocaleString();
                }
            }
            
            requestAnimationFrame(updateNumber);
        }
    }

    /**
     * Initialize Mobile Menu (for future use)
     */
    function initMobileMenu() {
        // Mobile menu functionality placeholder
        // This will be expanded when mobile hamburger menu is added
        
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;
        
        // Add responsive behavior enhancements
        window.addEventListener('resize', debounce(() => {
            // Handle responsive navigation changes
            if (window.innerWidth > 768) {
                // Desktop view - ensure menu is visible
                navMenu.style.display = '';
            }
        }, 100));
        
        // Keyboard navigation enhancement
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextIndex = (index + 1) % navLinks.length;
                    navLinks[nextIndex].focus();
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevIndex = (index - 1 + navLinks.length) % navLinks.length;
                    navLinks[prevIndex].focus();
                }
            });
        });
    }

    /**
     * Scroll to top functionality
     */
    function addScrollToTop() {
        // Create scroll to top button
        const scrollButton = document.createElement('button');
        scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollButton.className = 'scroll-to-top';
        scrollButton.setAttribute('aria-label', 'Прокрутити до верху');
        scrollButton.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            font-size: 1.2rem;
        `;
        
        document.body.appendChild(scrollButton);
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', debounce(() => {
            if (window.pageYOffset > 300) {
                scrollButton.style.opacity = '1';
                scrollButton.style.visibility = 'visible';
            } else {
                scrollButton.style.opacity = '0';
                scrollButton.style.visibility = 'hidden';
            }
        }, 100));
        
        // Scroll to top functionality
        scrollButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Export functions for potential use in other modules
     * (Structure for future modular development)
     */
    window.GardenaLand = {
        init: function() {
            console.log('GardenaLand module initialized');
        },
        utils: {
            isMobileDevice: window.isMobileDevice,
            debounce: debounce
        },
        modules: {
            navigation: initNavigation,
            megaMenu: initMegaMenu,
            faq: initFAQAccordion,
            testimonials: initTestimonialSlider,
            contactForm: initContactForm,
            stats: initStatsAnimation,
            scrollAnimations: initScrollAnimations,
            parallax: initParallaxEffects,
            microAnimations: initMicroAnimations
        },
        megaMenu: {
            open: openMegaMenu,
            close: closeMegaMenu,
            toggle: toggleMegaMenu,
            closeAll: closeAllMegaMenus
        }
    };
    
    /**
     * Initialize SuperDesign components
     */
    function initSuperDesignComponents() {
        // Initialize glassmorphism header scroll effects
        const header = document.querySelector('.glassmorphism');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    header.style.background = 'rgba(255, 255, 255, 0.95)';
                    header.style.backdropFilter = 'blur(12px)';
                } else {
                    header.style.background = 'rgba(255, 255, 255, 0.85)';
                    header.style.backdropFilter = 'blur(10px)';
                }
            });
        }
        
        // Initialize card hover effects
        const cards = document.querySelectorAll('.card-hover');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
        
        // Initialize floating elements animation
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.5}s`;
        });
    }
    
    /**
     * Initialize product showcase functionality
     */
    function initProductShowcase() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const cartBtn = card.querySelector('.cart-btn');
            if (cartBtn) {
                cartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Add to cart animation
                    cartBtn.classList.add('pulse-animation');
                    setTimeout(() => {
                        cartBtn.classList.remove('pulse-animation');
                    }, 1000);
                    
                    // Show toast notification
                    showToast('Товар додано до кошика!', 'success');
                });
            }
            
            // Add hover effect for product images
            const productImg = card.querySelector('img');
            if (productImg) {
                card.addEventListener('mouseenter', () => {
                    productImg.style.transform = 'scale(1.1)';
                    productImg.style.transition = 'transform 0.3s ease';
                });
                card.addEventListener('mouseleave', () => {
                    productImg.style.transform = 'scale(1)';
                });
            }
        });
    }
    
    /**
     * Initialize CTA banner functionality
     */
    function initCTABanner() {
        const ctaBanner = document.querySelector('.cta-banner');
        const ctaButtons = document.querySelectorAll('.cta-banner button');
        
        if (ctaBanner) {
            // Add scroll-triggered animation
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('slide-up');
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(ctaBanner);
        }
        
        ctaButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.textContent.includes('Отримати знижку')) {
                    e.preventDefault();
                    // Show discount modal or redirect
                    showToast('Промокод: SPRING10 скопійовано!', 'info');
                    // Copy to clipboard
                    navigator.clipboard.writeText('SPRING10');
                } else if (btn.textContent.includes('Дізнатися більше')) {
                    e.preventDefault();
                    // Scroll to products or show more info
                    document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
    
    /**
     * Initialize improved testimonials
     */
    function initImprovedTestimonials() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        
        testimonialCards.forEach(card => {
            // Add hover effect
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = '#fb923c'; // orange-400
                card.style.transform = 'translateY(-4px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = '#f3f4f6'; // gray-100
                card.style.transform = 'translateY(0)';
            });
            
            // Animate stars on hover
            const stars = card.querySelectorAll('.star');
            card.addEventListener('mouseenter', () => {
                stars.forEach((star, index) => {
                    setTimeout(() => {
                        star.style.transform = 'scale(1.2)';
                        setTimeout(() => {
                            star.style.transform = 'scale(1)';
                        }, 200);
                    }, index * 100);
                });
            });
        });
    }
    
    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideInUp 0.3s ease;
            font-weight: 500;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Initialize scroll to top
    addScrollToTop();

})();