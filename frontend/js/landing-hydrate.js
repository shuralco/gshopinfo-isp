/**
 * Landing Hydrate - гідратація лендінгу динамічним контентом зі Strapi
 * Зберігає всі стилі та структуру, додає fallback підтримку
 * 
 * Responsibilities:
 * - LandingHydrate: Content hydration, API data fetching, rendering dynamic content
 * - EditorManager (if exists): Advanced editing features, complex editor UI
 * - Built-in inline editing: Simple contentEditable functionality for quick edits
 * - LayoutManager integration: Automatic layout system compatibility
 * - Enhanced logging: Detailed error tracking and performance monitoring
 */
class LandingHydrate {
    constructor(strapiAPI, layoutManager) {
        this.api = strapiAPI || window.strapiAPI;
        this.layoutManager = layoutManager || window.layoutManager;
        this.isHydrated = false;
        this.loadingElements = new Set();
        this.retryQueue = new Map();
        this.hydrationProgress = new Map();
        
        // Enhanced logging and error tracking
        this.logger = this.layoutManager || console;
        this.performance = {
            startTime: null,
            hydrationTimes: new Map(),
            errors: [],
            apiCalls: 0,
            cacheHits: 0,
            fallbackCount: 0,
            sections: {
                'site-settings': { status: 'pending', startTime: null, duration: 0 },
                'hero-section': { status: 'pending', startTime: null, duration: 0 },
                'brands': { status: 'pending', startTime: null, duration: 0 },
                'products': { status: 'pending', startTime: null, duration: 0 },
                'testimonials': { status: 'pending', startTime: null, duration: 0 },
                'features': { status: 'pending', startTime: null, duration: 0 }
            }
        };
        
        // Integration with LayoutManager
        this.eventListeners = new Map();
        this.progressBar = null;
        
        this.log('LandingHydrate initialized', {
            apiAvailable: !!this.api,
            layoutManagerAvailable: !!this.layoutManager
        });
    }

    /**
     * Ініціалізація гідратації після завантаження DOM
     */
    async init() {
        if (this.isHydrated) return;

        try {
            this.log('🌱 Starting landing hydration...');
            this.performance.startTime = performance.now();
            
            // Dispatch started event
            const sections = [
                { name: 'site-settings', method: 'hydrateSiteSettings' },
                { name: 'hero-section', method: 'hydrateHero' },
                { name: 'brands', method: 'hydrateBrands' },
                { name: 'products', method: 'hydrateProducts' },
                { name: 'testimonials', method: 'hydrateTestimonials' },
                { name: 'features', method: 'hydrateFeatures' }
            ];
            
            if (this.layoutManager) {
                this.layoutManager.dispatchEvent('landingHydrate:started', { sections });
            }
            
            // Показати loading states
            this.showGlobalLoading();
            
            // Перевірити доступність API
            const isOnline = await this.api.isOnline();
            if (!isOnline) {
                this.warn('⚠️ Strapi API unavailable, using static content');
                this.performance.fallbackCount++;
                this.hideGlobalLoading();
                // Still initialize the editor for offline mode
                this.initVisualEditor();
                
                // Notify LayoutManager about offline state
                if (this.layoutManager) {
                    this.layoutManager.dispatchEvent('landingHydrate:offline', {
                        reason: 'api_unavailable',
                        fallbackMode: true
                    });
                }
                return;
            }

            // Гідратувати секції з прогресом та покращеним error handling
            const sections = [
                { name: 'site-settings', method: 'hydrateSiteSettings' },
                { name: 'hero-section', method: 'hydrateHero' },
                { name: 'brands', method: 'hydrateBrands' },
                { name: 'products', method: 'hydrateProducts' },
                { name: 'testimonials', method: 'hydrateTestimonials' },
                { name: 'features', method: 'hydrateFeatures' }
            ];

            let completed = 0;
            this.updateProgress(completed, sections.length);

            const results = [];
            for (const section of sections) {
                const startTime = performance.now();
                this.performance.sections[section.name].status = 'loading';
                this.performance.sections[section.name].startTime = startTime;

                try {
                    await this[section.method]();
                    const duration = performance.now() - startTime;
                    this.performance.sections[section.name].status = 'completed';
                    this.performance.sections[section.name].duration = duration;
                    results.push({ status: 'fulfilled', value: section.name });
                    
                    this.log(`✅ ${section.name} hydrated successfully`, { duration: `${duration.toFixed(2)}ms` });
                } catch (error) {
                    const duration = performance.now() - startTime;
                    this.performance.sections[section.name].status = 'error';
                    this.performance.sections[section.name].duration = duration;
                    this.performance.sections[section.name].error = error.message;
                    results.push({ status: 'rejected', reason: error });
                    
                    this.error(`❌ ${section.name} hydration failed`, error);
                    this.performance.fallbackCount++;
                    
                    // Try to show skeleton states for failed sections
                    this.showFallbackContent(section.name);
                }

                completed++;
                this.updateProgress(completed, sections.length);
                
                // Small delay between sections for better UX
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            this.logHydrationResults(results);

            this.isHydrated = true;
            this.hideGlobalLoading();
            
            const hydrationTime = performance.now() - this.performance.startTime;
            this.performance.hydrationTimes.set('total', hydrationTime);
            
            this.log('✅ Landing hydration completed', {
                duration: `${hydrationTime.toFixed(2)}ms`,
                apiCalls: this.performance.apiCalls,
                cacheHits: this.performance.cacheHits,
                errors: this.performance.errors.length,
                fallbacks: this.performance.fallbackCount
            });

            // Нотифікувати LayoutManager про завершення
            if (this.layoutManager) {
                this.layoutManager.dispatchEvent('landingHydrate:completed', {
                    duration: hydrationTime,
                    performance: this.performance
                });
            }

            // Ініціалізувати візуальний редактор після гідратації
            this.initVisualEditor();

        } catch (error) {
            this.error('❌ Hydration failed', error, {
                isHydrated: this.isHydrated,
                apiCalls: this.performance.apiCalls,
                retryQueueSize: this.retryQueue.size
            });
            
            this.performance.errors.push({
                type: 'hydration_failure',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            
            this.hideGlobalLoading();
            
            // Нотифікувати LayoutManager про помилку
            if (this.layoutManager) {
                this.layoutManager.dispatchEvent('landingHydrate:error', {
                    error,
                    performance: this.performance
                });
            }
        }
    }

    /**
     * Показати глобальний loading state з progress bar
     */
    showGlobalLoading() {
        if (document.getElementById('hydration-progress')) return;
        
        const progressBar = document.createElement('div');
        progressBar.id = 'hydration-progress';
        progressBar.className = 'hydration-progress';
        progressBar.innerHTML = `
            <div class="progress-fill" style="width: 0%"></div>
        `;
        document.body.appendChild(progressBar);
        this.progressBar = progressBar;
        
        // Додати індикатор завантаження в header
        const headerIndicator = document.createElement('div');
        headerIndicator.id = 'hydration-indicator';
        headerIndicator.className = 'fixed top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-50 text-sm';
        headerIndicator.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="loading-spinner"></div>
                <span class="text-gray-700">Завантаження контенту...</span>
            </div>
        `;
        document.body.appendChild(headerIndicator);
    }

    /**
     * Оновити прогрес завантаження
     */
    updateProgress(completed, total) {
        const percentage = Math.round((completed / total) * 100);
        
        if (this.progressBar) {
            const fill = this.progressBar.querySelector('.progress-fill');
            if (fill) {
                fill.style.width = `${percentage}%`;
            }
        }
        
        const indicator = document.getElementById('hydration-indicator');
        if (indicator) {
            const span = indicator.querySelector('span');
            if (span) {
                span.textContent = `Завантаження контенту... ${percentage}%`;
            }
        }
        
        // Повідомити LayoutManager про прогрес
        if (this.layoutManager?.dispatchEvent) {
            this.layoutManager.dispatchEvent('landingHydrate:progress', {
                completed,
                total,
                percentage
            });
        }
    }

    /**
     * Приховати глобальний loading state
     */
    hideGlobalLoading() {
        const elements = ['hydration-progress', 'hydration-indicator'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.opacity = '0';
                setTimeout(() => element.remove(), 300);
            }
        });
        this.progressBar = null;
    }

    /**
     * Показати skeleton для елемента
     */
    showSkeleton(element) {
        if (!element) return;
        
        element.classList.add('loading-state');
        this.loadingElements.add(element);
        
        // Add skeleton elements for text content
        const textElements = element.querySelectorAll('[data-editable]');
        textElements.forEach(el => {
            if (!el.querySelector('.skeleton-text')) {
                const skeleton = document.createElement('div');
                skeleton.className = 'skeleton-text';
                skeleton.style.width = `${Math.random() * 40 + 60}%`;
                skeleton.style.height = '1em';
                el.appendChild(skeleton);
            }
        });
    }

    /**
     * Показати fallback контент для секції
     */
    showFallbackContent(sectionName) {
        const fallbackData = this.api?.getFallbackData(sectionName);
        if (!fallbackData?.data) return;

        switch (sectionName) {
            case 'brands':
                this.renderBrands(fallbackData.data);
                break;
            case 'products':
                this.renderProducts(fallbackData.data);
                break;
            case 'testimonials':
                this.renderTestimonials(fallbackData.data);
                break;
            case 'features':
                this.renderFeatures(fallbackData.data);
                break;
            case 'site-settings':
                this.renderSiteSettings(fallbackData.data);
                break;
            case 'hero-section':
                this.renderHeroSection(fallbackData.data);
                break;
        }
    }

    /**
     * Приховати skeleton для елемента
     */
    hideSkeleton(element) {
        if (!element) return;
        
        element.classList.remove('animate-pulse', 'bg-gray-200');
        this.loadingElements.delete(element);
    }

    /**
     * Безпечне оновлення тексту елемента
     */
    updateText(selector, text, fallback) {
        const element = document.querySelector(selector);
        if (element && text) {
            this.hideSkeleton(element);
            element.textContent = text;
        } else if (element && fallback) {
            element.textContent = fallback;
        }
    }

    /**
     * Безпечне оновлення HTML елемента
     */
    updateHTML(selector, html, fallback) {
        const element = document.querySelector(selector);
        if (element && html) {
            this.hideSkeleton(element);
            element.innerHTML = html;
        } else if (element && fallback) {
            element.innerHTML = fallback;
        }
    }

    // ===== ГІДРАТАЦІЯ СЕКЦІЙ =====

    /**
     * Гідратація header секції
     */
    async hydrateHeader() {
        try {
            const response = await this.api.getSiteSettings();
            const data = response?.data;

            if (!data) return;

            // Оновити логотип і назву компанії
            this.updateText('.company-name', data.company_name, 'Garden Tech');
            
            // Оновити контактну інформацію
            this.updateText('.header-phone', data.phone, '+38 (095) 123-45-67');
            this.updateText('.header-email', data.email, 'info@gardentech.ua');
            this.updateText('.header-address', data.address, 'м. Київ, вул. Садова, 15');
            
            // Оновити соціальні посилання
            if (data.social_links) {
                this.updateSocialLinks(data.social_links);
            }

            // Оновити навігацію
            if (data.navigation_menu) {
                this.updateNavigation(data.navigation_menu);
            }

        } catch (error) {
            console.error('Header hydration failed:', error);
        }
    }

    /**
     * Оновити соціальні посилання
     */
    updateSocialLinks(socialLinks) {
        const socialContainer = document.querySelector('.social-links');
        if (!socialContainer || !socialLinks) return;

        const socialHTML = Object.entries(socialLinks)
            .map(([platform, url]) => {
                const icons = {
                    telegram: '📱',
                    viber: '📞',
                    facebook: '📘',
                    instagram: '📷'
                };
                return `<a href="${url}" class="text-green-600 hover:text-green-700">${icons[platform] || '🔗'}</a>`;
            })
            .join('');
        
        socialContainer.innerHTML = socialHTML;
    }

    /**
     * Оновити навігацію
     */
    updateNavigation(navigationMenu) {
        const navContainer = document.querySelector('.main-navigation');
        if (!navContainer || !navigationMenu) return;

        const navHTML = navigationMenu
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(item => `
                <a href="${item.url}" class="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md transition-colors">
                    ${item.label}
                </a>
            `).join('');
        
        navContainer.innerHTML = navHTML;
    }

    /**
     * Гідратація hero секції
     */
    async hydrateHero() {
        try {
            const response = await this.api.getHeroSection();
            const data = response?.data;

            if (!data) return;

            // Оновити badge
            this.updateText('.hero-badge', data.badge_text, '25+ років досвіду');
            
            // Оновити заголовки
            this.updateText('.hero-title', data.main_title, 'Професійний садовий інструмент');
            this.updateText('.hero-subtitle', data.subtitle, 'Все для вашого саду');
            
            // Оновити опис
            const description = data.description?.replace(/<[^>]*>/g, '') || 'Широкий асортимент якісного садового інструменту';
            this.updateText('.hero-description', description);
            
            // Оновити CTA кнопки
            this.updateText('.cta-primary', data.cta_primary_text, 'Переглянути каталог');
            this.updateText('.cta-secondary', data.cta_secondary_text, 'Зв\'язатися з нами');
            
            // Оновити посилання кнопок
            const primaryBtn = document.querySelector('.cta-primary-link');
            const secondaryBtn = document.querySelector('.cta-secondary-link');
            
            if (primaryBtn && data.cta_primary_link) {
                primaryBtn.href = data.cta_primary_link;
            }
            if (secondaryBtn && data.cta_secondary_link) {
                secondaryBtn.href = data.cta_secondary_link;
            }

            // Оновити список переваг
            if (data.features_list) {
                this.updateFeaturesList(data.features_list);
            }

        } catch (error) {
            this.error('Hero hydration failed', error, { section: 'hero' });
            this.performance.errors.push({
                section: 'hero',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Оновити список переваг в hero секції
     */
    updateFeaturesList(featuresList) {
        const container = document.querySelector('.hero-features-list');
        if (!container || !featuresList.length) return;

        const featuresHTML = featuresList.map(feature => `
            <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">${feature.text || feature.label || feature.name}</span>
            </div>
        `).join('');
        
        container.innerHTML = featuresHTML;
    }

    /**
     * Гідратація налаштувань сайту
     */
    async hydrateSiteSettings() {
        try {
            this.performance.apiCalls++;
            const response = await this.api.getSiteSettings();
            
            if (response?.data) {
                this.renderSiteSettings(response.data);
                this.log('Site settings hydrated from API');
            } else {
                throw new Error('No site settings data received');
            }
        } catch (error) {
            this.error('Site settings hydration failed, using fallback', error);
            const fallback = this.api.getFallbackData('site-settings');
            if (fallback?.data) {
                this.renderSiteSettings(fallback.data);
                this.performance.fallbackCount++;
            }
        }
    }

    /**
     * Render site settings data
     */
    renderSiteSettings(settings) {
        // Update phone numbers
        document.querySelectorAll('[data-editable="siteSettings.phone"]').forEach(el => {
            el.textContent = settings.phone;
            if (el.tagName === 'A') {
                el.href = `tel:${settings.phone.replace(/\D/g, '')}`;
            }
        });

        // Update email
        document.querySelectorAll('[data-editable="siteSettings.email"]').forEach(el => {
            el.textContent = settings.email;
            if (el.tagName === 'A') {
                el.href = `mailto:${settings.email}`;
            }
        });

        // Update social links
        if (settings.social_links) {
            Object.entries(settings.social_links).forEach(([platform, url]) => {
                document.querySelectorAll(`[data-editable="siteSettings.social_links.${platform}"]`).forEach(el => {
                    if (el.tagName === 'A') {
                        el.href = url;
                    }
                });
            });
        }

        // Update company info
        document.querySelectorAll('[data-editable="siteSettings.company_name"]').forEach(el => {
            el.textContent = settings.company_name;
        });

        document.querySelectorAll('[data-editable="siteSettings.address"]').forEach(el => {
            el.textContent = settings.address;
        });

        document.querySelectorAll('[data-editable="siteSettings.working_hours"]').forEach(el => {
            el.textContent = settings.working_hours;
        });
    }

    /**
     * Гідратація секції брендів
     */
    /**
     * Покращена гідратація брендів з skeleton states та fallback
     */
    async hydrateBrands() {
        const container = document.getElementById('brands-container');
        if (!container) return;

        try {
            this.performance.apiCalls++;
            const response = await this.api.getBrands();
            
            if (response?.data) {
                this.renderBrands(response.data);
                this.log('Brands hydrated from API', { count: response.data.length });
            } else {
                throw new Error('No brands data received');
            }
        } catch (error) {
            this.error('Brands hydration failed, using fallback', error);
            const fallback = this.api.getFallbackData('brands');
            if (fallback?.data) {
                this.renderBrands(fallback.data);
                this.performance.fallbackCount++;
            }
        }
    }

    /**
     * Render brands data with enhanced UI
     */
    renderBrands(brands) {
        const container = document.getElementById('brands-container');
        if (!container || !brands?.length) return;

        const brandsHTML = brands.map(brand => `
            <div class="flex flex-col" data-brand-id="${brand.id}">
                <div class="brand-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex-grow flex flex-col">
                    <div class="h-4" style="background: linear-gradient(135deg, #F15922 0%, #FF5722 100%);"></div>
                    
                    <div class="p-8 bg-white flex-grow flex flex-col">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center space-x-4">
                                <img src="${brand.logo}" alt="${brand.name}" 
                                     class="h-12 w-auto" 
                                     data-editable="brand.logo" 
                                     data-content-type="brand" 
                                     data-field="logo" 
                                     data-entry-id="${brand.id}">
                                <div>
                                    <p class="text-sm text-gray-500" 
                                       data-editable="brand.established_year" 
                                       data-content-type="brand" 
                                       data-field="established_year" 
                                       data-entry-id="${brand.id}">
                                       ${brand.established_year}
                                    </p>
                                </div>
                            </div>
                            <div class="bg-orange-50 rounded-full px-3 py-1">
                                <span class="text-orange-600 text-xs font-semibold" 
                                      data-editable="brand.quality_badge" 
                                      data-content-type="brand" 
                                      data-field="quality_badge" 
                                      data-entry-id="${brand.id}">
                                      ${brand.quality_badge}
                                </span>
                            </div>
                        </div>
                        
                        <p class="text-gray-600 mb-6 leading-relaxed" 
                           data-editable="brand.description" 
                           data-content-type="brand" 
                           data-field="description" 
                           data-entry-id="${brand.id}">
                           ${brand.description}
                        </p>
                        
                        ${brand.stats ? `
                            <div class="grid grid-cols-3 gap-3 text-center text-sm mb-6">
                                <div class="bg-gray-50 rounded-lg p-3">
                                    <div class="font-bold text-gray-900">${brand.stats.products}</div>
                                    <div class="text-gray-500">товарів</div>
                                </div>
                                <div class="bg-gray-50 rounded-lg p-3">
                                    <div class="font-bold text-gray-900">${brand.stats.experience}</div>
                                    <div class="text-gray-500">досвіду</div>
                                </div>
                                <div class="bg-gray-50 rounded-lg p-3">
                                    <div class="font-bold text-gray-900">${brand.stats.countries || brand.stats.dealers || brand.stats.awards}</div>
                                    <div class="text-gray-500">${brand.stats.countries ? 'країн' : brand.stats.dealers ? 'дилерів' : 'нагород'}</div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="mt-auto">
                            <a href="${brand.website}" target="_blank" 
                               class="w-full btn-primary text-white font-semibold py-3 rounded-lg transition-all duration-200 text-center block">
                               Переглянути товари
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = brandsHTML;
        
        // Remove skeleton states
        this.hideSkeleton(container);
    }

    /**
     * Генерування карточки бренду
     */
    generateBrandCard(brand) {
        const gradientClass = this.getGradientClass(brand.gradient_colors);
        const gradientStyle = gradientClass ? '' : this.getGradientStyle(brand.gradient_colors);
        const categories = brand.categories || [];
        const statistics = brand.statistics || [];

        return `
            <div class="brand-card relative overflow-hidden rounded-2xl p-8 text-white ${gradientClass}"
                 ${gradientStyle ? `style="${gradientStyle}"` : ''}
                 data-editable 
                 data-content-type="brands" 
                 data-field="description" 
                 data-entry-id="${brand.id}">
                
                <div class="relative z-10">
                    <!-- Brand Header -->
                    <div class="flex items-start justify-between mb-6">
                        <div>
                            <div class="flex items-center space-x-3 mb-2">
                                ${brand.logo_url ? `<img src="${brand.logo_url}" alt="${brand.name}" class="w-8 h-8">` : ''}
                                <h3 class="text-2xl font-bold" 
                                    data-editable 
                                    data-content-type="brands" 
                                    data-field="name" 
                                    data-entry-id="${brand.id}">
                                    ${brand.name}
                                </h3>
                            </div>
                            ${brand.since_year ? `<p class="text-white/80">з ${brand.since_year} року</p>` : ''}
                        </div>
                        ${brand.badge_text ? `
                            <span class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                                ${brand.badge_text}
                            </span>
                        ` : ''}
                    </div>

                    <!-- Description -->
                    <div class="mb-6">
                        <p class="text-white/90 leading-relaxed">
                            ${brand.description?.replace(/<[^>]*>/g, '') || 'Опис бренду'}
                        </p>
                    </div>

                    <!-- Categories -->
                    ${categories.length ? `
                        <div class="mb-6">
                            <h4 class="font-semibold mb-3">Категорії товарів:</h4>
                            <div class="grid grid-cols-2 gap-2">
                                ${categories.slice(0, 4).map(category => `
                                    <div class="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                                        <span class="text-sm">${category.icon_svg || '🔧'}</span>
                                        <span class="text-sm">${category.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Statistics -->
                    ${statistics.length ? `
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            ${statistics.slice(0, 2).map(stat => `
                                <div class="text-center">
                                    <div class="text-2xl font-bold">${stat.value}</div>
                                    <div class="text-white/80 text-sm">${stat.label}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- CTA Button -->
                    <div class="flex justify-center">
                        <a href="${brand.catalog_link || '#'}" 
                           class="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 font-medium group">
                            Переглянути каталог
                            <svg class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- Background Pattern -->
                <div class="absolute inset-0 opacity-10">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
            </div>
        `;
    }

    /**
     * Отримати CSS клас градієнту або inline стиль
     */
    getGradientClass(gradientColors) {
        // Known gradient mappings for Tailwind classes
        const knownGradients = {
            'green-blue': 'bg-gradient-to-br from-green-500 to-blue-600',
            'orange-red': 'bg-gradient-to-br from-orange-500 to-red-600',
            'purple-pink': 'bg-gradient-to-br from-purple-500 to-pink-600',
            'blue-cyan': 'bg-gradient-to-br from-blue-500 to-cyan-600',
            'yellow-orange': 'bg-gradient-to-br from-yellow-500 to-orange-600',
            'indigo-purple': 'bg-gradient-to-br from-indigo-500 to-purple-600'
        };
        
        if (!gradientColors || !gradientColors.from || !gradientColors.to) {
            return 'bg-gradient-to-br from-green-500 to-green-600';
        }
        
        // Try to match known combinations
        const combinationKey = `${gradientColors.from}-${gradientColors.to}`;
        if (knownGradients[combinationKey]) {
            return knownGradients[combinationKey];
        }
        
        // Use inline style for unknown combinations
        return '';
    }

    /**
     * Get inline gradient style for unknown color combinations
     */
    getGradientStyle(gradientColors) {
        if (!gradientColors || !gradientColors.from || !gradientColors.to) {
            return '';
        }
        
        // Sanitize color values (basic validation)
        const fromColor = this.sanitizeColor(gradientColors.from);
        const toColor = this.sanitizeColor(gradientColors.to);
        
        if (fromColor && toColor) {
            return `background: linear-gradient(135deg, ${fromColor}, ${toColor});`;
        }
        
        return '';
    }

    /**
     * Basic color value sanitization
     */
    sanitizeColor(color) {
        // Allow hex colors, rgb/rgba, hsl/hsla, and named colors
        const colorPattern = /^(#[a-fA-F0-9]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+)$/;
        return colorPattern.test(color) ? color : null;
    }

    /**
     * Гідратація секції товарів
     */
    async hydrateProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;

        try {
            this.performance.apiCalls++;
            const response = await this.api.getProducts({ featured: true });
            
            if (response?.data) {
                this.renderProducts(response.data);
                this.log('Products hydrated from API', { count: response.data.length });
            } else {
                throw new Error('No products data received');
            }
        } catch (error) {
            this.error('Products hydration failed, using fallback', error);
            const fallback = this.api.getFallbackData('products');
            if (fallback?.data) {
                this.renderProducts(fallback.data);
                this.performance.fallbackCount++;
            }
        }
    }

    /**
     * Render products data
     */
    renderProducts(products) {
        const container = document.getElementById('products-container');
        if (!container || !products?.length) return;

        const productsHTML = products.slice(0, 8).map(product => this.generateProductCard(product)).join('');
        container.innerHTML = productsHTML;
        
        // Remove skeleton states
        this.hideSkeleton(container);
    }

    /**
     * Генерування карточки товару
     */
    generateProductCard(product) {
        const badges = product.badges || [];
        const hasDiscount = product.old_price && product.old_price > product.price;
        
        return `
            <div class="product-card group bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
                 data-editable 
                 data-content-type="products" 
                 data-field="description" 
                 data-entry-id="${product.id}">
                
                <!-- Product Image -->
                <div class="relative mb-4">
                    <img src="${product.image_url || '/images/placeholder-product.jpg'}" 
                         alt="${product.title}" 
                         class="w-full h-48 object-cover rounded-xl">
                    
                    <!-- Badges -->
                    ${badges.length ? `
                        <div class="absolute top-3 left-3 flex flex-col space-y-1">
                            ${badges.slice(0, 2).map(badge => `
                                <span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                    ${badge.text || badge.label || badge}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- Availability -->
                    <div class="absolute top-3 right-3">
                        <span class="bg-${product.availability ? 'green' : 'gray'}-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            ${product.availability ? 'В наявності' : 'Немає в наявності'}
                        </span>
                    </div>
                </div>

                <!-- Product Info -->
                <div class="space-y-3">
                    <h3 class="font-semibold text-lg text-gray-900 group-hover:text-green-600 transition-colors"
                        data-editable 
                        data-content-type="products" 
                        data-field="title" 
                        data-entry-id="${product.id}">
                        ${product.title}
                    </h3>
                    
                    ${product.brand ? `
                        <p class="text-sm text-gray-500">${product.brand.name || product.brand}</p>
                    ` : ''}
                    
                    <p class="text-gray-600 text-sm line-clamp-2">
                        ${product.description?.replace(/<[^>]*>/g, '') || 'Опис товару'}
                    </p>
                    
                    <!-- Rating -->
                    ${product.rating ? `
                        <div class="flex items-center space-x-1">
                            ${Array.from({length: 5}, (_, i) => `
                                <svg class="w-4 h-4 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}" 
                                     fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                            `).join('')}
                            <span class="text-sm text-gray-500 ml-2">(${product.rating})</span>
                        </div>
                    ` : ''}
                    
                    <!-- Price -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="text-xl font-bold text-green-600"
                                  data-editable 
                                  data-content-type="products" 
                                  data-field="price" 
                                  data-entry-id="${product.id}">
                                ${product.price ? `${product.price} ₴` : 'Ціна за запитом'}
                            </span>
                            ${hasDiscount ? `
                                <span class="text-sm text-gray-400 line-through">
                                    ${product.old_price} ₴
                                </span>
                            ` : ''}
                        </div>
                        
                        <button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                            Купити
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Гідратація секції відгуків
     */
    async hydrateTestimonials() {
        const container = document.getElementById('testimonials-container');
        if (!container) return;

        try {
            this.performance.apiCalls++;
            const response = await this.api.getTestimonials();
            
            if (response?.data) {
                this.renderTestimonials(response.data);
                this.log('Testimonials hydrated from API', { count: response.data.length });
            } else {
                throw new Error('No testimonials data received');
            }
        } catch (error) {
            this.error('Testimonials hydration failed, using fallback', error);
            const fallback = this.api.getFallbackData('testimonials');
            if (fallback?.data) {
                this.renderTestimonials(fallback.data);
                this.performance.fallbackCount++;
            }
        }
    }

    /**
     * Render testimonials data
     */
    renderTestimonials(testimonials) {
        const container = document.getElementById('testimonials-container');
        if (!container || !testimonials?.length) return;

        const testimonialsHTML = testimonials.slice(0, 6).map(testimonial => this.generateTestimonialCard(testimonial)).join('');
        container.innerHTML = testimonialsHTML;
        
        // Remove skeleton states
        this.hideSkeleton(container);
    }

    /**
     * Генерування карточки відгуку
     */
    generateTestimonialCard(testimonial) {
        const avatarColor = testimonial.avatar_color || 'bg-green-500';
        const initial = testimonial.customer_name ? testimonial.customer_name.charAt(0).toUpperCase() : 'К';
        
        return `
            <div class="testimonial-card bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                 data-editable 
                 data-content-type="testimonials" 
                 data-field="review_text" 
                 data-entry-id="${testimonial.id}">
                
                <!-- Header -->
                <div class="flex items-center space-x-4 mb-4">
                    <div class="${avatarColor} w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold">
                        ${initial}
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-900"
                            data-editable 
                            data-content-type="testimonials" 
                            data-field="customer_name" 
                            data-entry-id="${testimonial.id}">
                            ${testimonial.customer_name || 'Клієнт'}
                        </h4>
                        ${testimonial.product_purchased ? `
                            <p class="text-sm text-gray-500">Купив: ${testimonial.product_purchased}</p>
                        ` : ''}
                    </div>
                </div>

                <!-- Rating -->
                ${testimonial.rating ? `
                    <div class="flex items-center space-x-1 mb-3">
                        ${Array.from({length: 5}, (_, i) => `
                            <svg class="w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}" 
                                 fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Review Text -->
                <div class="text-gray-700 leading-relaxed mb-4">
                    ${testimonial.review_text?.replace(/<[^>]*>/g, '') || 'Текст відгуку'}
                </div>

                <!-- Date -->
                ${testimonial.date ? `
                    <div class="text-sm text-gray-400">
                        ${new Date(testimonial.date).toLocaleDateString('uk-UA')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Гідратація секції переваг
     */
    async hydrateFeatures() {
        const container = document.getElementById('features-container');
        if (!container) return;

        try {
            this.performance.apiCalls++;
            const response = await this.api.getFeatures();
            
            if (response?.data) {
                this.renderFeatures(response.data);
                this.log('Features hydrated from API', { count: response.data.length });
            } else {
                throw new Error('No features data received');
            }
        } catch (error) {
            this.error('Features hydration failed, using fallback', error);
            const fallback = this.api.getFallbackData('features');
            if (fallback?.data) {
                this.renderFeatures(fallback.data);
                this.performance.fallbackCount++;
            }
        }
    }

    /**
     * Render features data
     */
    renderFeatures(features) {
        const container = document.getElementById('features-container');
        if (!container || !features?.length) return;

        const featuresHTML = features.slice(0, 6).map(feature => this.generateFeatureCard(feature)).join('');
        container.innerHTML = featuresHTML;
        
        // Remove skeleton states
        this.hideSkeleton(container);
    }

    /**
     * Генерування карточки переваги
     */
    generateFeatureCard(feature) {
        const icons = {
            quality: '✅',
            shipping: '🚚',
            warranty: '🛡️',
            support: '👥',
            price: '💰',
            experience: '🏆'
        };
        
        const icon = icons[feature.icon_name] || feature.icon_name || '⭐';
        
        return `
            <div class="feature-card text-center p-6 group hover:bg-green-50 rounded-xl transition-colors"
                 data-editable 
                 data-content-type="features" 
                 data-field="description" 
                 data-entry-id="${feature.id}">
                
                <div class="text-4xl mb-4">${icon}</div>
                
                <h3 class="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors"
                    data-editable 
                    data-content-type="features" 
                    data-field="title" 
                    data-entry-id="${feature.id}">
                    ${feature.title || 'Заголовок переваги'}
                </h3>
                
                <p class="text-gray-600 leading-relaxed">
                    ${feature.description || 'Опис переваги'}
                </p>
            </div>
        `;
    }

    // ===== ВІЗУАЛЬНИЙ РЕДАКТОР =====

    /**
     * Ініціалізація візуального редактора
     * Використовує власну систему inline редагування без MediumEditor
     */
    initVisualEditor() {
        // Налаштувати inline редагування для всіх editable елементів
        this.setupInlineEditing();
        
        // Додати обробники для елементів з data-editable
        this.setupEditableElements();
    }

    /**
     * Налаштування редагованих елементів
     * Замінює функціональність MediumEditor власною реалізацією
     */
    setupEditableElements() {
        // Знайти всі редаговані елементи
        const editableElements = document.querySelectorAll('[data-editable]');
        
        editableElements.forEach(element => {
            // Додати обробник збереження при втраті фокусу
            element.addEventListener('blur', async (event) => {
                await this.handleContentSave(event.target);
            });

            // Додати візуальні індикатори редагування
            element.style.position = 'relative';
            element.addEventListener('mouseenter', this.showEditIndicator);
            element.addEventListener('mouseleave', this.hideEditIndicator);
            
            // Додати можливість редагування при подвійному кліку
            element.addEventListener('dblclick', (event) => {
                if (document.body.classList.contains('edit-mode')) {
                    event.target.contentEditable = true;
                    event.target.focus();
                }
            });
        });
    }

    /**
     * Налаштування inline редагування
     */
    setupInlineEditing() {
        // Додати кнопку редагування в dev режимі
        if (window.location.hostname === 'localhost' || window.STRAPI_CONFIG?.DEV_MODE) {
            this.addEditModeToggle();
        }
    }

    /**
     * Показати індикатор редагування
     */
    showEditIndicator(event) {
        const element = event.target;
        if (!element.querySelector('.edit-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'edit-indicator absolute top-0 right-0 bg-green-500 text-white px-2 py-1 rounded text-xs';
            indicator.textContent = '✏️ Редагувати';
            indicator.style.zIndex = '1000';
            element.appendChild(indicator);
        }
    }

    /**
     * Приховати індикатор редагування
     */
    hideEditIndicator(event) {
        const indicator = event.target.querySelector('.edit-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Type coercion for form fields
     */
    coerceFieldValue(contentType, field, value) {
        // Field type mapping
        const fieldTypes = {
            products: {
                price: 'number',
                old_price: 'number',
                rating: 'number',
                availability: 'boolean'
            },
            testimonials: {
                rating: 'number'
            },
            brands: {
                since_year: 'number'
            }
        };
        
        const fieldType = fieldTypes[contentType]?.[field];
        
        if (fieldType === 'number') {
            // Remove currency symbols, commas, and non-numeric characters except dots and minus
            const cleanedValue = value.replace(/[^0-9.,-]/g, '');
            return parseFloat(cleanedValue) || 0;
        }
        
        if (fieldType === 'boolean') {
            // Convert various text representations to boolean
            const lowerValue = value.toLowerCase().trim();
            return lowerValue === 'true' || lowerValue === 'так' || lowerValue === 'в наявності' || 
                   lowerValue === 'available' || lowerValue === '1' || lowerValue === 'yes';
        }
        
        return value;
    }

    /**
     * Обробка збереження контенту
     */
    async handleContentSave(element) {
        try {
            const contentType = element.dataset.contentType;
            const field = element.dataset.field;
            const entryId = element.dataset.entryId;
            
            if (!contentType || !field || !entryId) return;

            let newContent = element.textContent || element.innerHTML;
            
            // Type coercion for specific fields
            newContent = this.coerceFieldValue(contentType, field, newContent);
            
            // Підготувати дані для оновлення
            const data = { [field]: newContent };
            
            // Викликати відповідний метод API
            let result;
            switch (contentType) {
                case 'site-settings':
                    result = await this.api.updateSiteSettings(data);
                    break;
                case 'hero-section':
                    result = await this.api.updateHeroSection(data);
                    break;
                case 'brands':
                    result = await this.api.updateBrand(entryId, data);
                    break;
                case 'products':
                    result = await this.api.updateProduct(entryId, data);
                    break;
                case 'testimonials':
                    result = await this.api.updateTestimonial(entryId, data);
                    break;
                case 'features':
                    result = await this.api.updateFeature(entryId, data);
                    break;
            }
            
            if (result) {
                this.showSuccessToast('Зміни збережено!');
            }
            
        } catch (error) {
            console.error('Failed to save content:', error);
            this.showErrorToast('Помилка збереження. Спробуйте пізніше.');
        }
    }

    /**
     * Додати перемикач режиму редагування
     */
    addEditModeToggle() {
        const toggle = document.createElement('div');
        toggle.id = 'edit-mode-toggle';
        toggle.className = 'fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg cursor-pointer z-50';
        toggle.innerHTML = '✏️';
        toggle.title = 'Увімкнути режим редагування';
        
        toggle.addEventListener('click', this.toggleEditMode.bind(this));
        document.body.appendChild(toggle);
    }

    /**
     * Перемикач режиму редагування
     */
    toggleEditMode() {
        const editableElements = document.querySelectorAll('[data-editable]');
        const isEditMode = document.body.classList.contains('edit-mode');
        
        if (isEditMode) {
            document.body.classList.remove('edit-mode');
            editableElements.forEach(el => {
                el.contentEditable = false;
                el.style.border = 'none';
            });
        } else {
            document.body.classList.add('edit-mode');
            editableElements.forEach(el => {
                el.contentEditable = true;
                el.style.border = '2px dashed #10b981';
            });
        }
    }

    /**
     * Показати toast повідомлення про успіх
     */
    showSuccessToast(message) {
        this.showToast(message, 'success');
    }

    /**
     * Показати toast повідомлення про помилку
     */
    showErrorToast(message) {
        this.showToast(message, 'error');
    }

    /**
     * Показати toast повідомлення
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Анімація появи
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Автоматичне приховування
        setTimeout(() => {
            toast.style.transform = 'translateX(full)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Enhanced logging methods with LayoutManager integration
    log(message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message,
            data,
            component: 'LandingHydrate'
        };
        
        console.log(`[LandingHydrate] ${message}`, data || '');
        
        if (this.layoutManager && this.layoutManager.log) {
            this.layoutManager.log(message, data);
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
            component: 'LandingHydrate'
        };
        
        console.error(`[LandingHydrate ERROR] ${message}`, error || '', context || '');
        this.performance.errors.push(errorEntry);
        
        if (this.layoutManager && this.layoutManager.error) {
            this.layoutManager.error(message, error, context);
        }
    }

    warn(message, warning = null, context = null) {
        console.warn(`[LandingHydrate WARN] ${message}`, warning || '', context || '');
        
        if (this.layoutManager && this.layoutManager.warn) {
            this.layoutManager.warn(message, warning, context);
        }
    }

    debug(message, data = null) {
        if (this.layoutManager && this.layoutManager.debugMode) {
            console.debug(`[LandingHydrate DEBUG] ${message}`, data || '');
        }
    }

    // New hydration methods
    async hydrateFAQ() {
        const startTime = performance.now();
        
        try {
            this.log('Starting FAQ hydration');
            this.performance.apiCalls++;
            
            const response = await this.api.getFAQ();
            const faqData = response?.data;

            if (!faqData || !Array.isArray(faqData)) {
                this.debug('No FAQ data available');
                return;
            }

            const faqContainer = document.querySelector('.faq-container, .faq-section');
            if (!faqContainer) {
                this.debug('FAQ container not found');
                return;
            }

            this.showSkeleton(faqContainer);

            const faqHTML = faqData.map((item, index) => `
                <div class="faq-item" data-editable="faq[${index}]" data-confidence="90" data-component-type="faq">
                    <div class="faq-question" data-editable="faq[${index}].question">
                        ${item.question || 'FAQ Question'}
                    </div>
                    <div class="faq-answer" data-editable="faq[${index}].answer">
                        ${item.answer || 'FAQ Answer'}
                    </div>
                </div>
            `).join('');

            faqContainer.innerHTML = faqHTML;
            this.hideSkeleton(faqContainer);

            const hydrationTime = performance.now() - startTime;
            this.performance.hydrationTimes.set('faq', hydrationTime);
            
            this.log('FAQ hydration completed', {
                itemsCount: faqData.length,
                duration: `${hydrationTime.toFixed(2)}ms`
            });

        } catch (error) {
            this.error('FAQ hydration failed', error, { section: 'faq' });
            this.performance.errors.push({
                section: 'faq',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async hydrateNews() {
        const startTime = performance.now();
        
        try {
            this.log('Starting news hydration');
            this.performance.apiCalls++;
            
            const response = await this.api.getNews();
            const newsData = response?.data;

            if (!newsData || !Array.isArray(newsData)) {
                this.debug('No news data available');
                return;
            }

            const newsContainer = document.querySelector('.news-container, .news-section');
            if (!newsContainer) {
                this.debug('News container not found');
                return;
            }

            this.showSkeleton(newsContainer);

            const newsHTML = newsData.map((item, index) => `
                <article class="news-item" data-editable="news[${index}]" data-confidence="90" data-component-type="news">
                    <h3 class="news-title" data-editable="news[${index}].title">
                        ${item.title || 'News Title'}
                    </h3>
                    <p class="news-excerpt" data-editable="news[${index}].excerpt">
                        ${item.excerpt || 'News excerpt...'}
                    </p>
                    <time class="news-date" data-editable="news[${index}].date">
                        ${item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('uk-UA') : 'Date'}
                    </time>
                </article>
            `).join('');

            newsContainer.innerHTML = newsHTML;
            this.hideSkeleton(newsContainer);

            const hydrationTime = performance.now() - startTime;
            this.performance.hydrationTimes.set('news', hydrationTime);
            
            this.log('News hydration completed', {
                itemsCount: newsData.length,
                duration: `${hydrationTime.toFixed(2)}ms`
            });

        } catch (error) {
            this.error('News hydration failed', error, { section: 'news' });
            this.performance.errors.push({
                section: 'news',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async hydrateStatistics() {
        const startTime = performance.now();
        
        try {
            this.log('Starting statistics hydration');
            this.performance.apiCalls++;
            
            const response = await this.api.getStatistics();
            const statsData = response?.data;

            if (!statsData) {
                this.debug('No statistics data available');
                return;
            }

            // Update statistics in hero section
            const statsElements = {
                'years_experience': document.querySelector('[data-stat="years"]'),
                'products_count': document.querySelector('[data-stat="products"]'),
                'satisfied_clients': document.querySelector('[data-stat="clients"]'),
                'support_hours': document.querySelector('[data-stat="support"]')
            };

            Object.entries(statsElements).forEach(([key, element]) => {
                if (element && statsData[key]) {
                    element.textContent = statsData[key];
                    element.setAttribute('data-editable', `statistics.${key}`);
                    element.setAttribute('data-confidence', '95');
                    element.setAttribute('data-component-type', 'statistics');
                }
            });

            const hydrationTime = performance.now() - startTime;
            this.performance.hydrationTimes.set('statistics', hydrationTime);
            
            this.log('Statistics hydration completed', {
                updatedStats: Object.keys(statsData).length,
                duration: `${hydrationTime.toFixed(2)}ms`
            });

        } catch (error) {
            this.error('Statistics hydration failed', error, { section: 'statistics' });
            this.performance.errors.push({
                section: 'statistics',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async hydrateComparison() {
        const startTime = performance.now();
        
        try {
            this.log('Starting comparison hydration');
            this.performance.apiCalls++;
            
            const response = await this.api.getComparison();
            const comparisonData = response?.data;

            if (!comparisonData || !Array.isArray(comparisonData)) {
                this.debug('No comparison data available');
                return;
            }

            const comparisonContainer = document.querySelector('.comparison-container, .comparison-section');
            if (!comparisonContainer) {
                this.debug('Comparison container not found');
                return;
            }

            this.showSkeleton(comparisonContainer);

            const comparisonHTML = comparisonData.map((item, index) => `
                <div class="comparison-item" data-editable="comparison[${index}]" data-confidence="90" data-component-type="comparison">
                    <h4 class="comparison-title" data-editable="comparison[${index}].title">
                        ${item.title || 'Comparison Title'}
                    </h4>
                    <div class="comparison-features">
                        ${(item.features || []).map((feature, fIndex) => `
                            <div class="feature" data-editable="comparison[${index}].features[${fIndex}]">
                                ${feature}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            comparisonContainer.innerHTML = comparisonHTML;
            this.hideSkeleton(comparisonContainer);

            const hydrationTime = performance.now() - startTime;
            this.performance.hydrationTimes.set('comparison', hydrationTime);
            
            this.log('Comparison hydration completed', {
                itemsCount: comparisonData.length,
                duration: `${hydrationTime.toFixed(2)}ms`
            });

        } catch (error) {
            this.error('Comparison hydration failed', error, { section: 'comparison' });
            this.performance.errors.push({
                section: 'comparison',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    logHydrationResults(results) {
        const sections = ['header', 'hero', 'brands', 'products', 'testimonials', 'features', 'faq', 'news', 'statistics', 'comparison'];
        
        let successCount = 0;
        let failureCount = 0;
        
        results.forEach((result, index) => {
            const sectionName = sections[index] || `section_${index}`;
            
            if (result.status === 'fulfilled') {
                successCount++;
                this.debug(`${sectionName} hydration succeeded`);
            } else {
                failureCount++;
                this.error(`${sectionName} hydration failed`, result.reason, { section: sectionName });
            }
        });
        
        this.log('Hydration results summary', {
            totalSections: results.length,
            successful: successCount,
            failed: failureCount,
            successRate: `${((successCount / results.length) * 100).toFixed(1)}%`
        });
    }

    // Enhanced error recovery
    async retryFailedHydration(sectionName, maxRetries = 3) {
        this.log(`Retrying hydration for ${sectionName}`);
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                switch (sectionName) {
                    case 'header':
                        await this.hydrateHeader();
                        break;
                    case 'hero':
                        await this.hydrateHero();
                        break;
                    case 'brands':
                        await this.hydrateBrands();
                        break;
                    case 'products':
                        await this.hydrateProducts();
                        break;
                    case 'testimonials':
                        await this.hydrateTestimonials();
                        break;
                    case 'features':
                        await this.hydrateFeatures();
                        break;
                    case 'faq':
                        await this.hydrateFAQ();
                        break;
                    case 'news':
                        await this.hydrateNews();
                        break;
                    case 'statistics':
                        await this.hydrateStatistics();
                        break;
                    case 'comparison':
                        await this.hydrateComparison();
                        break;
                    default:
                        throw new Error(`Unknown section: ${sectionName}`);
                }
                
                this.log(`Retry successful for ${sectionName}`, { attempt });
                return true;
                
            } catch (error) {
                this.warn(`Retry attempt ${attempt} failed for ${sectionName}`, error);
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }
        
        this.error(`All retry attempts failed for ${sectionName}`, null, { maxRetries });
        return false;
    }

    // Performance monitoring
    getPerformanceReport() {
        return {
            ...this.performance,
            isHydrated: this.isHydrated,
            totalDuration: this.performance.hydrationTimes.get('total') || 0,
            averageHydrationTime: this.calculateAverageHydrationTime(),
            cacheHitRatio: this.performance.apiCalls > 0 ? 
                this.performance.cacheHits / this.performance.apiCalls : 0
        };
    }

    calculateAverageHydrationTime() {
        const times = Array.from(this.performance.hydrationTimes.values());
        return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
    }
}

// Ініціалізація після завантаження DOM з інтеграцією LayoutManager
document.addEventListener('DOMContentLoaded', () => {
    const hydrate = new LandingHydrate();
    
    // Integrate with LayoutManager if available
    if (window.LayoutManager) {
        window.LayoutManager.integrateWithHydrate = () => {
            return hydrate;
        };
        
        // Set up event listeners for LayoutManager integration
        hydrate.layoutManager = window.LayoutManager;
    }
    
    hydrate.init();
});

// Enhanced global export with additional methods
window.LandingHydrate = LandingHydrate;
window.landingHydrate = new LandingHydrate();

// Export performance monitoring for debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LandingHydrate;
}