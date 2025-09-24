/**
 * Layout Manager - Client-side module for managing dynamic layouts and content
 * Integrates with landing-hydrate.js, strapi-api.js, and SuperDesign components
 */

class LayoutManager {
  constructor() {
    this.initialized = false;
    this.config = null;
    this.components = new Map();
    this.superDesignComponents = new Map();
    this.fallbackComponents = new Map();
    this.debugMode = this.isDebugMode();
    this.eventListeners = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    
    // Performance tracking
    this.performance = {
      loadTimes: new Map(),
      errors: [],
      cacheHits: 0,
      cacheMisses: 0
    };

    // Hydration integration
    this.hydrationState = {
      isRunning: false,
      completedSections: new Set(),
      failedSections: new Set(),
      progress: 0,
      startTime: null
    };

    // Event system for coordination
    this.eventBus = new Map();
    this.hydrationListeners = new Map();

    // Bind methods
    this.log = this.log.bind(this);
    this.error = this.error.bind(this);
    this.debug = this.debug.bind(this);
    
    this.log('LayoutManager initialized', { debugMode: this.debugMode });
    this.setupHydrationIntegration();
  }

  // Logging methods with detailed error tracking
  log(message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data,
      component: 'LayoutManager'
    };
    
    console.log(`[LayoutManager] ${message}`, data || '');
    
    // Send to server in production for monitoring
    if (!this.debugMode && typeof window.reportLog === 'function') {
      window.reportLog(logEntry);
    }
  }

  error(message, error = null, context = null) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null,
      context,
      component: 'LayoutManager',
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.error(`[LayoutManager ERROR] ${message}`, error || '', context || '');
    this.performance.errors.push(errorEntry);
    
    // Send critical errors to monitoring service
    if (typeof window.reportError === 'function') {
      window.reportError(errorEntry);
    }
  }

  debug(message, data = null) {
    if (this.debugMode) {
      console.debug(`[LayoutManager DEBUG] ${message}`, data || '');
    }
  }

  warn(message, data = null) {
    console.warn(`[LayoutManager WARN] ${message}`, data || '');
  }

  isDebugMode() {
    return localStorage.getItem('layoutManager.debug') === 'true' || 
           window.location.search.includes('debug=true') ||
           window.location.hostname === 'localhost';
  }

  /**
   * Setup integration with LandingHydrate system
   */
  setupHydrationIntegration() {
    // Listen for hydration events
    this.addEventListener('landingHydrate:started', (event) => {
      this.onHydrationStarted(event.detail);
    });

    this.addEventListener('landingHydrate:progress', (event) => {
      this.onHydrationProgress(event.detail);
    });

    this.addEventListener('landingHydrate:completed', (event) => {
      this.onHydrationCompleted(event.detail);
    });

    this.addEventListener('landingHydrate:error', (event) => {
      this.onHydrationError(event.detail);
    });

    this.addEventListener('landingHydrate:offline', (event) => {
      this.onHydrationOffline(event.detail);
    });

    this.addEventListener('hydration:progress', (event) => {
      this.updateHydrationProgress(event.detail);
    });

    this.debug('Hydration integration setup completed');
  }

  /**
   * Handle hydration started event
   */
  onHydrationStarted(detail) {
    this.hydrationState.isRunning = true;
    this.hydrationState.startTime = Date.now();
    this.hydrationState.completedSections.clear();
    this.hydrationState.failedSections.clear();
    
    this.log('🌱 Hydration started', detail);
    
    // Show loading indicators
    this.showLoadingStates();
    
    // Disable interactive elements during hydration
    this.disableInteractiveElements();
  }

  /**
   * Handle hydration progress updates
   */
  onHydrationProgress(detail) {
    const { section, status, duration } = detail;
    
    if (status === 'completed') {
      this.hydrationState.completedSections.add(section);
      this.log(`✅ Section ${section} completed`, { duration });
    } else if (status === 'error') {
      this.hydrationState.failedSections.add(section);
      this.error(`❌ Section ${section} failed`, detail.error);
    }
    
    this.updateProgressIndicators();
  }

  /**
   * Update hydration progress indicators
   */
  updateHydrationProgress(detail) {
    const { completed, total, percentage } = detail;
    this.hydrationState.progress = percentage;
    
    this.debug(`Hydration progress: ${percentage}%`, { completed, total });
    
    // Update UI progress indicators
    document.querySelectorAll('.hydration-progress-bar').forEach(bar => {
      bar.style.width = `${percentage}%`;
    });
    
    document.querySelectorAll('.hydration-percentage').forEach(el => {
      el.textContent = `${percentage}%`;
    });
  }

  /**
   * Handle hydration completion
   */
  onHydrationCompleted(detail) {
    this.hydrationState.isRunning = false;
    const duration = Date.now() - this.hydrationState.startTime;
    
    this.log('🎉 Hydration completed successfully', {
      duration: `${duration}ms`,
      completedSections: Array.from(this.hydrationState.completedSections),
      failedSections: Array.from(this.hydrationState.failedSections),
      performance: detail.performance
    });
    
    // Hide loading indicators
    this.hideLoadingStates();
    
    // Re-enable interactive elements
    this.enableInteractiveElements();
    
    // Initialize post-hydration features
    this.initializePostHydrationFeatures();
    
    // Clean up skeleton states
    this.cleanupSkeletonStates();
  }

  /**
   * Handle hydration errors
   */
  onHydrationError(detail) {
    this.hydrationState.isRunning = false;
    
    this.error('💥 Hydration failed', detail.error, {
      performance: detail.performance,
      completedSections: Array.from(this.hydrationState.completedSections),
      failedSections: Array.from(this.hydrationState.failedSections)
    });
    
    // Show error state
    this.showErrorState(detail);
    
    // Enable fallback mode
    this.enableFallbackMode();
  }

  /**
   * Handle offline hydration mode
   */
  onHydrationOffline(detail) {
    this.log('📡 Hydration running in offline mode', detail);
    
    // Show offline indicator
    this.showOfflineIndicator();
    
    // Enable static content features
    this.enableStaticContentFeatures();
  }

  /**
   * Show loading states during hydration
   */
  showLoadingStates() {
    document.body.classList.add('hydration-loading');
    
    // Add skeleton states to data-editable elements
    document.querySelectorAll('[data-editable]').forEach(el => {
      if (!el.classList.contains('skeleton-text')) {
        el.classList.add('loading-state');
      }
    });
  }

  /**
   * Hide loading states after hydration
   */
  hideLoadingStates() {
    document.body.classList.remove('hydration-loading');
    document.body.classList.add('hydration-complete');
    
    // Remove skeleton states
    document.querySelectorAll('.loading-state').forEach(el => {
      el.classList.remove('loading-state');
    });
  }

  /**
   * Disable interactive elements during hydration
   */
  disableInteractiveElements() {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    interactiveElements.forEach(el => {
      el.style.pointerEvents = 'none';
      el.style.opacity = '0.6';
    });
  }

  /**
   * Re-enable interactive elements after hydration
   */
  enableInteractiveElements() {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    interactiveElements.forEach(el => {
      el.style.pointerEvents = '';
      el.style.opacity = '';
    });
  }

  /**
   * Initialize post-hydration features
   */
  initializePostHydrationFeatures() {
    // Initialize enhanced interactions
    this.setupIntersectionObserver();
    this.setupScrollAnimations();
    this.setupFormEnhancements();
    
    this.log('Post-hydration features initialized');
  }

  /**
   * Clean up skeleton states
   */
  cleanupSkeletonStates() {
    document.querySelectorAll('.skeleton-text, .skeleton-image').forEach(el => {
      el.remove();
    });
  }

  /**
   * Show error state UI
   */
  showErrorState(detail) {
    const errorBanner = document.createElement('div');
    errorBanner.id = 'hydration-error-banner';
    errorBanner.className = 'fixed top-0 left-0 right-0 bg-red-100 border-b border-red-300 p-3 z-50';
    errorBanner.innerHTML = `
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-red-600">⚠️</span>
          <span class="text-red-800 text-sm">Деякий контент може відображатися некоректно</span>
        </div>
        <button class="text-red-600 hover:text-red-800" onclick="this.parentElement.parentElement.remove()">
          ✕
        </button>
      </div>
    `;
    
    document.body.insertBefore(errorBanner, document.body.firstChild);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorBanner.parentNode) {
        errorBanner.remove();
      }
    }, 10000);
  }

  /**
   * Enable fallback mode
   */
  enableFallbackMode() {
    document.body.classList.add('fallback-mode');
    document.body.classList.remove('hydration-complete');
    
    this.log('Fallback mode enabled');
  }

  /**
   * Show offline indicator
   */
  showOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.className = 'fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800 z-50';
    indicator.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>📡</span>
        <span>Режим офлайн</span>
      </div>
    `;
    
    document.body.appendChild(indicator);
  }

  /**
   * Enable static content features
   */
  enableStaticContentFeatures() {
    // Enable local interactions that don't require API
    this.setupLocalSearch();
    this.setupClientSideFiltering();
    
    this.log('Static content features enabled');
  }

  /**
   * Setup local search functionality
   */
  setupLocalSearch() {
    const searchInputs = document.querySelectorAll('[data-search]');
    searchInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.handleLocalSearch(e.target);
      });
    });
  }

  /**
   * Handle local search
   */
  handleLocalSearch(input) {
    const query = input.value.toLowerCase();
    const target = input.getAttribute('data-search');
    const items = document.querySelectorAll(`[data-searchable="${target}"]`);
    
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });
  }

  /**
   * Setup client-side filtering
   */
  setupClientSideFiltering() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleClientSideFilter(e.target);
      });
    });
  }

  /**
   * Handle client-side filtering
   */
  handleClientSideFilter(button) {
    const filter = button.getAttribute('data-filter');
    const target = button.getAttribute('data-filter-target');
    const items = document.querySelectorAll(`[data-filterable="${target}"]`);
    
    items.forEach(item => {
      const categories = item.getAttribute('data-categories')?.split(',') || [];
      item.style.display = filter === 'all' || categories.includes(filter) ? '' : 'none';
    });
    
    // Update active button
    document.querySelectorAll(`[data-filter-target="${target}"]`).forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');
  }

  /**
   * Enhanced event listener setup with automatic cleanup
   */
  addEventListener(eventName, handler) {
    document.addEventListener(eventName, handler);
    
    // Store for cleanup
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(handler);
    
    this.debug('Event listener added', { eventName });
  }

  /**
   * Update progress indicators in UI
   */
  updateProgressIndicators() {
    const completed = this.hydrationState.completedSections.size;
    const failed = this.hydrationState.failedSections.size;
    const total = completed + failed;
    
    if (total > 0) {
      const successRate = Math.round((completed / total) * 100);
      
      // Update progress indicators
      document.querySelectorAll('.hydration-success-rate').forEach(el => {
        el.textContent = `${successRate}%`;
      });
    }
  }

  // Initialization and configuration
  async init() {
    if (this.initialized) {
      this.debug('LayoutManager already initialized');
      return;
    }

    const startTime = performance.now();
    
    try {
      this.log('Starting LayoutManager initialization');

      // Load configuration
      await this.loadConfiguration();
      
      // Initialize DOM observers
      this.initializeDOMObservers();
      
      // Load fallback components
      await this.loadFallbackComponents();
      
      // Register SuperDesign integration
      this.registerSuperDesignIntegration();
      
      // Initialize attribute management
      this.initializeAttributeManagement();
      
      // Set up error handlers
      this.setupErrorHandlers();
      
      // Initialize caching
      this.initializeCache();
      
      // Mark as initialized
      this.initialized = true;
      
      const initTime = performance.now() - startTime;
      this.performance.loadTimes.set('initialization', initTime);
      
      this.log('LayoutManager initialization completed', { 
        initTime: `${initTime.toFixed(2)}ms`,
        componentsRegistered: this.components.size,
        superDesignComponentsFound: this.superDesignComponents.size
      });

      // Dispatch initialization event
      this.dispatchEvent('layoutManager:initialized', {
        initTime,
        debugMode: this.debugMode,
        componentsCount: this.components.size
      });

    } catch (error) {
      this.error('Failed to initialize LayoutManager', error);
      throw error;
    }
  }

  async loadConfiguration() {
    try {
      // Try to load mapping configuration
      const configResponse = await this.fetchWithRetry('/config/layout-mapping.json');
      this.config = await configResponse.json();
      
      this.debug('Configuration loaded', {
        version: this.config.version,
        mappingsCount: this.config.mappings?.length || 0,
        lastAnalysis: this.config.lastAnalysis
      });

    } catch (error) {
      this.warn('Failed to load configuration, using defaults', error);
      this.config = this.getDefaultConfiguration();
    }
  }

  getDefaultConfiguration() {
    return {
      version: '1.0.0',
      mappings: [],
      validation_rules: {},
      error_handling: {
        missing_element_action: 'log_warning',
        invalid_content_action: 'use_fallback',
        selector_conflict_action: 'use_highest_confidence',
        api_error_action: 'use_cached_content'
      },
      performance: {
        cache_duration: 300,
        retry_attempts: 3,
        timeout_seconds: 10
      }
    };
  }

  initializeDOMObservers() {
    try {
      // Mutation observer for dynamic content changes
      if ('MutationObserver' in window) {
        this.mutationObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              this.handleDOMChanges(mutation);
            }
          });
        });

        this.mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-editable', 'data-component-type']
        });

        this.debug('DOM mutation observer initialized');
      }

      // Intersection observer for component visibility
      if ('IntersectionObserver' in window) {
        this.intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.handleComponentVisible(entry.target);
            }
          });
        }, { rootMargin: '100px' });

        this.debug('Intersection observer initialized');
      }

    } catch (error) {
      this.error('Failed to initialize DOM observers', error);
    }
  }

  handleDOMChanges(mutation) {
    try {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check for data-editable attributes
          const editableElements = node.querySelectorAll('[data-editable]');
          if (editableElements.length > 0) {
            this.debug('New editable elements detected', { count: editableElements.length });
            editableElements.forEach(el => this.registerEditableElement(el));
          }

          // Check for SuperDesign components
          if (node.hasAttribute && node.hasAttribute('data-superdesign-component')) {
            this.debug('New SuperDesign component detected');
            this.registerSuperDesignComponent(node);
          }
        }
      });
    } catch (error) {
      this.error('Error handling DOM changes', error);
    }
  }

  handleComponentVisible(element) {
    try {
      const componentType = element.getAttribute('data-component-type');
      if (componentType) {
        this.debug('Component became visible', { componentType });
        
        // Trigger lazy loading or initialization
        this.initializeVisibleComponent(element, componentType);
      }
    } catch (error) {
      this.error('Error handling component visibility', error);
    }
  }

  async loadFallbackComponents() {
    try {
      const fallbackMappings = [
        { key: 'header', path: '/templates/header-fallback.html' },
        { key: 'hero', path: '/templates/hero-fallback.html' },
        { key: 'brands', path: '/templates/brands-fallback.html' },
        { key: 'products', path: '/templates/products-fallback.html' },
        { key: 'testimonials', path: '/templates/testimonials-fallback.html' },
        { key: 'features', path: '/templates/features-fallback.html' },
        { key: 'footer', path: '/templates/footer-fallback.html' }
      ];

      for (const mapping of fallbackMappings) {
        try {
          const response = await fetch(mapping.path);
          if (response.ok) {
            const content = await response.text();
            this.fallbackComponents.set(mapping.key, content);
            this.debug('Fallback component loaded', { component: mapping.key });
          }
        } catch (error) {
          this.debug('Fallback component not available', { 
            component: mapping.key, 
            error: error.message 
          });
        }
      }

      this.log('Fallback components loaded', { 
        count: this.fallbackComponents.size,
        components: Array.from(this.fallbackComponents.keys())
      });

    } catch (error) {
      this.error('Failed to load fallback components', error);
    }
  }

  registerSuperDesignIntegration() {
    try {
      // Listen for SuperDesign component events
      document.addEventListener('superdesign:component:ready', (event) => {
        this.handleSuperDesignComponentReady(event.detail);
      });

      // Scan for existing SuperDesign components
      const existingComponents = document.querySelectorAll('[data-superdesign-component]');
      existingComponents.forEach(component => {
        this.registerSuperDesignComponent(component);
      });

      this.debug('SuperDesign integration registered', { 
        existingComponents: existingComponents.length 
      });

    } catch (error) {
      this.error('Failed to register SuperDesign integration', error);
    }
  }

  handleSuperDesignComponentReady(detail) {
    try {
      this.log('SuperDesign component ready', detail);
      
      const { componentType, timestamp } = detail;
      this.superDesignComponents.set(componentType, {
        ready: true,
        timestamp,
        element: document.querySelector(`[data-component-type="${componentType}"]`)
      });

      // Initialize component-specific functionality
      this.initializeSuperDesignComponent(componentType);

    } catch (error) {
      this.error('Error handling SuperDesign component ready event', error, detail);
    }
  }

  registerSuperDesignComponent(element) {
    try {
      const componentType = element.getAttribute('data-component-type') || 'unknown';
      const sourceFile = element.getAttribute('data-superdesign-source') || 'unknown';
      
      this.superDesignComponents.set(componentType, {
        element,
        sourceFile,
        registered: true,
        timestamp: new Date().toISOString()
      });

      // Add to intersection observer
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(element);
      }

      this.debug('SuperDesign component registered', { componentType, sourceFile });

    } catch (error) {
      this.error('Failed to register SuperDesign component', error);
    }
  }

  initializeSuperDesignComponent(componentType) {
    try {
      const component = this.superDesignComponents.get(componentType);
      if (!component || !component.element) {
        this.warn('SuperDesign component not found for initialization', { componentType });
        return;
      }

      const element = component.element;

      // Initialize interactive elements
      this.initializeInteractiveElements(element);
      
      // Set up component-specific functionality
      switch (componentType) {
        case 'header':
          this.initializeHeaderComponent(element);
          break;
        case 'hero':
          this.initializeHeroComponent(element);
          break;
        case 'products':
          this.initializeProductsComponent(element);
          break;
        case 'testimonials':
          this.initializeTestimonialsComponent(element);
          break;
        default:
          this.initializeGenericComponent(element, componentType);
      }

      this.debug('SuperDesign component initialized', { componentType });

    } catch (error) {
      this.error('Failed to initialize SuperDesign component', error, { componentType });
    }
  }

  initializeInteractiveElements(element) {
    try {
      // Initialize buttons
      const buttons = element.querySelectorAll('.btn, .button, [role="button"]');
      buttons.forEach(button => {
        if (!button.hasAttribute('data-initialized')) {
          this.initializeButton(button);
          button.setAttribute('data-initialized', 'true');
        }
      });

      // Initialize links
      const internalLinks = element.querySelectorAll('a[href^="#"], a[href^="/"]');
      internalLinks.forEach(link => {
        if (!link.hasAttribute('data-initialized')) {
          this.initializeInternalLink(link);
          link.setAttribute('data-initialized', 'true');
        }
      });

      // Initialize forms
      const forms = element.querySelectorAll('form');
      forms.forEach(form => {
        if (!form.hasAttribute('data-initialized')) {
          this.initializeForm(form);
          form.setAttribute('data-initialized', 'true');
        }
      });

    } catch (error) {
      this.error('Failed to initialize interactive elements', error);
    }
  }

  initializeButton(button) {
    try {
      // Add click tracking
      button.addEventListener('click', (event) => {
        const buttonText = button.textContent.trim();
        const buttonId = button.id || 'unnamed';
        
        this.debug('Button clicked', { 
          buttonText, 
          buttonId, 
          href: button.getAttribute('href') 
        });

        // Track button clicks for analytics
        if (typeof window.trackEvent === 'function') {
          window.trackEvent('button_click', {
            button_text: buttonText,
            button_id: buttonId,
            component_type: button.closest('[data-component-type]')?.getAttribute('data-component-type')
          });
        }
      });

      // Add keyboard accessibility
      if (button.tagName !== 'BUTTON' && !button.hasAttribute('role')) {
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        
        button.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            button.click();
          }
        });
      }

    } catch (error) {
      this.error('Failed to initialize button', error);
    }
  }

  initializeInternalLink(link) {
    try {
      const href = link.getAttribute('href');
      
      if (href.startsWith('#')) {
        // Smooth scroll for anchor links
        link.addEventListener('click', (event) => {
          event.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            targetElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
            
            this.debug('Smooth scroll to section', { targetId });
          } else {
            this.warn('Scroll target not found', { targetId });
          }
        });
      }

    } catch (error) {
      this.error('Failed to initialize internal link', error);
    }
  }

  initializeForm(form) {
    try {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData);
        
        this.debug('Form submitted', { formData: formObject });
        
        // Handle form submission
        this.handleFormSubmission(form, formObject);
      });

    } catch (error) {
      this.error('Failed to initialize form', error);
    }
  }

  async handleFormSubmission(form, formData) {
    try {
      this.log('Processing form submission', { formData });
      
      // Show loading state
      const submitButton = form.querySelector('[type="submit"]');
      const originalText = submitButton?.textContent;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Відправляємо...';
      }

      // Simulate form processing (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      this.showNotification('Форма успішно відправлена!', 'success');
      form.reset();
      
      // Restore button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }

    } catch (error) {
      this.error('Failed to handle form submission', error);
      this.showNotification('Помилка при відправці форми. Спробуйте ще раз.', 'error');
    }
  }

  initializeHeaderComponent(element) {
    try {
      // Mobile menu toggle
      const hamburger = element.querySelector('.hamburger-menu, .mobile-menu-toggle');
      const mobileMenu = element.querySelector('.mobile-menu, .nav-mobile');
      
      if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
          const isOpen = mobileMenu.classList.contains('open');
          mobileMenu.classList.toggle('open', !isOpen);
          hamburger.classList.toggle('active', !isOpen);
          
          this.debug('Mobile menu toggled', { isOpen: !isOpen });
        });
      }

      // Sticky header on scroll
      let lastScrollY = window.scrollY;
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
          element.classList.add('scrolled');
          
          // Hide/show header on scroll direction
          if (currentScrollY > lastScrollY) {
            element.classList.add('hidden');
          } else {
            element.classList.remove('hidden');
          }
        } else {
          element.classList.remove('scrolled', 'hidden');
        }
        
        lastScrollY = currentScrollY;
      });

      this.debug('Header component initialized');

    } catch (error) {
      this.error('Failed to initialize header component', error);
    }
  }

  initializeHeroComponent(element) {
    try {
      // Parallax effect for hero background
      const heroBackground = element.querySelector('.hero-background, .background');
      
      if (heroBackground) {
        window.addEventListener('scroll', () => {
          const scrolled = window.pageYOffset;
          const parallax = scrolled * 0.5;
          heroBackground.style.transform = `translateY(${parallax}px)`;
        });
      }

      // Typing animation for hero text
      const heroTitle = element.querySelector('[data-editable*="main_title"]');
      if (heroTitle && !heroTitle.hasAttribute('data-animated')) {
        this.animateTyping(heroTitle);
        heroTitle.setAttribute('data-animated', 'true');
      }

      this.debug('Hero component initialized');

    } catch (error) {
      this.error('Failed to initialize hero component', error);
    }
  }

  animateTyping(element) {
    try {
      const text = element.textContent;
      element.textContent = '';
      element.style.borderRight = '2px solid #F15922';
      
      let i = 0;
      const typeInterval = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        
        if (i >= text.length) {
          clearInterval(typeInterval);
          setTimeout(() => {
            element.style.borderRight = 'none';
          }, 500);
        }
      }, 100);

    } catch (error) {
      this.error('Failed to animate typing', error);
    }
  }

  initializeProductsComponent(element) {
    try {
      // Product grid filtering
      const filterButtons = element.querySelectorAll('.filter-btn, [data-filter]');
      const productItems = element.querySelectorAll('.product, .product-card');
      
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          const filter = button.getAttribute('data-filter') || 'all';
          this.filterProducts(productItems, filter);
          
          // Update active filter button
          filterButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          this.debug('Products filtered', { filter });
        });
      });

      // Product quick view
      productItems.forEach(product => {
        const quickViewBtn = product.querySelector('.quick-view, [data-quick-view]');
        if (quickViewBtn) {
          quickViewBtn.addEventListener('click', (event) => {
            event.preventDefault();
            this.showProductQuickView(product);
          });
        }
      });

      this.debug('Products component initialized');

    } catch (error) {
      this.error('Failed to initialize products component', error);
    }
  }

  filterProducts(products, filter) {
    try {
      products.forEach(product => {
        const productCategory = product.getAttribute('data-category') || '';
        const shouldShow = filter === 'all' || productCategory === filter;
        
        product.style.display = shouldShow ? 'block' : 'none';
        
        if (shouldShow) {
          product.classList.add('fade-in');
          setTimeout(() => product.classList.remove('fade-in'), 300);
        }
      });

    } catch (error) {
      this.error('Failed to filter products', error);
    }
  }

  showProductQuickView(productElement) {
    try {
      const productTitle = productElement.querySelector('[data-editable*="title"]')?.textContent || 'Product';
      const productPrice = productElement.querySelector('[data-editable*="price"]')?.textContent || 'Price not available';
      const productImage = productElement.querySelector('img')?.src || '';
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'product-modal-overlay';
      modal.innerHTML = `
        <div class="product-modal">
          <div class="modal-header">
            <h3>${productTitle}</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <img src="${productImage}" alt="${productTitle}" />
            <div class="product-info">
              <p class="price">${productPrice}</p>
              <button class="btn btn-primary">Додати в кошик</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';
      
      // Close modal
      const closeModal = () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
      };
      
      modal.querySelector('.modal-close').addEventListener('click', closeModal);
      modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
      });

      this.debug('Product quick view opened', { productTitle });

    } catch (error) {
      this.error('Failed to show product quick view', error);
    }
  }

  initializeTestimonialsComponent(element) {
    try {
      // Testimonials carousel
      const testimonials = element.querySelectorAll('.testimonial, .review');
      const prevBtn = element.querySelector('.carousel-prev');
      const nextBtn = element.querySelector('.carousel-next');
      
      if (testimonials.length > 1) {
        let currentIndex = 0;
        
        const showTestimonial = (index) => {
          testimonials.forEach((testimonial, i) => {
            testimonial.style.display = i === index ? 'block' : 'none';
          });
        };
        
        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
            showTestimonial(currentIndex);
          });
        }
        
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
          });
        }
        
        // Auto-play carousel
        setInterval(() => {
          currentIndex = (currentIndex + 1) % testimonials.length;
          showTestimonial(currentIndex);
        }, 5000);
        
        // Initialize first testimonial
        showTestimonial(0);
      }

      this.debug('Testimonials component initialized');

    } catch (error) {
      this.error('Failed to initialize testimonials component', error);
    }
  }

  initializeGenericComponent(element, componentType) {
    try {
      // Generic initialization for unknown component types
      this.debug('Generic component initialization', { componentType });
      
      // Add intersection observer for animations
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(element);
      }

    } catch (error) {
      this.error('Failed to initialize generic component', error, { componentType });
    }
  }

  initializeAttributeManagement() {
    try {
      // Scan for existing data-editable elements
      const editableElements = document.querySelectorAll('[data-editable]');
      editableElements.forEach(element => {
        this.registerEditableElement(element);
      });

      this.debug('Attribute management initialized', { 
        editableElements: editableElements.length 
      });

    } catch (error) {
      this.error('Failed to initialize attribute management', error);
    }
  }

  registerEditableElement(element) {
    try {
      const dataEditable = element.getAttribute('data-editable');
      const componentType = element.getAttribute('data-component-type') || 'unknown';
      
      if (!this.components.has(dataEditable)) {
        this.components.set(dataEditable, {
          element,
          dataEditable,
          componentType,
          registered: new Date().toISOString()
        });
        
        this.debug('Editable element registered', { dataEditable, componentType });
      }

    } catch (error) {
      this.error('Failed to register editable element', error);
    }
  }

  // Content management methods
  async updateContent(dataEditable, newContent, options = {}) {
    const startTime = performance.now();
    
    try {
      const component = this.components.get(dataEditable);
      if (!component) {
        throw new Error(`Component not found: ${dataEditable}`);
      }

      const { element } = component;
      const oldContent = element.textContent || element.innerHTML;

      // Validate content if rules are provided
      if (this.config.validation_rules && !this.validateContent(newContent, dataEditable)) {
        throw new Error(`Content validation failed for ${dataEditable}`);
      }

      // Update content with animation if requested
      if (options.animate) {
        await this.animateContentUpdate(element, newContent);
      } else {
        if (element.tagName === 'IMG') {
          element.src = newContent;
          element.alt = options.alt || newContent;
        } else {
          element.textContent = newContent;
        }
      }

      // Cache the update
      this.cacheContent(dataEditable, newContent);

      const updateTime = performance.now() - startTime;
      this.performance.loadTimes.set(`update_${dataEditable}`, updateTime);

      this.log('Content updated successfully', {
        dataEditable,
        oldContent: oldContent.substring(0, 50),
        newContent: newContent.substring(0, 50),
        updateTime: `${updateTime.toFixed(2)}ms`
      });

      // Dispatch update event
      this.dispatchEvent('layoutManager:contentUpdated', {
        dataEditable,
        oldContent,
        newContent,
        element
      });

      return true;

    } catch (error) {
      this.error('Failed to update content', error, { dataEditable, newContent });
      
      // Try fallback content if available
      if (this.config.error_handling.invalid_content_action === 'use_fallback') {
        return this.useFallbackContent(dataEditable);
      }
      
      return false;
    }
  }

  validateContent(content, dataEditable) {
    try {
      const rules = this.config.validation_rules;
      if (!rules) return true;

      // Get field type from data-editable path
      const fieldType = this.getFieldType(dataEditable);
      const fieldRules = rules[fieldType];

      if (!fieldRules) return true;

      // Validate based on field type
      switch (fieldType) {
        case 'text':
          return this.validateTextContent(content, fieldRules);
        case 'price':
          return this.validatePriceContent(content, fieldRules);
        case 'email':
          return this.validateEmailContent(content, fieldRules);
        case 'phone':
          return this.validatePhoneContent(content, fieldRules);
        case 'rating':
          return this.validateRatingContent(content, fieldRules);
        default:
          return true;
      }

    } catch (error) {
      this.error('Content validation error', error, { content, dataEditable });
      return false;
    }
  }

  getFieldType(dataEditable) {
    // Extract field type from data-editable attribute
    if (dataEditable.includes('price')) return 'price';
    if (dataEditable.includes('email')) return 'email';
    if (dataEditable.includes('phone')) return 'phone';
    if (dataEditable.includes('rating')) return 'rating';
    return 'text';
  }

  validateTextContent(content, rules) {
    if (rules.max_length && content.length > rules.max_length) return false;
    if (rules.min_length && content.length < rules.min_length) return false;
    return true;
  }

  validatePriceContent(content, rules) {
    const price = parseFloat(content);
    if (isNaN(price)) return false;
    if (rules.min_value && price < rules.min_value) return false;
    if (rules.max_value && price > rules.max_value) return false;
    return true;
  }

  validateEmailContent(content, rules) {
    const emailRegex = new RegExp(rules.validation_regex || /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    return emailRegex.test(content);
  }

  validatePhoneContent(content, rules) {
    const phoneRegex = new RegExp(rules.validation_regex || /^\+?[\d\s\(\)-]+$/);
    return phoneRegex.test(content);
  }

  validateRatingContent(content, rules) {
    const rating = parseFloat(content);
    if (isNaN(rating)) return false;
    if (rules.min_value && rating < rules.min_value) return false;
    if (rules.max_value && rating > rules.max_value) return false;
    return true;
  }

  async animateContentUpdate(element, newContent) {
    return new Promise((resolve) => {
      // Fade out
      element.style.transition = 'opacity 0.3s ease';
      element.style.opacity = '0';
      
      setTimeout(() => {
        // Update content
        if (element.tagName === 'IMG') {
          element.src = newContent;
        } else {
          element.textContent = newContent;
        }
        
        // Fade in
        element.style.opacity = '1';
        
        setTimeout(() => {
          element.style.transition = '';
          resolve();
        }, 300);
      }, 300);
    });
  }

  // Integration methods
  async integrateWithHydrate() {
    try {
      if (typeof window.LandingHydrate !== 'undefined') {
        const hydrate = window.LandingHydrate;
        
        // Hook into hydration events
        if (hydrate.on) {
          hydrate.on('contentLoaded', (data) => {
            this.handleHydrateContent(data);
          });
          
          hydrate.on('error', (error) => {
            this.handleHydrateError(error);
          });
        }
        
        this.log('Integrated with LandingHydrate');
      } else {
        this.debug('LandingHydrate not available');
      }

    } catch (error) {
      this.error('Failed to integrate with hydrate system', error);
    }
  }

  handleHydrateContent(data) {
    try {
      this.debug('Hydrate content received', data);
      
      // Map hydrated content to layout components
      Object.entries(data).forEach(([key, value]) => {
        const mappedElements = this.findElementsByContentKey(key);
        mappedElements.forEach(element => {
          this.updateElementContent(element, value);
        });
      });

    } catch (error) {
      this.error('Failed to handle hydrate content', error);
    }
  }

  handleHydrateError(error) {
    this.error('Hydrate system error', error);
    
    // Activate fallback components if hydration fails
    this.activateFallbackComponents();
  }

  findElementsByContentKey(key) {
    // Find elements that match the content key
    const elements = [];
    
    this.components.forEach((component, dataEditable) => {
      if (dataEditable.includes(key)) {
        elements.push(component.element);
      }
    });
    
    return elements;
  }

  updateElementContent(element, value) {
    try {
      if (element.tagName === 'IMG') {
        element.src = value;
      } else {
        element.textContent = value;
      }

    } catch (error) {
      this.error('Failed to update element content', error);
    }
  }

  async activateFallbackComponents() {
    try {
      this.log('Activating fallback components');
      
      for (const [componentType, content] of this.fallbackComponents) {
        const container = document.querySelector(`#${componentType}-container, .${componentType}-container`);
        if (container) {
          container.innerHTML = content;
          this.log('Fallback component activated', { componentType });
        }
      }

    } catch (error) {
      this.error('Failed to activate fallback components', error);
    }
  }

  // Utility methods
  async fetchWithRetry(url, options = {}) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          timeout: this.config.performance?.timeout_seconds * 1000 || 10000
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
        
      } catch (error) {
        lastError = error;
        this.debug(`Fetch attempt ${attempt} failed`, { url, error: error.message });
        
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    
    throw lastError;
  }

  initializeCache() {
    try {
      this.cache = new Map();
      this.cacheExpiry = new Map();
      
      // Cache cleanup interval
      setInterval(() => {
        this.cleanupExpiredCache();
      }, 60000); // Cleanup every minute
      
      this.debug('Cache initialized');

    } catch (error) {
      this.error('Failed to initialize cache', error);
    }
  }

  cacheContent(key, content) {
    try {
      const expiryTime = Date.now() + (this.config.performance?.cache_duration * 1000 || 300000);
      this.cache.set(key, content);
      this.cacheExpiry.set(key, expiryTime);
      
      this.debug('Content cached', { key, expiryTime });

    } catch (error) {
      this.error('Failed to cache content', error);
    }
  }

  getCachedContent(key) {
    try {
      const expiryTime = this.cacheExpiry.get(key);
      if (!expiryTime || Date.now() > expiryTime) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        this.performance.cacheMisses++;
        return null;
      }
      
      this.performance.cacheHits++;
      return this.cache.get(key);

    } catch (error) {
      this.error('Failed to get cached content', error);
      return null;
    }
  }

  cleanupExpiredCache() {
    try {
      const now = Date.now();
      let cleanedCount = 0;
      
      for (const [key, expiryTime] of this.cacheExpiry) {
        if (now > expiryTime) {
          this.cache.delete(key);
          this.cacheExpiry.delete(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        this.debug('Cache cleanup completed', { cleanedCount });
      }

    } catch (error) {
      this.error('Failed to cleanup cache', error);
    }
  }

  setupErrorHandlers() {
    try {
      // Global error handler
      window.addEventListener('error', (event) => {
        if (event.filename && event.filename.includes('layout-manager')) {
          this.error('Global JavaScript error', event.error, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          });
        }
      });

      // Unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled promise rejection', event.reason);
      });

      this.debug('Error handlers setup completed');

    } catch (error) {
      this.error('Failed to setup error handlers', error);
    }
  }

  dispatchEvent(eventName, detail) {
    try {
      const event = new CustomEvent(eventName, { detail });
      document.dispatchEvent(event);
      
      this.debug('Event dispatched', { eventName, detail });

    } catch (error) {
      this.error('Failed to dispatch event', error, { eventName });
    }
  }

  showNotification(message, type = 'info', duration = 5000) {
    try {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
        <div class="notification-content">
          <span class="notification-message">${message}</span>
          <button class="notification-close">&times;</button>
        </div>
      `;
      
      // Add to page
      document.body.appendChild(notification);
      
      // Auto-remove after duration
      const timeoutId = setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, duration);
      
      // Manual close
      notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(timeoutId);
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      });

    } catch (error) {
      this.error('Failed to show notification', error);
      // Fallback to alert
      alert(message);
    }
  }

  // Performance and debugging methods
  getPerformanceReport() {
    return {
      ...this.performance,
      cacheStats: {
        size: this.cache.size,
        hitRatio: this.performance.cacheHits / (this.performance.cacheHits + this.performance.cacheMisses) || 0
      },
      componentsRegistered: this.components.size,
      superDesignComponents: this.superDesignComponents.size,
      initialized: this.initialized
    };
  }

  enableDebugMode() {
    this.debugMode = true;
    localStorage.setItem('layoutManager.debug', 'true');
    this.log('Debug mode enabled');
  }

  disableDebugMode() {
    this.debugMode = false;
    localStorage.removeItem('layoutManager.debug');
    this.log('Debug mode disabled');
  }

  // Public API methods
  registerComponent(key, element, options = {}) {
    try {
      this.components.set(key, {
        element,
        ...options,
        registered: new Date().toISOString()
      });
      
      this.debug('Component registered via API', { key, options });
      return true;

    } catch (error) {
      this.error('Failed to register component via API', error, { key });
      return false;
    }
  }

  // Cleanup method
  destroy() {
    try {
      // Remove event listeners
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
      }
      
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
      }
      
      // Clear caches
      this.cache.clear();
      this.cacheExpiry.clear();
      this.components.clear();
      this.superDesignComponents.clear();
      
      // Reset state
      this.initialized = false;
      
      this.log('LayoutManager destroyed');

    } catch (error) {
      this.error('Failed to destroy LayoutManager', error);
    }
  }
}

// Global instance
window.LayoutManager = new LayoutManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.LayoutManager.init().catch(error => {
      console.error('Failed to initialize LayoutManager:', error);
    });
  });
} else {
  window.LayoutManager.init().catch(error => {
    console.error('Failed to initialize LayoutManager:', error);
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutManager;
}