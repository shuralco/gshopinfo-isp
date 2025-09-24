/**
 * Dynamic Data Loader - завантаження даних з Strapi API
 */

const API_BASE_URL = (window.STRAPI_CONFIG?.BASE_URL || `${window.location.origin.replace(/\/$/, '')}/api`).replace(/\/$/, '');

class DynamicLoader {
    constructor() {
        this.data = {
            products: [],
            brands: [],
            testimonials: [],
            features: [],
            siteSettings: null,
            heroSection: null,
            categories: []
        };

        this.state = {
            productsVisibleCount: 0
        };
    }

    initialize() {
        if (window.__STRAPI_CONTENT__) {
            this.applyPrefetchedContent(window.__STRAPI_CONTENT__);
        } else {
            console.warn('⚠️ Prefetched Strapi content not found. Falling back to live API only.');
        }

        // Kick off async refresh to ensure data stays up to date
        this.loadAllData({ silent: Boolean(window.__STRAPI_CONTENT__) });

        // Mark hardcoded nodes after initial paint
        setTimeout(() => {
            this.markHardcodedElements();
        }, 2000);

        // Periodic refresh (silent to avoid flicker)
        setInterval(() => {
            this.loadAllData({ silent: true });
        }, 30000);
    }

    async fetchJson(endpoint, context) {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            const error = new Error(`[${context}] Request failed with status ${response.status}`);
            error.status = response.status;
            error.context = context;
            throw error;
        }

        return response.json();
    }

    async loadAllData({ silent = false } = {}) {
        try {
            console.log('🔄 Loading data from Strapi...');

            if (!silent) {
                this.addDataTimestamp('loading');
                this.showLoadingIndicator();
            }
            
            // Завантажуємо всі дані паралельно
            const [
                productsData,
                brandsData,
                testimonialsData,
                featuresData,
                siteSettingsData,
                heroSectionData,
                categoriesData
            ] = await Promise.all([
                this.fetchJson('/products', 'products'),
                this.fetchJson('/brands?populate=categories', 'brands'),
                this.fetchJson('/testimonials', 'testimonials'),
                this.fetchJson('/features', 'features'),
                this.fetchJson('/site-setting', 'site-setting'),
                this.fetchJson('/hero-section', 'hero-section'),
                this.fetchJson('/categories?populate=brand', 'categories')
            ]);

            this.data.products = productsData.data || [];
            this.data.brands = brandsData.data || [];
            this.data.testimonials = testimonialsData.data || [];
            this.data.features = featuresData.data || [];
            this.data.siteSettings = siteSettingsData.data || null;
            this.data.heroSection = heroSectionData.data || null;
            this.data.categories = categoriesData.data || [];

            this.state.productsVisibleCount = 0;

            console.log('✅ Data loaded successfully:', {
                products: this.data.products.length,
                brands: this.data.brands.length,
                testimonials: this.data.testimonials.length,
                features: this.data.features.length,
                siteSettings: this.data.siteSettings ? 'loaded' : 'not found',
                heroSection: this.data.heroSection ? 'loaded' : 'not found'
            });

            // Оновлюємо UI
            this.updateSiteSettings();
            this.updateHeroSection();
            this.updateProducts();
            this.updateBrands();
            this.updateTestimonials();
            this.updateFeatures();
            
            if (!silent) {
                this.hideLoadingIndicator();
                this.addDataTimestamp('completed');
            }

        } catch (error) {
            console.error('❌ Failed to load data:', error);
            if (!silent) {
                this.hideLoadingIndicator();
                this.addDataTimestamp('error');
            }
        }
    }

    applyPrefetchedContent(content) {
        try {
            if (!content || typeof content !== 'object') {
                console.warn('Prefetched content is empty or invalid.');
                return;
            }

            this.data.products = content.products?.data || [];
            this.data.brands = content.brands?.data || [];
            this.data.testimonials = content.testimonials?.data || [];
            this.data.features = content.features?.data || [];
            this.data.siteSettings = content.siteSettings?.data || null;
            this.data.heroSection = content.heroSection?.data || null;
            this.data.categories = content.categories?.data || [];

            // Reset state before rendering prefetched entries
            this.state.productsVisibleCount = 0;

            this.updateSiteSettings();
            this.updateHeroSection();
            this.updateProducts();
            this.updateBrands();
            this.updateTestimonials();
            this.updateFeatures();

            console.log('✅ Prefetched Strapi content applied');
        } catch (error) {
            console.error('Failed to apply prefetched content:', error);
        }
    }

    updateProducts() {
        const container = document.getElementById('products-grid');
        if (!container) {
            console.log('Products container not found, creating...');
            // Знаходимо секцію товарів
            const productsSection = document.getElementById('products-section') || 
                                   document.querySelector('.products-section');
            if (productsSection) {
                // Створюємо грід для товарів
                const grid = document.createElement('div');
                grid.id = 'products-grid';
                grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8';
                
                // Знаходимо місце для вставки
                const title = productsSection.querySelector('h2');
                if (title && title.parentElement) {
                    title.parentElement.appendChild(grid);
                }
            }
            return;
        }

        container.innerHTML = '';
        
        // Show only first 6 products initially
        const initialCount = 6;
        const totalProducts = this.data.products.length;

        if (totalProducts === 0) {
            return;
        }

        if (!this.state.productsVisibleCount || this.state.productsVisibleCount > totalProducts) {
            this.state.productsVisibleCount = Math.min(initialCount, totalProducts);
        }

        let visibleCount = this.state.productsVisibleCount;
        
        // Display initial products
        for (let i = 0; i < visibleCount; i++) {
            const product = this.data.products[i];
            const productCard = this.createProductCard(product.attributes);
            container.appendChild(productCard);
        }
        
        // Find button in products section (not in header)
        const productsSection = container.closest('section') || document.getElementById('products-section');
        let viewAllButton = null;
        
        if (productsSection) {
            // Find button specifically within products section
            viewAllButton = productsSection.querySelector('button.gradient-bg') ||
                           productsSection.querySelector('button');
        }
        
        // If still not found, search more broadly but exclude header
        if (!viewAllButton) {
            const allButtons = document.querySelectorAll('button');
            viewAllButton = Array.from(allButtons).find(btn => {
                // Check if button is NOT in header
                const isInHeader = btn.closest('header') || btn.closest('nav');
                const text = btn.textContent.trim();
                return !isInHeader && (text === 'Переглянути всі товари' || text.includes('Переглянути всі'));
            });
        }
        
        console.log('Products section button found:', viewAllButton);
        
        if (viewAllButton) {
            if (totalProducts > visibleCount) {
                viewAllButton.className = 'bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-600 hover:shadow-xl transform hover:scale-105 transition-all duration-200';
                viewAllButton.textContent = `Показати ще товари (${totalProducts - visibleCount})`;
                viewAllButton.style.display = 'inline-flex';

                if (!viewAllButton.dataset.strapiBound) {
                    viewAllButton.dataset.strapiBound = 'true';
                    viewAllButton.addEventListener('click', () => {
                        const currentCount = this.state.productsVisibleCount;
                        const newCount = Math.min(currentCount + 3, totalProducts);

                        for (let i = currentCount; i < newCount; i++) {
                            const product = this.data.products[i];
                            const productCard = this.createProductCard(product.attributes);
                            container.appendChild(productCard);
                        }

                        this.state.productsVisibleCount = newCount;

                        if (newCount >= totalProducts) {
                            viewAllButton.style.display = 'none';
                        } else {
                            viewAllButton.textContent = `Показати ще товари (${totalProducts - newCount})`;
                        }
                    });
                }
            } else {
                viewAllButton.style.display = 'none';
            }
        }

        this.state.productsVisibleCount = visibleCount;
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300';
        
        const discount = product.old_price ? 
            Math.round((1 - product.price / product.old_price) * 100) : 0;
        
        card.innerHTML = `
            <div class="relative">
                ${discount > 0 ? `
                <div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                    -${discount}%
                </div>` : ''}
                ${product.featured ? `
                <div class="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                    ХІТ
                </div>` : ''}
                <div class="h-48 bg-gray-100 flex items-center justify-center p-4">
                    ${this.renderProductImage(product)}
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-2">${product.title}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description}</p>
                
                <div class="flex items-center mb-4">
                    <div class="flex text-yellow-400">
                        ${this.createRatingStars(product.rating)}
                    </div>
                    <span class="text-gray-500 text-sm ml-2">${product.rating}</span>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div>
                        ${product.old_price ? `
                        <span class="text-gray-400 line-through text-sm">${product.old_price} грн</span>
                        ` : ''}
                        <span class="text-2xl font-bold text-orange-600">${product.price} грн</span>
                    </div>
                    <span class="text-sm ${product.availability ? 'text-green-600' : 'text-red-600'}">
                        ${product.availability ? '✓ В наявності' : '✗ Немає'}
                    </span>
                </div>
                
                <button class="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 ${!product.availability ? 'opacity-50 cursor-not-allowed' : ''}">
                    ${product.availability ? 'Додати в кошик' : 'Повідомити'}
                </button>
            </div>
        `;
        
        return card;
    }

    renderProductImage(product) {
        // Використовуємо поле image_url
        console.log('Product image data:', product.title, product.image_url);
        if (product.image_url) {
            return `
                <img 
                    src="https://g-shop.info${product.image_url}" 
                    alt="${product.title}"
                    class="w-full h-full object-cover object-center"
                    loading="lazy"
                />
            `;
        }
        // Якщо немає зображень - показуємо емодзі
        else {
            return '<div class="text-6xl">🛠️</div>';
        }
    }

    createRatingStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '★';
            } else if (i - 0.5 <= rating) {
                stars += '☆';
            } else {
                stars += '☆';
            }
        }
        return stars;
    }

    updateBrands() {
        console.log('🔄 Updating brands and categories...');
        
        // Оновлюємо картки брендів
        this.data.brands.forEach(brand => {
            // Пробуємо знайти картку з оригінальним slug або без префіксу "1"
            let brandCard = document.getElementById(`${brand.attributes.slug}-card`);
            if (!brandCard && brand.attributes.slug.startsWith('1')) {
                // Якщо slug починається з "1", пробуємо без нього
                const slugWithout1 = brand.attributes.slug.substring(1);
                brandCard = document.getElementById(`${slugWithout1}-card`);
            }
            if (brandCard) {
                // Оновлюємо опис
                const description = brandCard.querySelector('p.text-gray-600');
                if (description) {
                    description.textContent = brand.attributes.description;
                    this.markElementAsDynamic(description, 'strapi');
                }
                
                // Оновлюємо статистику
                const stats = brandCard.querySelectorAll('.text-center');
                if (stats.length >= 2 && brand.attributes.since_year) {
                    const years = new Date().getFullYear() - brand.attributes.since_year;
                    stats[1].querySelector('.text-2xl').textContent = `${years}+`;
                    stats[1].querySelector('.text-xs').textContent = 'Років досвіду';
                    this.markElementAsDynamic(stats[1], 'strapi');
                }
                
                // Оновлюємо категорії
                this.updateBrandCategories(brand);
                
                // Оновлюємо кнопку каталогу
                this.updateCatalogButton(brand);
            }
        });
    }

    updateBrandCategories(brand) {
        let brandSlug = brand.attributes.slug;
        let categoriesContainer = document.getElementById(`${brandSlug}-categories`);
        
        // Якщо не знайдено і slug починається з "1", пробуємо без префіксу
        if (!categoriesContainer && brandSlug.startsWith('1')) {
            brandSlug = brandSlug.substring(1);
            categoriesContainer = document.getElementById(`${brandSlug}-categories`);
        }
        
        if (!categoriesContainer) {
            console.log(`❌ Categories container not found for ${brandSlug}`);
            return;
        }

        // Очищаємо контейнер
        categoriesContainer.innerHTML = '';
        
        // Отримуємо категорії безпосередньо з бренду
        const brandCategories = brand.attributes.categories?.data || [];
        
        if (brandCategories.length === 0) {
            console.log(`⚠️ No categories found for ${brandSlug}`);
            categoriesContainer.innerHTML = '<p class="text-gray-500 text-sm">Категорії завантажуються...</p>';
            return;
        }

        console.log(`✅ Loading ${brandCategories.length} categories for ${brandSlug}`);
        
        // Сортуємо категорії за порядком
        brandCategories.sort((a, b) => (a.attributes.order || 0) - (b.attributes.order || 0));
        
        // Створюємо HTML для кожної категорії
        brandCategories.forEach(category => {
            const categoryElement = this.createCategoryElement(category, brandSlug);
            categoriesContainer.appendChild(categoryElement);
        });
        
        this.markElementAsDynamic(categoriesContainer, 'strapi');
    }

    createCategoryElement(categoryData, brandSlug) {
        const category = categoryData.attributes || categoryData;
        const categoryDiv = document.createElement('a');
        categoryDiv.href = category.url || '#';
        
        // Використовуємо is_external для визначення target
        const target = category.is_external ? '_blank' : '_self';
        categoryDiv.target = target;
        
        categoryDiv.className = `bg-gray-50 rounded-lg p-3 hover:bg-${this.getBrandColor(brandSlug)}-50 transition-colors cursor-pointer block`;
        
        // Перевіряємо тип іконки і відображаємо відповідно
        const iconContent = this.renderCategoryIcon(category, brandSlug);
        
        categoryDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                ${iconContent}
                <span class="text-sm font-medium text-gray-700">${category.name}</span>
            </div>
        `;
        
        this.markElementAsDynamic(categoryDiv, 'strapi');
        return categoryDiv;
    }

    renderCategoryIcon(category, brandSlug) {
        // Витягуємо емодзі з enumeration значення (напр. "sprout🌱" -> "🌱")
        let emoji = '🔧'; // Fallback емодзі
        
        if (category.icon_emoji) {
            // Якщо це enum значення з текстом і емодзі
            const emojiMatch = category.icon_emoji.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu);
            if (emojiMatch && emojiMatch.length > 0) {
                emoji = emojiMatch[0];
            } else {
                // Якщо це просто емодзі без тексту
                emoji = category.icon_emoji;
            }
        }
        
        return `
            <div class="w-8 h-8 bg-${this.getBrandColor(brandSlug)}-100 rounded-lg flex items-center justify-center">
                <span class="text-lg">${emoji}</span>
            </div>
        `;
    }

    updateCatalogButton(brand) {
        let brandSlug = brand.attributes.slug;
        
        // Знаходимо span з текстом кнопки
        let buttonTextSpan = document.getElementById(`brand-${brandSlug}-button`);
        
        // Якщо не знайдено і slug починається з "1", пробуємо без префіксу
        if (!buttonTextSpan && brandSlug.startsWith('1')) {
            brandSlug = brandSlug.substring(1);
            buttonTextSpan = document.getElementById(`brand-${brandSlug}-button`);
        }
        if (!buttonTextSpan) {
            console.log(`❌ Catalog button text span not found for ${brandSlug}`);
            return;
        }

        // Знаходимо батьківський a елемент (кнопку)
        const catalogButton = buttonTextSpan.closest('a');
        if (!catalogButton) {
            console.log(`❌ Parent link element not found for ${brandSlug}`);
            return;
        }

        const siteSettings = this.data.siteSettings?.attributes;
        if (!siteSettings) return;

        // Оновлюємо URL кнопки каталогу
        const catalogUrl = siteSettings[`catalog_${brandSlug}_url`] || brand.attributes.catalog_link || '#';
        catalogButton.href = catalogUrl;

        // Оновлюємо текст кнопки
        const buttonText = siteSettings[`catalog_${brandSlug}_button_text`] || `Переглянути каталог ${brand.attributes.name}`;
        buttonTextSpan.textContent = buttonText;

        // Оновлюємо target
        const target = siteSettings.catalog_links_target || '_blank';
        catalogButton.target = target;

        this.markElementAsDynamic(buttonTextSpan, 'strapi');
        this.markElementAsDynamic(catalogButton, 'strapi');
        console.log(`✅ Updated catalog button for ${brandSlug}: ${catalogUrl}`);
    }

    getBrandColor(brandSlug) {
        const colorMap = {
            'gardena': 'orange',
            'fiskars': 'amber',
            'husqvarna': 'orange'
        };
        return colorMap[brandSlug] || 'gray';
    }

    getDefaultIcon() {
        return `<svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>`;
    }

    updateTestimonials() {
        console.log('🔄 Updating testimonials, data:', this.data.testimonials);
        
        const container = document.getElementById('testimonials-grid');
        if (!container) {
            console.log('❌ Testimonials container not found, creating...');
            const testimonialsSection = document.getElementById('testimonials-section') ||
                                       document.querySelector('.testimonials-section');
            if (testimonialsSection) {
                const grid = document.createElement('div');
                grid.id = 'testimonials-grid';
                grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8';
                
                const title = testimonialsSection.querySelector('h2');
                if (title && title.parentElement) {
                    title.parentElement.appendChild(grid);
                }
                console.log('✅ Testimonials grid created');
            }
            return;
        }

        console.log('✅ Testimonials container found, clearing and updating...');
        container.innerHTML = '';
        
        if (!this.data.testimonials || this.data.testimonials.length === 0) {
            console.log('❌ No testimonials data available');
            return;
        }
        
        // Show only first 6 testimonials initially
        const initialCount = 6;
        let visibleCount = Math.min(initialCount, this.data.testimonials.length);
        
        // Display initial testimonials
        for (let i = 0; i < visibleCount; i++) {
            const testimonial = this.data.testimonials[i];
            console.log(`Adding testimonial ${i + 1}:`, testimonial.attributes.customer_name);
            const card = this.createTestimonialCard(testimonial.attributes);
            container.appendChild(card);
        }
        
        // Add "Show More" button if there are more testimonials
        if (this.data.testimonials.length > initialCount) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'col-span-full text-center mt-8';
            
            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 font-semibold';
            showMoreBtn.textContent = `Показати ще (${this.data.testimonials.length - visibleCount})`;
            
            showMoreBtn.onclick = () => {
                // Show more testimonials
                const newCount = Math.min(visibleCount + 3, this.data.testimonials.length);
                
                for (let i = visibleCount; i < newCount; i++) {
                    const testimonial = this.data.testimonials[i];
                    const card = this.createTestimonialCard(testimonial.attributes);
                    container.insertBefore(card, buttonContainer);
                }
                
                visibleCount = newCount;
                
                // Update button text or hide if all shown
                if (visibleCount >= this.data.testimonials.length) {
                    buttonContainer.remove();
                } else {
                    showMoreBtn.textContent = `Показати ще (${this.data.testimonials.length - visibleCount})`;
                }
            };
            
            buttonContainer.appendChild(showMoreBtn);
            container.appendChild(buttonContainer);
        }
        
        console.log('✅ Testimonials updated successfully');
    }

    createTestimonialCard(testimonial) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300';
        
        card.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 ${testimonial.avatar_color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-bold">
                    ${testimonial.customer_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div class="ml-3">
                    <h4 class="font-semibold text-gray-900">${testimonial.customer_name}</h4>
                    <div class="flex text-yellow-400 text-sm">
                        ${this.createRatingStars(testimonial.rating)}
                    </div>
                </div>
            </div>
            <p class="text-gray-600 mb-3">"${testimonial.review_text}"</p>
            <p class="text-sm text-gray-500">
                <span class="font-medium">Придбав:</span> ${testimonial.product_purchased}
            </p>
        `;
        
        return card;
    }

    updateFeatures() {
        if (!this.data.features || this.data.features.length === 0) {
            console.log('No features data found');
            return;
        }

        const sortedFeatures = [...this.data.features].sort((a, b) => {
            const orderA = a?.attributes?.order ?? Number.MAX_SAFE_INTEGER;
            const orderB = b?.attributes?.order ?? Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
        });

        const featureSlots = 6;
        for (let index = 0; index < featureSlots; index++) {
            const feature = sortedFeatures[index];
            const featureNum = index + 1;
            const titleElement = document.getElementById(`feature-${featureNum}-title`);
            const descElement = document.getElementById(`feature-${featureNum}-description`);

            if (!titleElement && !descElement) {
                continue;
            }

            if (feature) {
                const { title, description } = feature.attributes;

                if (titleElement && title) {
                    titleElement.textContent = title;
                    this.markElementAsDynamic(titleElement, 'features');
                }

                if (descElement && description) {
                    descElement.textContent = description;
                    this.markElementAsDynamic(descElement, 'features');
                }
            } else {
                if (titleElement) {
                    titleElement.textContent = '';
                    titleElement.removeAttribute('data-source');
                }
                if (descElement) {
                    descElement.textContent = '';
                    descElement.removeAttribute('data-source');
                }
            }
        }

        const heroFeatureIds = ['hero-feature-1', 'hero-feature-2', 'hero-feature-3', 'hero-feature-4'];
        heroFeatureIds.forEach((id, index) => {
            const element = document.getElementById(id);
            if (!element) {
                return;
            }

            const feature = sortedFeatures[index];
            if (feature && feature.attributes?.title) {
                element.textContent = feature.attributes.title;
                this.markElementAsDynamic(element, 'features');
            } else {
                element.textContent = '';
                element.removeAttribute('data-source');
            }
        });

        console.log('Features updated:', sortedFeatures.length);
    }

    updateSiteSettings() {
        if (!this.data.siteSettings || !this.data.siteSettings.attributes) {
            console.log('Site settings not found');
            return;
        }

        const settings = this.data.siteSettings.attributes;

        // Оновлюємо мета-теги
        const metaTitle = document.getElementById('page-title');
        if (metaTitle && settings.meta_title) {
            metaTitle.textContent = settings.meta_title;
            this.markElementAsDynamic(metaTitle);
        }

        const metaDescription = document.getElementById('meta-description');
        if (metaDescription && settings.meta_description) {
            metaDescription.content = settings.meta_description;
            this.markElementAsDynamic(metaDescription);
        }

        // Оновлюємо логотип
        const logos = document.querySelectorAll('img[alt="G-Shop Logo"]');
        logos.forEach(logo => {
            if (settings.logo_url) logo.src = settings.logo_url;
        });

        // Оновлюємо телефон в header
        const headerPhone = document.getElementById('header-phone');
        if (headerPhone && settings.phone) {
            headerPhone.textContent = settings.phone;
            this.markElementAsDynamic(headerPhone);
        }

        // Оновлюємо навігацію через ID
        const navHome = document.getElementById('nav-home');
        if (navHome && settings.nav_home) {
            navHome.textContent = settings.nav_home;
            this.markElementAsDynamic(navHome);
        }
        
        const navProducts = document.getElementById('nav-products');
        if (navProducts && settings.nav_products) {
            navProducts.textContent = settings.nav_products;
            this.markElementAsDynamic(navProducts);
        }
        
        const navBrands = document.getElementById('nav-brands');
        if (navBrands && settings.nav_brands) {
            navBrands.textContent = settings.nav_brands;
            this.markElementAsDynamic(navBrands);
        }
        
        const navAbout = document.getElementById('nav-about');
        if (navAbout && settings.nav_about) {
            navAbout.textContent = settings.nav_about;
            this.markElementAsDynamic(navAbout);
        }
        
        const navContacts = document.getElementById('nav-contacts');
        if (navContacts && settings.nav_contacts) {
            navContacts.textContent = settings.nav_contacts;
            this.markElementAsDynamic(navContacts);
        }

        // Оновлюємо мобільну навігацію
        const mobileNavHome = document.getElementById('mobile-nav-home');
        if (mobileNavHome && settings.nav_home) mobileNavHome.textContent = settings.nav_home;
        
        const mobileNavProducts = document.getElementById('mobile-nav-products');
        if (mobileNavProducts && settings.nav_products) mobileNavProducts.textContent = settings.nav_products;
        
        const mobileNavBrands = document.getElementById('mobile-nav-brands');
        if (mobileNavBrands && settings.nav_brands) mobileNavBrands.textContent = settings.nav_brands;
        
        const mobileNavAbout = document.getElementById('mobile-nav-about');
        if (mobileNavAbout && settings.nav_about) mobileNavAbout.textContent = settings.nav_about;
        
        const mobileNavContacts = document.getElementById('mobile-nav-contacts');
        if (mobileNavContacts && settings.nav_contacts) mobileNavContacts.textContent = settings.nav_contacts;

        // Оновлюємо теглайн hero секції лише якщо його ще не заповнили дані hero
        const heroTagline = document.getElementById('hero-tagline');
        if (heroTagline && !heroTagline.dataset.source && settings.site_tagline) {
            heroTagline.textContent = settings.site_tagline;
            this.markElementAsDynamic(heroTagline, 'site-setting');
        }

        // Оновлюємо заголовок популярних товарів
        const popularTitle = document.querySelector('#products-section h2');
        if (popularTitle && settings.popular_products_title) {
            popularTitle.textContent = settings.popular_products_title;
        }

        // Оновлюємо заголовок відгуків
        const testimonialsBadge = document.getElementById('testimonials-badge');
        if (testimonialsBadge) {
            testimonialsBadge.textContent = settings.testimonials_badge || 'Відгуки клієнтів';
        }

        const testimonialsTitle = document.getElementById('testimonials-title');
        if (testimonialsTitle && settings.testimonials_title) {
            testimonialsTitle.textContent = settings.testimonials_title;
        }

        const testimonialsSubtitle = document.getElementById('testimonials-subtitle');
        if (testimonialsSubtitle && settings.testimonials_subtitle) {
            testimonialsSubtitle.textContent = settings.testimonials_subtitle;
        }

        // Оновлюємо контакти в футері
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(link => {
            if (settings.phone) {
                link.textContent = settings.phone;
                link.href = `tel:${settings.phone.replace(/[^\d+]/g, '')}`;
            }
        });

        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            if (settings.email) {
                link.textContent = settings.email;
                link.href = `mailto:${settings.email}`;
            }
        });

        // Оновлюємо кнопку "Отримати знижку"
        const discountPrimaryButton = document.getElementById('discount-primary-button');
        if (discountPrimaryButton && settings.get_discount_button) {
            discountPrimaryButton.textContent = settings.get_discount_button;
            this.markElementAsDynamic(discountPrimaryButton, 'site-setting');
        }

        // Оновлюємо футер
        const footerCopyright = document.querySelector('footer p.text-gray-500');
        if (footerCopyright && settings.footer_copyright) {
            footerCopyright.textContent = settings.footer_copyright;
        }

        const footerDescription = document.querySelector('footer p.text-sm.text-gray-400.mb-4');
        if (footerDescription && settings.footer_description) {
            footerDescription.textContent = settings.footer_description;
        }

        // Оновлюємо контактну форму
        this.updateContactForm(settings);

        // Оновлюємо додаткові тексти
        this.updateAdditionalTexts(settings);

        // Оновлюємо footer компанія
        const footerCompanyName = document.getElementById('footer-company-name');
        if (footerCompanyName && settings.site_name) {
            footerCompanyName.textContent = settings.site_name;
            this.markElementAsDynamic(footerCompanyName);
        }

        const footerCompanyDescription = document.getElementById('footer-company-description');
        if (footerCompanyDescription && settings.footer_description) {
            footerCompanyDescription.textContent = settings.footer_description;
            this.markElementAsDynamic(footerCompanyDescription);
        }

        // Оновлюємо контактну адресу
        const contactAddress = document.getElementById('contact-address');
        if (contactAddress && settings.address) {
            contactAddress.textContent = settings.address;
            this.markElementAsDynamic(contactAddress);
        }

        console.log('Site settings updated');
    }

    updateHeroSection() {
        if (!this.data.heroSection || !this.data.heroSection.attributes) {
            console.log('Hero section not found');
            return;
        }

        const hero = this.data.heroSection.attributes;

        // Оновлюємо теглайн/бейдж hero
        const heroTagline = document.getElementById('hero-tagline');
        if (heroTagline) {
            if (hero.badge_text) {
                heroTagline.textContent = hero.badge_text;
                this.markElementAsDynamic(heroTagline, 'hero-section');
            }
        }

        // Оновлюємо головний заголовок через ID
        const mainTitle = document.getElementById('hero-title');
        if (mainTitle && hero.main_title) {
            mainTitle.innerHTML = `<span class="block">${hero.main_title}</span>`;
            this.markElementAsDynamic(mainTitle, 'hero-section');
        }

        // Оновлюємо опис/підзаголовок
        const subtitle = document.getElementById('hero-subtitle');
        if (subtitle) {
            const descriptionContent = hero.description || hero.subtitle;
            if (descriptionContent) {
                if (hero.description) {
                    subtitle.innerHTML = hero.description;
                } else {
                    subtitle.textContent = hero.subtitle;
                }
                this.markElementAsDynamic(subtitle, 'hero-section');
            }
        }

        // Оновлюємо кнопки CTA через ID
        const primaryCTA = document.getElementById('hero-cta-primary');
        if (primaryCTA && hero.cta_primary_text) {
            primaryCTA.textContent = hero.cta_primary_text;
            this.markElementAsDynamic(primaryCTA, 'hero-section');
        }
        if (primaryCTA) {
            const primaryLink = primaryCTA.closest('a');
            if (primaryLink && hero.cta_primary_link) {
                primaryLink.href = hero.cta_primary_link;
                primaryLink.setAttribute('data-source', 'hero-section');
            }
        }

        const secondaryCTA = document.getElementById('hero-cta-secondary');
        if (secondaryCTA && hero.cta_secondary_text) {
            secondaryCTA.textContent = hero.cta_secondary_text;
            this.markElementAsDynamic(secondaryCTA, 'hero-section');
        }
        if (secondaryCTA) {
            const secondaryLink = secondaryCTA.closest('a');
            if (secondaryLink && hero.cta_secondary_link) {
                secondaryLink.href = hero.cta_secondary_link;
                secondaryLink.setAttribute('data-source', 'hero-section');
            }
        }

        console.log('Hero section updated', {
            badge: hero.badge_text,
            title: hero.main_title,
            subtitle: hero.subtitle || hero.description,
            primaryCTA: hero.cta_primary_text,
            secondaryCTA: hero.cta_secondary_text
        });
    }

    updateContactForm(settings) {
        // Оновлюємо заголовки контактної секції
        const contactTitle = document.getElementById('contact-title');
        if (contactTitle && settings.contact_title) {
            contactTitle.textContent = settings.contact_title;
        }

        const contactSubtitle = document.getElementById('contact-subtitle');
        if (contactSubtitle && settings.contact_subtitle) {
            contactSubtitle.textContent = settings.contact_subtitle;
        }

        const formTitle = document.getElementById('form-title');
        if (formTitle && settings.form_title) {
            formTitle.textContent = settings.form_title;
        }

        // Оновлюємо лейбли форми
        const formNameLabel = document.getElementById('form-name-label');
        if (formNameLabel && settings.form_name_label) {
            formNameLabel.textContent = settings.form_name_label;
        }

        const formPhoneLabel = document.getElementById('form-phone-label');
        if (formPhoneLabel && settings.form_phone_label) {
            formPhoneLabel.textContent = settings.form_phone_label;
        }

        const formEmailLabel = document.getElementById('form-email-label');
        if (formEmailLabel && settings.form_email_label) {
            formEmailLabel.textContent = settings.form_email_label;
        }

        const formSubjectLabel = document.getElementById('form-subject-label');
        if (formSubjectLabel && settings.form_subject_label) {
            formSubjectLabel.textContent = settings.form_subject_label;
        }

        const formMessageLabel = document.getElementById('form-message-label');
        if (formMessageLabel && settings.form_message_label) {
            formMessageLabel.textContent = settings.form_message_label;
        }

        // Оновлюємо кнопку
        const formSubmitButton = document.getElementById('form-submit-button');
        if (formSubmitButton && settings.form_submit_button) {
            formSubmitButton.textContent = settings.form_submit_button;
        }

        // Оновлюємо placeholder'и (потрібно встановлювати атрибути)
        const nameInput = document.querySelector('input[name="name"]');
        if (nameInput && settings.form_name_placeholder) {
            nameInput.placeholder = settings.form_name_placeholder;
        }

        const phoneInput = document.querySelector('input[name="phone"]');
        if (phoneInput && settings.form_phone_placeholder) {
            phoneInput.placeholder = settings.form_phone_placeholder;
        }

        const emailInput = document.querySelector('input[name="email"]');
        if (emailInput && settings.form_email_placeholder) {
            emailInput.placeholder = settings.form_email_placeholder;
        }

        const messageTextarea = document.querySelector('textarea[name="message"]');
        if (messageTextarea && settings.form_message_placeholder) {
            messageTextarea.placeholder = settings.form_message_placeholder;
        }

        // Оновлюємо опції select
        const formOption1 = document.getElementById('form-option-1');
        if (formOption1 && settings.form_option_1) {
            formOption1.textContent = settings.form_option_1;
        }

        const formOption2 = document.getElementById('form-option-2');
        if (formOption2 && settings.form_option_2) {
            formOption2.textContent = settings.form_option_2;
        }

        const formOption3 = document.getElementById('form-option-3');
        if (formOption3 && settings.form_option_3) {
            formOption3.textContent = settings.form_option_3;
        }

        const formOption4 = document.getElementById('form-option-4');
        if (formOption4 && settings.form_option_4) {
            formOption4.textContent = settings.form_option_4;
        }

        const formOption5 = document.getElementById('form-option-5');
        if (formOption5 && settings.form_option_5) {
            formOption5.textContent = settings.form_option_5;
        }

        console.log('Contact form updated');
    }

    updateAdditionalTexts(settings) {
        console.log('🔧 Updating additional texts, features_badge:', settings.features_badge);
        
        // Оновлюємо features секцію
        const featuresBadge = document.getElementById('features-badge');
        if (featuresBadge && settings.features_badge) {
            featuresBadge.textContent = settings.features_badge;
            this.markElementAsDynamic(featuresBadge);
            console.log('✅ Features badge updated:', settings.features_badge);
        } else {
            console.log('❌ Features badge not found or no data:', featuresBadge, settings.features_badge);
        }

        const featuresTitle = document.getElementById('features-title');
        if (featuresTitle && settings.features_title) {
            featuresTitle.textContent = settings.features_title;
            this.markElementAsDynamic(featuresTitle);
            console.log('✅ Features title updated:', settings.features_title);
        } else {
            console.log('❌ Features title not found or no data:', featuresTitle, settings.features_title);
        }

        const featuresSubtitle = document.getElementById('features-subtitle');
        if (featuresSubtitle && settings.features_subtitle) {
            featuresSubtitle.textContent = settings.features_subtitle;
            this.markElementAsDynamic(featuresSubtitle);
            console.log('✅ Features subtitle updated:', settings.features_subtitle);
        } else {
            console.log('❌ Features subtitle not found or no data:', featuresSubtitle, settings.features_subtitle);
        }

        // Оновлюємо кнопки брендів
        const brandGardenaButton = document.getElementById('brand-gardena-button');
        if (brandGardenaButton && settings.brand_gardena_button) {
            brandGardenaButton.textContent = settings.brand_gardena_button;
        }

        const brandFiskarsButton = document.getElementById('brand-fiskars-button');
        if (brandFiskarsButton && settings.brand_fiskars_button) {
            brandFiskarsButton.textContent = settings.brand_fiskars_button;
        }

        const brandHusqvarnaButton = document.getElementById('brand-husqvarna-button');
        if (brandHusqvarnaButton && settings.brand_husqvarna_button) {
            brandHusqvarnaButton.textContent = settings.brand_husqvarna_button;
        }

        // Оновлюємо footer тексти
        const footerSitesTitle = document.getElementById('footer-sites-title');
        if (footerSitesTitle && settings.footer_sites_title) {
            footerSitesTitle.textContent = settings.footer_sites_title;
        }

        const footerBrandsTitle = document.getElementById('footer-brands-title');
        if (footerBrandsTitle && settings.footer_brands_title) {
            footerBrandsTitle.textContent = settings.footer_brands_title;
        }

        const footerDeliveryLink = document.getElementById('footer-delivery-link');
        if (footerDeliveryLink && settings.footer_delivery_link) {
            footerDeliveryLink.textContent = settings.footer_delivery_link;
        }

        const footerWarrantyLink = document.getElementById('footer-warranty-link');
        if (footerWarrantyLink && settings.footer_warranty_link) {
            footerWarrantyLink.textContent = settings.footer_warranty_link;
        }

        // Footer бренди
        const footerBrandGardena = document.getElementById('footer-brand-gardena');
        if (footerBrandGardena && settings.footer_brand_gardena) {
            footerBrandGardena.textContent = settings.footer_brand_gardena;
            this.markElementAsDynamic(footerBrandGardena);
        }

        const footerBrandFiskars = document.getElementById('footer-brand-fiskars');
        if (footerBrandFiskars && settings.footer_brand_fiskars) {
            footerBrandFiskars.textContent = settings.footer_brand_fiskars;
            this.markElementAsDynamic(footerBrandFiskars);
        }

        const footerBrandHusqvarna = document.getElementById('footer-brand-husqvarna');
        if (footerBrandHusqvarna && settings.footer_brand_husqvarna) {
            footerBrandHusqvarna.textContent = settings.footer_brand_husqvarna;
            this.markElementAsDynamic(footerBrandHusqvarna);
        }

        const footerBrandStihl = document.getElementById('footer-brand-stihl');
        if (footerBrandStihl && settings.footer_brand_stihl) {
            footerBrandStihl.textContent = settings.footer_brand_stihl;
            this.markElementAsDynamic(footerBrandStihl);
        }

        // Footer сайти
        const footerSiteGardena = document.getElementById('footer-site-gardena');
        if (footerSiteGardena && settings.footer_site_gardena) {
            footerSiteGardena.textContent = settings.footer_site_gardena;
            this.markElementAsDynamic(footerSiteGardena);
        }

        const footerSiteGardenaLink = document.getElementById('footer-site-gardena-link');
        if (footerSiteGardenaLink && settings.footer_site_gardena_url) {
            footerSiteGardenaLink.href = settings.footer_site_gardena_url;
        }

        const footerSiteFiskars = document.getElementById('footer-site-fiskars');
        if (footerSiteFiskars && settings.footer_site_fiskars) {
            footerSiteFiskars.textContent = settings.footer_site_fiskars;
            this.markElementAsDynamic(footerSiteFiskars);
        }

        const footerSiteFiskarsLink = document.getElementById('footer-site-fiskars-link');
        if (footerSiteFiskarsLink && settings.footer_site_fiskars_url) {
            footerSiteFiskarsLink.href = settings.footer_site_fiskars_url;
        }

        const footerSiteHusqvarna = document.getElementById('footer-site-husqvarna');
        if (footerSiteHusqvarna && settings.footer_site_husqvarna) {
            footerSiteHusqvarna.textContent = settings.footer_site_husqvarna;
            this.markElementAsDynamic(footerSiteHusqvarna);
        }

        const footerSiteHusqvarnaLink = document.getElementById('footer-site-husqvarna-link');
        if (footerSiteHusqvarnaLink && settings.footer_site_husqvarna_url) {
            footerSiteHusqvarnaLink.href = settings.footer_site_husqvarna_url;
        }

        // Footer соціальні посилання
        const footerSocialFacebook = document.getElementById('footer-social-facebook');
        if (footerSocialFacebook && settings.footer_social_facebook) {
            footerSocialFacebook.href = settings.footer_social_facebook;
        }

        const footerSocialInstagram = document.getElementById('footer-social-instagram');
        if (footerSocialInstagram && settings.footer_social_instagram) {
            footerSocialInstagram.href = settings.footer_social_instagram;
        }

        const footerSocialTelegram = document.getElementById('footer-social-telegram');
        if (footerSocialTelegram && settings.footer_social_telegram) {
            footerSocialTelegram.href = settings.footer_social_telegram;
        }

        const footerSocialViber = document.getElementById('footer-social-viber');
        if (footerSocialViber && settings.footer_social_viber) {
            footerSocialViber.href = settings.footer_social_viber;
        }

        // Оновлюємо описи брендів
        const gardenaDescription = document.getElementById('gardena-description');
        if (gardenaDescription && settings.gardena_description) {
            gardenaDescription.textContent = settings.gardena_description;
            this.markElementAsDynamic(gardenaDescription);
        }

        const fiskarsDescription = document.getElementById('fiskars-description');
        if (fiskarsDescription && settings.fiskars_description) {
            fiskarsDescription.textContent = settings.fiskars_description;
            this.markElementAsDynamic(fiskarsDescription);
        }

        const husqvarnaDescription = document.getElementById('husqvarna-description');
        if (husqvarnaDescription && settings.husqvarna_description) {
            husqvarnaDescription.textContent = settings.husqvarna_description;
            this.markElementAsDynamic(husqvarnaDescription);
        }

        // Оновлюємо лейбли статистики
        const happyCustomersLabel = document.getElementById('happy-customers-label');
        if (happyCustomersLabel && settings.happy_customers_label) {
            happyCustomersLabel.textContent = settings.happy_customers_label;
            this.markElementAsDynamic(happyCustomersLabel);
        }

        const supportLabel = document.getElementById('support-label');
        if (supportLabel && settings.support_label) {
            supportLabel.textContent = settings.support_label;
            this.markElementAsDynamic(supportLabel);
        }

        const yearsExperienceLabels = document.querySelectorAll('#years-experience-label');
        yearsExperienceLabels.forEach(label => {
            if (label && settings.years_experience_label) {
                label.textContent = settings.years_experience_label;
                this.markElementAsDynamic(label);
            }
        });

        // Оновлюємо адреси
        const contactAddress = document.getElementById('contact-address');
        if (contactAddress && settings.contact_address_full) {
            contactAddress.textContent = settings.contact_address_full;
            this.markElementAsDynamic(contactAddress);
        }

        const footerAddress = document.getElementById('footer-address');
        if (footerAddress && settings.contact_address_full) {
            footerAddress.textContent = settings.contact_address_full;
            this.markElementAsDynamic(footerAddress);
        }

        // Оновлюємо опис компанії в футері
        const footerCompanyDescription = document.getElementById('footer-company-description');
        if (footerCompanyDescription && settings.footer_description) {
            footerCompanyDescription.textContent = settings.footer_description;
            this.markElementAsDynamic(footerCompanyDescription);
        }

        // Назва компанії в футері
        const footerCompanyName = document.getElementById('footer-company-name');
        if (footerCompanyName && settings.site_name) {
            footerCompanyName.textContent = settings.site_name;
            this.markElementAsDynamic(footerCompanyName);
        }

        console.log('Additional texts updated');
    }

    showLoadingIndicator() {
        // Створити або показати індикатор завантаження
        let loader = document.getElementById('strapi-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'strapi-loader';
            loader.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(90deg, #f97316, #ea580c);
                    z-index: 9999;
                    animation: loading 2s ease-in-out infinite;
                "></div>
                <style>
                    @keyframes loading {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(0%); }
                        100% { transform: translateX(100%); }
                    }
                </style>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'block';
    }

    hideLoadingIndicator() {
        const loader = document.getElementById('strapi-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    addDataTimestamp(status) {
        const timestamp = new Date().toLocaleString('uk-UA');
        const statusElement = document.getElementById('strapi-status') || this.createStatusElement();
        
        statusElement.innerHTML = `
            <div style="
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 1000;
                font-family: monospace;
            ">
                📊 Strapi: ${status === 'loading' ? '🔄' : status === 'completed' ? '✅' : '❌'} ${status}
                <br>🕐 ${timestamp}
            </div>
        `;
    }

    createStatusElement() {
        const statusElement = document.createElement('div');
        statusElement.id = 'strapi-status';
        document.body.appendChild(statusElement);
        return statusElement;
    }

    markElementAsDynamic(element, source = 'strapi') {
        if (!element) {
            return;
        }

        element.setAttribute('data-source', source);
        element.setAttribute('data-updated', new Date().toISOString());

        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === 'static') {
            element.style.position = 'relative';
        }

        // Видалити попередні службові мітки, щоб уникнути дублювання
        element.querySelectorAll('[data-dynamic-label]').forEach(existingLabel => existingLabel.remove());

        // Додати невидиму мітку для розробників
        const label = document.createElement('span');
        label.style.cssText = `
            position: absolute;
            top: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        `;
        label.title = `Dynamic content from ${source}`;
        label.setAttribute('data-dynamic-label', source);
        element.appendChild(label);

        if (!element.dataset.dynamicHoverBound) {
            element.addEventListener('mouseenter', () => {
                const dynamicLabel = element.querySelector('[data-dynamic-label]');
                if (dynamicLabel) {
                    dynamicLabel.style.opacity = '1';
                }
            });
            element.addEventListener('mouseleave', () => {
                const dynamicLabel = element.querySelector('[data-dynamic-label]');
                if (dynamicLabel) {
                    dynamicLabel.style.opacity = '0';
                }
            });
            element.dataset.dynamicHoverBound = 'true';
        }
    }

    markHardcodedElements() {
        // Знайти всі елементи з текстом, які не мають data-source
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button');
        
        textElements.forEach(element => {
            if (element.textContent.trim() && 
                !element.getAttribute('data-source') && 
                !element.id.includes('strapi') &&
                !element.closest('#strapi-loader') &&
                !element.closest('#strapi-status')) {
                
                element.setAttribute('data-source', 'hardcoded');
                element.style.position = 'relative';
                
                // Додати червону мітку для хардкод елементів
                const label = document.createElement('span');
                label.style.cssText = `
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 8px;
                    height: 8px;
                    background: #ef4444;
                    border-radius: 50%;
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                `;
                label.title = `Hardcoded content - should be dynamic!`;
                element.appendChild(label);
                
                // Показати мітку при hover
                element.addEventListener('mouseenter', () => {
                    label.style.opacity = '1';
                });
                element.addEventListener('mouseleave', () => {
                    label.style.opacity = '0';
                });
            }
        });
    }
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    const loader = new DynamicLoader();
    loader.initialize();
});
