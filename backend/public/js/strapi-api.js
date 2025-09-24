/**
 * Strapi API Client для взаємодії з CMS
 * Підтримує кешування, error handling та fallback на статичний контент
 */
class StrapiAPI {
    constructor() {
        this.baseURL = window.STRAPI_CONFIG?.BASE_URL || 'http://localhost:1337/api';
        this.readToken = window.STRAPI_CONFIG?.READ_TOKEN || '';
        this.writeToken = window.STRAPI_CONFIG?.WRITE_TOKEN || '';
        this.cachePrefix = 'strapi_cache_';
        this.defaultTTL = 30 * 60 * 1000; // 30 хвилин
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * Базовий HTTP запит з retry логікою
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = options.write ? this.writeToken : this.readToken;
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };
        
        // Only include Authorization header if token is present
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.warn(`API request attempt ${attempt} failed:`, error.message);
                
                if (attempt === this.retryAttempts) {
                    throw error;
                }
                
                // Exponential backoff
                await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
            }
        }
    }

    /**
     * Утиліта для затримки
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Normalize Strapi v4 entity response (single)
     */
    normalizeEntity(response) {
        if (!response) return null;
        if (!response.data) return response;
        
        // Single entity: { data: { id, attributes: {...} } }
        if (response.data.attributes) {
            return {
                id: response.data.id,
                ...response.data.attributes,
                // Recursively normalize relations
                ...this.normalizeRelations(response.data.attributes)
            };
        }
        
        return response.data;
    }

    /**
     * Normalize Strapi v4 collection response (array)
     */
    normalizeCollection(response) {
        if (!response) return [];
        if (!response.data) return response;
        
        // Collection: { data: [{ id, attributes: {...} }] }
        if (Array.isArray(response.data)) {
            return response.data.map(item => {
                if (item.attributes) {
                    return {
                        id: item.id,
                        ...item.attributes,
                        // Recursively normalize relations
                        ...this.normalizeRelations(item.attributes)
                    };
                }
                return item;
            });
        }
        
        return response.data;
    }

    /**
     * Normalize relations in attributes
     */
    normalizeRelations(attributes) {
        if (!attributes || typeof attributes !== 'object') return {};
        
        const normalized = {};
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (value && typeof value === 'object') {
                // Single relation: { data: { id, attributes } }
                if (value.data && value.data.attributes) {
                    normalized[key] = {
                        id: value.data.id,
                        ...value.data.attributes
                    };
                }
                // Collection relation: { data: [{ id, attributes }] }
                else if (value.data && Array.isArray(value.data)) {
                    normalized[key] = value.data.map(item => ({
                        id: item.id,
                        ...item.attributes
                    }));
                }
            }
        });
        
        return normalized;
    }

    /**
     * Отримання даних з кешу
     */
    getFromCache(key) {
        try {
            const cacheKey = this.cachePrefix + key;
            const cached = localStorage.getItem(cacheKey);
            
            if (!cached) return null;
            
            const { data, timestamp, ttl } = JSON.parse(cached);
            
            if (Date.now() - timestamp > ttl) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return data;
        } catch (error) {
            console.warn('Cache read error:', error);
            return null;
        }
    }

    /**
     * Збереження даних в кеш
     */
    setToCache(key, data, ttl = this.defaultTTL) {
        try {
            const cacheKey = this.cachePrefix + key;
            const cacheData = {
                data,
                timestamp: Date.now(),
                ttl
            };
            
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Cache write error:', error);
        }
    }

    /**
     * Очищення кешу
     */
    clearCache() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.cachePrefix))
                .forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.warn('Cache clear error:', error);
        }
    }

    /**
     * Перевірка доступності API
     */
    async isOnline() {
        try {
            const healthPath = window.STRAPI_CONFIG?.HEALTH_PATH || '/_health';
            const healthURL = `${this.baseURL.replace(/\/api$/, '')}${healthPath}`;
            const response = await fetch(healthURL, { method: 'GET' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Загальний метод для GET запитів з кешуванням
     */
    async get(endpoint, cacheKey, ttl, fallbackKey = null) {
        // Спробувати отримати з кешу
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const data = await this.request(endpoint);
            this.setToCache(cacheKey, data, ttl);
            return data;
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
            // Повернути fallback дані якщо є
            return this.getFallbackData(fallbackKey || cacheKey);
        }
    }

    /**
     * Fallback дані коли API недоступний
     */
    getFallbackData(key) {
        const fallbacks = {
            'site-settings': {
                data: {
                    company_name: 'Garden Tech',
                    phone: '+38 (095) 123-45-67',
                    email: 'info@gardentech.ua',
                    address: 'м. Київ, вул. Садова, 15',
                    working_hours: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00',
                    social_links: {
                        facebook: 'https://facebook.com/gardentech.ua',
                        instagram: 'https://www.instagram.com/g.shop.ua/',
                        telegram: 'https://t.me/Gardena_shop',
                        viber: 'viber://chat?number=%2B380951234567'
                    },
                    description: 'Професійні рішення для саду та городу від провідних європейських виробників',
                    copyright: '© 2024 Garden Tech. Всі права захищені.'
                }
            },
            'hero-section': {
                data: {
                    badge_text: '25+ років досвіду',
                    main_title: 'Професійний садовий інструмент та обладнання',
                    subtitle: 'Все для вашого саду',
                    description: 'Широкий асортимент якісного садового інструменту від провідних європейських брендів',
                    cta_primary_text: 'Переглянути каталог',
                    cta_secondary_text: 'Отримати консультацію'
                }
            },
            'brands': {
                data: [
                    {
                        id: 1,
                        name: 'Gardena',
                        logo: 'https://www.gardena.com/on/demandware.static/-/Library-Sites-Gardena/default/dw976c49f5/images/logo.svg',
                        description: 'Німецька якість та інновації в садовій техніці. Gardena - світовий лідер у виробництві систем поливу та садового інструменту для професіоналів та аматорів.',
                        established_year: 'Since 1961',
                        quality_badge: 'PREMIUM',
                        website: 'https://g-shop.com.ua/',
                        categories: [
                            { name: 'Системи поливу', icon: 'irrigation' },
                            { name: 'Газонокосарки', icon: 'lawn-mower' },
                            { name: 'Садовий інструмент', icon: 'tools' },
                            { name: 'Акумуляторні інструменти', icon: 'battery' }
                        ],
                        stats: {
                            products: '500+',
                            experience: '62 роки',
                            countries: '80+ країн'
                        }
                    },
                    {
                        id: 2,
                        name: 'Fiskars',
                        logo: 'https://fiskars-official.com.ua/pictures/logo.svg',
                        description: 'Фінська компанія з більш ніж 370-річною історією. Fiskars відома своїми інноваційними рішеннями для саду, будинку та ремесел.',
                        established_year: 'Since 1649',
                        quality_badge: 'INNOVATIVE',
                        website: 'https://fiskars-garden.com.ua/',
                        categories: [
                            { name: 'Ножиці та секатори', icon: 'scissors' },
                            { name: 'Сокири та ножі', icon: 'axe' },
                            { name: 'Лопати та мотики', icon: 'shovel' },
                            { name: 'Ергономічні інструменти', icon: 'ergonomic' }
                        ],
                        stats: {
                            products: '300+',
                            experience: '374 роки',
                            awards: '50+ нагород'
                        }
                    },
                    {
                        id: 3,
                        name: 'Husqvarna',
                        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Husqvarna_logo.svg/255px-Husqvarna_logo.svg.png',
                        description: 'Шведський виробник професійного обладнання для лісового господарства, парків та садів. Понад 330 років інновацій та якості.',
                        established_year: 'Since 1689',
                        quality_badge: 'PROFESSIONAL',
                        website: 'https://g-shop.ua/',
                        categories: [
                            { name: 'Бензопили', icon: 'chainsaw' },
                            { name: 'Газонокосарки', icon: 'mower' },
                            { name: 'Роботи-газонокосарки', icon: 'robot' },
                            { name: 'Тримери', icon: 'trimmer' }
                        ],
                        stats: {
                            products: '400+',
                            experience: '334 роки',
                            dealers: '100+ дилерів'
                        }
                    }
                ]
            },
            'products': {
                data: [
                    {
                        id: 1,
                        title: 'Секатор Gardena Comfort B/S-XL Bypass до 24 мм',
                        brand: 'GARDENA',
                        price: '1 521 ₴',
                        rating: 5,
                        reviews_count: 47,
                        availability: 'В наявності',
                        image: 'https://g-shop.com.ua/image/cache/catalog/photo/gazon/sekatory/08905-20/sekator-gardena-comfort-b-s-xl-bypass-do-24-mm-08905-20_3-200x200.jpg',
                        description: 'Професійний секатор з bypass механізмом для точного різання гілок до 24 мм',
                        category: 'Секатори',
                        url: 'https://g-shop.com.ua/ua/sekator-gardena-comfort-b-s-xl-bypass-do-24-mm-08905-20'
                    },
                    {
                        id: 2,
                        title: 'Точилка для топорів та ножів Fiskars Solid',
                        brand: 'FISKARS',
                        price: '799 ₴',
                        rating: 5,
                        reviews_count: 89,
                        availability: 'В наявності',
                        image: '/images/fiskars-sharpener.jpg',
                        description: 'Компактна та ефективна точилка для підтримання гостроти інструментів',
                        category: 'Аксесуари',
                        badge: 'НОВИНКА',
                        url: 'https://fiskars-garden.com.ua/tochilo-dlya-sokir-i-nogiv-fiskars-solid-1026797-tochila'
                    },
                    {
                        id: 3,
                        title: 'Садовий повітродувка-пилосос ErgoJet 3000',
                        brand: 'GARDENA',
                        price: '6 390 ₴',
                        rating: 4,
                        reviews_count: 34,
                        availability: 'В наявності',
                        image: 'https://g-shop.com.ua/image/cache/catalog/photo/zemlyi-dvor/pilesos/9332-20/sadovyj-pylesos-gardena-ergojet-3000-09332-20_11-200x200.jpg',
                        description: 'Потужний електричний повітродувка з функцією пилососа',
                        category: 'Прибирання',
                        badge: '-18%',
                        url: 'https://g-shop.com.ua/ua/sadovyj-pylesos-gardena-ergojet-3000-09332-20'
                    },
                    {
                        id: 4,
                        title: 'Розкидувач-сівалка Gardena М',
                        brand: 'GARDENA',
                        price: '1 569 ₴',
                        rating: 5,
                        reviews_count: 23,
                        availability: 'В наявності',
                        image: 'https://g-shop.com.ua/image/cache/catalog/photo/gazon/rozkyduvachi-sivalky/00431-20/razbrasyvatel-seyalka-gardena-m-00431-20_1-200x200.jpg',
                        description: 'Ручний розкидувач для рівномірного внесення насіння та добрив',
                        category: 'Догляд за газоном',
                        url: 'https://g-shop.com.ua/ua/razbrasyvatel-seyalka-gardena-m-00431-20'
                    }
                ]
            },
            'testimonials': {
                data: [
                    {
                        id: 1,
                        customer_name: 'Олексій Петренко',
                        content: 'Купував систему поливу Gardena. Якість на найвищому рівні! Монтаж займав мінімум часу, все працює ідеально. Рекомендую всім садівникам.',
                        rating: 5,
                        date: '2024-08-15',
                        avatar: '/images/avatar-1.jpg',
                        location: 'Київ',
                        verified: true
                    },
                    {
                        id: 2,
                        customer_name: 'Марина Коваленко',
                        content: 'Фантастичний сервіс! Швидка доставка, професійна консультація. Секатор Fiskars перевершив всі очікування - працює як годинник.',
                        rating: 5,
                        date: '2024-08-10',
                        avatar: '/images/avatar-2.jpg',
                        location: 'Львів',
                        verified: true
                    },
                    {
                        id: 3,
                        customer_name: 'Володимир Сидоренко',
                        content: 'Користуюся продукцією вже 3 роки. Надійність та якість німецького виробництва відчувається в кожній деталі. Дякую за відмінний сервіс!',
                        rating: 5,
                        date: '2024-08-05',
                        avatar: '/images/avatar-3.jpg',
                        location: 'Одеса',
                        verified: true
                    }
                ]
            },
            'features': {
                data: [
                    {
                        id: 1,
                        title: 'Офіційний дилер',
                        description: 'Ексклюзивне представництво провідних європейських брендів в Україні з повною гарантією якості',
                        icon: 'shield-check',
                        order: 1
                    },
                    {
                        id: 2,
                        title: 'Швидка доставка',
                        description: 'Доставляємо по всій Україні протягом 1-3 днів. Безкоштовна доставка від 2000 грн',
                        icon: 'truck-fast',
                        order: 2
                    },
                    {
                        id: 3,
                        title: 'Професійна консультація',
                        description: 'Наші експерти допоможуть підібрати оптимальне рішення для вашого саду та бюджету',
                        icon: 'user-expert',
                        order: 3
                    },
                    {
                        id: 4,
                        title: 'Гарантія якості',
                        description: 'Офіційна гарантія на всі товари до 5 років. Сервісне обслуговування та запчастини',
                        icon: 'warranty',
                        order: 4
                    },
                    {
                        id: 5,
                        title: '25+ років досвіду',
                        description: 'Чверть століття успішної роботи на українському ринку садової техніки',
                        icon: 'experience',
                        order: 5
                    },
                    {
                        id: 6,
                        title: 'Найкращі ціни',
                        description: 'Конкурентні ціни від виробника без посередників. Система знижок для постійних клієнтів',
                        icon: 'price-tag',
                        order: 6
                    }
                ]
            }
        };

        return fallbacks[key] || { data: null };
    }

    /**
     * Enhanced error handling with detailed logging
     */
    handleAPIError(error, endpoint, attempt = 1) {
        const errorInfo = {
            endpoint,
            attempt,
            timestamp: new Date().toISOString(),
            message: error.message,
            type: this.getErrorType(error)
        };

        console.error(`🚨 API Error [${errorInfo.type}]:`, errorInfo);
        
        // Track error patterns for monitoring
        this.trackError(errorInfo);
        
        return errorInfo;
    }

    /**
     * Determine error type for better handling
     */
    getErrorType(error) {
        if (!navigator.onLine) return 'OFFLINE';
        if (error.message.includes('fetch')) return 'NETWORK';
        if (error.message.includes('404')) return 'NOT_FOUND';
        if (error.message.includes('500')) return 'SERVER_ERROR';
        if (error.message.includes('401') || error.message.includes('403')) return 'AUTH_ERROR';
        return 'UNKNOWN';
    }

    /**
     * Track errors for monitoring and analytics
     */
    trackError(errorInfo) {
        try {
            // Store in localStorage for debugging
            const errors = JSON.parse(localStorage.getItem('strapi_errors') || '[]');
            errors.push(errorInfo);
            
            // Keep only last 50 errors
            if (errors.length > 50) {
                errors.shift();
            }
            
            localStorage.setItem('strapi_errors', JSON.stringify(errors));
        } catch (e) {
            console.warn('Failed to track error:', e);
        }
    }

    /**
     * Batch loading for multiple content types
     */
    async batchLoad(requests) {
        const results = {};
        const promises = requests.map(async ({ key, method, ...args }) => {
            try {
                const result = await this[method](...args);
                results[key] = { success: true, data: result };
            } catch (error) {
                console.error(`Batch load failed for ${key}:`, error);
                results[key] = { success: false, error: error.message, fallback: this.getFallbackData(key) };
            }
        });

        await Promise.allSettled(promises);
        return results;
    }

    /**
     * Health check for API availability
     */
    async checkHealth() {
        try {
            const healthPath = window.STRAPI_CONFIG?.HEALTH_PATH || '/_health';
            const healthURL = `${this.baseURL.replace(/\/api$/, '')}${healthPath}`;
            const headers = {};
            
            // Only include Authorization header if token is present
            if (this.readToken) {
                headers['Authorization'] = `Bearer ${this.readToken}`;
            }
            
            const response = await fetch(healthURL, {
                method: 'GET',
                headers
            });
            
            return {
                available: response.ok,
                status: response.status,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                available: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // ===== ОСНОВНІ МЕТОДИ ОТРИМАННЯ ДАНИХ =====

    /**
     * Налаштування сайту
     */
    async getSiteSettings() {
        const response = await this.get('/site-setting?populate=*', 'site-settings');
        return { data: this.normalizeEntity(response) };
    }

    /**
     * Hero секція
     */
    async getHeroSection() {
        const response = await this.get('/hero-section?populate=*', 'hero-section');
        return { data: this.normalizeEntity(response) };
    }

    /**
     * Бренди
     */
    async getBrands() {
        const response = await this.get('/brands?populate=*&sort=order:asc', 'brands');
        return { data: this.normalizeCollection(response) };
    }

    /**
     * Товари
     */
    async getProducts(filters = {}) {
        let endpoint = '/products?populate=*&sort=order:asc';
        
        // Додати фільтри
        if (filters.brand) {
            endpoint += `&filters[brand][slug][$eq]=${filters.brand}`;
        }
        if (filters.category) {
            endpoint += `&filters[category][$eq]=${filters.category}`;
        }
        if (filters.featured) {
            endpoint += `&filters[featured][$eq]=true`;
        }
        if (filters.available) {
            endpoint += `&filters[availability][$eq]=true`;
        }

        const cacheKey = `products-${JSON.stringify(filters)}`;
        const response = await this.get(endpoint, cacheKey, this.defaultTTL, 'products');
        return { data: this.normalizeCollection(response) };
    }

    /**
     * Відгуки
     */
    async getTestimonials() {
        const response = await this.get('/testimonials?populate=*&filters[published][$eq]=true&sort=order:asc', 'testimonials');
        return { data: this.normalizeCollection(response) };
    }

    /**
     * Переваги
     */
    async getFeatures() {
        const response = await this.get('/features?filters[published][$eq]=true&sort=order:asc', 'features');
        return { data: this.normalizeCollection(response) };
    }

    // ===== МЕТОДИ ДЛЯ РЕДАГУВАННЯ =====

    /**
     * Оновлення налаштувань сайту
     */
    async updateSiteSettings(data) {
        try {
            const result = await this.request('/site-setting', {
                method: 'PUT',
                body: JSON.stringify({ data }),
                write: true
            });
            
            // Очистити кеш
            this.clearCacheKey('site-settings');
            return result;
        } catch (error) {
            console.error('Failed to update site settings:', error);
            throw error;
        }
    }

    /**
     * Оновлення hero секції
     */
    async updateHeroSection(data) {
        try {
            const result = await this.request('/hero-section', {
                method: 'PUT',
                body: JSON.stringify({ data }),
                write: true
            });
            
            this.clearCacheKey('hero-section');
            return result;
        } catch (error) {
            console.error('Failed to update hero section:', error);
            throw error;
        }
    }

    /**
     * Оновлення бренду
     */
    async updateBrand(id, data) {
        try {
            const result = await this.request(`/brands/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ data }),
                write: true
            });
            
            this.clearCacheKey('brands');
            return result;
        } catch (error) {
            console.error('Failed to update brand:', error);
            throw error;
        }
    }

    /**
     * Оновлення товару
     */
    async updateProduct(id, data) {
        try {
            const result = await this.request(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ data }),
                write: true
            });
            
            // Очистити всі кеші товарів
            this.clearCachePattern('products');
            return result;
        } catch (error) {
            console.error('Failed to update product:', error);
            throw error;
        }
    }

    /**
     * Оновлення відгуку
     */
    async updateTestimonial(id, data) {
        try {
            const result = await this.request(`/testimonials/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ data }),
                write: true
            });
            
            this.clearCacheKey('testimonials');
            return result;
        } catch (error) {
            console.error('Failed to update testimonial:', error);
            throw error;
        }
    }

    /**
     * Оновлення переваги
     */
    async updateFeature(id, data) {
        try {
            const result = await this.request(`/features/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ data }),
                write: true
            });
            
            this.clearCacheKey('features');
            return result;
        } catch (error) {
            console.error('Failed to update feature:', error);
            throw error;
        }
    }

    // ===== UTILITY МЕТОДИ =====

    /**
     * Очищення конкретного ключа кешу
     */
    clearCacheKey(key) {
        try {
            const cacheKey = this.cachePrefix + key;
            localStorage.removeItem(cacheKey);
        } catch (error) {
            console.warn('Cache key clear error:', error);
        }
    }

    /**
     * Очищення кешу за патерном
     */
    clearCachePattern(pattern) {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.cachePrefix + pattern))
                .forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.warn('Cache pattern clear error:', error);
        }
    }

    /**
     * Отримання статистики кешу
     */
    getCacheStats() {
        try {
            const cacheKeys = Object.keys(localStorage)
                .filter(key => key.startsWith(this.cachePrefix));
            
            return {
                totalKeys: cacheKeys.length,
                keys: cacheKeys.map(key => key.replace(this.cachePrefix, '')),
                sizeKB: Math.round(JSON.stringify(localStorage).length / 1024)
            };
        } catch (error) {
            return { totalKeys: 0, keys: [], sizeKB: 0 };
        }
    }
}

// Ініціалізація глобального екземпляру
window.strapiAPI = new StrapiAPI();