/**
 * Script to populate Strapi with initial data
 */

const STRAPI_CONFIG = {
    BASE_URL: 'http://localhost:1337/api',
    TOKEN: '15f1eb0059afee5532c0e79fc7443dc3e14eee6c7c52d0f346cab3b274dec6fab0d7f44118fafe8ec32faa5bcd59c585819f62507bc89ef46a4700f63e7f9050f95227a1972167ef124750a8a6c'
};

class StrapiPopulator {
    constructor() {
        this.baseURL = STRAPI_CONFIG.BASE_URL;
        this.token = STRAPI_CONFIG.TOKEN;
    }

    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify({ data });
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                console.error(`Error ${response.status}:`, result);
                throw new Error(`API Error: ${JSON.stringify(result.error)}`);
            }
            
            return result;
        } catch (error) {
            console.error(`Failed to ${method} ${endpoint}:`, error);
            throw error;
        }
    }

    // Site Settings (single type)
    async populateSiteSettings() {
        const data = {
            company_name: 'Garden Tech',
            phone: '+38 (098) 659-42-42',
            email: 'info@gardentech.ua',
            address: 'м. Київ, вул. Садова, 15',
            working_hours: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00',
            social_links: {
                facebook: 'https://www.facebook.com/GShopUkraine',
                instagram: 'https://www.instagram.com/g.shop.ua/',
                telegram: 'https://t.me/lionex_tech_bot',
                viber: 'viber://chat?number=+380986594242'
            },
            navigation_menu: [
                { label: 'Головна', url: '#hero-section', order: 1 },
                { label: 'Бренди', url: '#brands-section', order: 2 },
                { label: 'Каталог', url: '#products-section', order: 3 },
                { label: 'Відгуки', url: '#testimonials-section', order: 4 },
                { label: 'Контакти', url: '#footer-section', order: 5 }
            ]
        };

        console.log('Populating Site Settings...');
        return await this.request('/site-setting', 'PUT', data);
    }

    // Hero Section (single type)
    async populateHeroSection() {
        const data = {
            badge_text: '25+ років досвіду',
            main_title: 'Професійний садовий інструмент та обладнання',
            subtitle: 'Все для вашого саду',
            description: 'Широкий асортимент якісного садового інструменту від провідних європейських брендів. Офіційний дилер Gardena, Fiskars, Husqvarna.',
            cta_primary_text: 'Переглянути каталог',
            cta_primary_link: '#products-section',
            cta_secondary_text: 'Отримати консультацію',
            cta_secondary_link: '#contact-section',
            features_list: [
                { text: 'Офіційна гарантія від виробника' },
                { text: 'Безкоштовна доставка від 2000 грн' },
                { text: 'Власний сервісний центр' },
                { text: 'Експертна консультація' }
            ]
        };

        console.log('Populating Hero Section...');
        return await this.request('/hero-section', 'PUT', data);
    }

    // Brands (collection)
    async populateBrands() {
        const brands = [
            {
                name: 'Gardena',
                slug: 'gardena',
                description: 'Німецька якість для вашого саду. Інноваційні рішення для поливу, догляду за газоном та садовий інструмент преміум класу.',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Gardena_Logo.svg/200px-Gardena_Logo.svg.png',
                since_year: 1961,
                badge_text: 'Premium Quality',
                catalog_link: 'https://g-shop.com.ua/',
                gradient_colors: { from: 'green', to: 'blue' },
                categories: [
                    { name: 'Системи поливу', icon_svg: '💧' },
                    { name: 'Газонокосарки', icon_svg: '🌱' },
                    { name: 'Садовий інструмент', icon_svg: '🔧' },
                    { name: 'Насоси', icon_svg: '⚡' }
                ],
                statistics: [
                    { value: '500+', label: 'товарів' },
                    { value: '60+', label: 'років досвіду' }
                ],
                order: 1,
                featured: true
            },
            {
                name: 'Fiskars',
                slug: 'fiskars',
                description: 'Фінська надійність з 1649 року. Ергономічний садовий інструмент з унікальними технологіями для професіоналів та аматорів.',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Fiskars_logo.svg/200px-Fiskars_logo.svg.png',
                since_year: 1649,
                badge_text: 'Since 1649',
                catalog_link: 'https://fiskars-garden.com.ua/',
                gradient_colors: { from: 'orange', to: 'red' },
                categories: [
                    { name: 'Сокири та ножі', icon_svg: '🪓' },
                    { name: 'Секатори', icon_svg: '✂️' },
                    { name: 'Лопати та вила', icon_svg: '🔨' },
                    { name: 'Подрібнювачі', icon_svg: '🌿' }
                ],
                statistics: [
                    { value: '370+', label: 'років історії' },
                    { value: '300+', label: 'товарів' }
                ],
                order: 2,
                featured: true
            },
            {
                name: 'Husqvarna',
                slug: 'husqvarna',
                description: 'Шведська потужність та інновації. Професійна техніка для лісового господарства, садівництва та ландшафтного дизайну.',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Husqvarna_logo.svg/200px-Husqvarna_logo.svg.png',
                since_year: 1689,
                badge_text: 'Professional',
                catalog_link: 'https://g-shop.ua/',
                gradient_colors: { from: 'blue', to: 'cyan' },
                categories: [
                    { name: 'Бензопили', icon_svg: '⚙️' },
                    { name: 'Газонокосарки-роботи', icon_svg: '🤖' },
                    { name: 'Мотокоси', icon_svg: '🌾' },
                    { name: 'Культиватори', icon_svg: '🚜' }
                ],
                statistics: [
                    { value: '330+', label: 'років досвіду' },
                    { value: '1000+', label: 'моделей техніки' }
                ],
                order: 3,
                featured: true
            }
        ];

        console.log('Populating Brands...');
        for (const brand of brands) {
            try {
                await this.request('/brands', 'POST', brand);
                console.log(`✅ Created brand: ${brand.name}`);
            } catch (error) {
                console.error(`Failed to create brand ${brand.name}:`, error);
            }
        }
    }

    // Products (collection)
    async populateProducts() {
        const products = [
            // Gardena Products
            {
                title: 'Gardena Sileno City 500',
                slug: 'gardena-sileno-city-500',
                description: 'Робот-газонокосарка для ділянок до 500 м². Тиха робота, датчики дощу, програмування через додаток.',
                image_url: 'https://g-shop.com.ua/image/cache/catalog/products/gardena/15002-20-500x500.jpg',
                price: 28999,
                old_price: 32999,
                availability: true,
                featured: true,
                category: 'Газонокосарки',
                brand_slug: 'gardena',
                badges: [{ text: 'Хіт продажів' }, { text: '-12%' }],
                rating: 4.8,
                specifications: {
                    area: 'до 500 м²',
                    battery: 'Li-Ion 18V',
                    noise: '58 дБ',
                    weight: '7.3 кг'
                },
                order: 1
            },
            {
                title: 'Gardena Comfort 5000/5E',
                slug: 'gardena-comfort-5000-5e',
                description: 'Садовий насос для поливу з електронним управлінням. Продуктивність 5000 л/год.',
                image_url: 'https://g-shop.com.ua/image/cache/catalog/products/gardena/01734-20-500x500.jpg',
                price: 7899,
                old_price: 8999,
                availability: true,
                featured: true,
                category: 'Насоси',
                brand_slug: 'gardena',
                badges: [{ text: 'Новинка' }],
                rating: 4.6,
                specifications: {
                    power: '1300 Вт',
                    flow: '5000 л/год',
                    pressure: '5 бар',
                    height: 'до 50 м'
                },
                order: 2
            },
            // Fiskars Products
            {
                title: 'Fiskars X27 XXL',
                slug: 'fiskars-x27-xxl',
                description: 'Колун для великих полін. Унікальна геометрія леза та оптимальний баланс.',
                image_url: 'https://fiskars-garden.com.ua/image/cache/catalog/products/122503-500x500.jpg',
                price: 2799,
                old_price: 3199,
                availability: true,
                featured: true,
                category: 'Сокири',
                brand_slug: 'fiskars',
                badges: [{ text: 'Топ вибір' }],
                rating: 4.9,
                specifications: {
                    length: '91.5 см',
                    weight: '2.6 кг',
                    material: 'FiberComp',
                    warranty: '25 років'
                },
                order: 3
            },
            {
                title: 'Fiskars PowerGear X L78',
                slug: 'fiskars-powergear-l78',
                description: 'Садові ножиці з механізмом PowerGear для гілок до 55 мм.',
                image_url: 'https://fiskars-garden.com.ua/image/cache/catalog/products/112590-500x500.jpg',
                price: 1899,
                availability: true,
                featured: false,
                category: 'Секатори',
                brand_slug: 'fiskars',
                rating: 4.7,
                specifications: {
                    cutting: 'до 55 мм',
                    length: '80 см',
                    mechanism: 'PowerGear',
                    weight: '1.1 кг'
                },
                order: 4
            },
            // Husqvarna Products
            {
                title: 'Husqvarna 372 XP',
                slug: 'husqvarna-372-xp',
                description: 'Професійна бензопила для лісозаготівлі. Потужність 5.5 к.с., шина 50 см.',
                image_url: 'https://g-shop.ua/image/cache/catalog/products/husqvarna/372xp-500x500.jpg',
                price: 34999,
                old_price: 39999,
                availability: true,
                featured: true,
                category: 'Бензопили',
                brand_slug: 'husqvarna',
                badges: [{ text: 'Professional' }, { text: '-13%' }],
                rating: 5.0,
                specifications: {
                    power: '5.5 к.с.',
                    engine: '70.7 см³',
                    bar: '50 см',
                    weight: '6.3 кг'
                },
                order: 5
            },
            {
                title: 'Husqvarna Automower 450X',
                slug: 'husqvarna-automower-450x',
                description: 'Робот-газонокосарка преміум класу для ділянок до 5000 м². GPS навігація, керування через додаток.',
                image_url: 'https://g-shop.ua/image/cache/catalog/products/husqvarna/automower-450x-500x500.jpg',
                price: 119999,
                availability: false,
                featured: true,
                category: 'Газонокосарки-роботи',
                brand_slug: 'husqvarna',
                badges: [{ text: 'Premium' }],
                rating: 4.9,
                specifications: {
                    area: 'до 5000 м²',
                    slope: 'до 45%',
                    gps: 'Так',
                    app: 'Automower Connect'
                },
                order: 6
            }
        ];

        console.log('Populating Products...');
        for (const product of products) {
            try {
                await this.request('/products', 'POST', product);
                console.log(`✅ Created product: ${product.title}`);
            } catch (error) {
                console.error(`Failed to create product ${product.title}:`, error);
            }
        }
    }

    // Testimonials (collection)
    async populateTestimonials() {
        const testimonials = [
            {
                customer_name: 'Олександр Петренко',
                review_text: 'Купував газонокосарку Gardena - дуже задоволений! Професійна консультація та швидка доставка. Рекомендую!',
                product_purchased: 'Gardena Sileno City 500',
                rating: 5,
                date: '2024-01-15',
                avatar_color: 'bg-green-500',
                published: true,
                order: 1
            },
            {
                customer_name: 'Марія Коваленко',
                review_text: 'Відмінний сервіс! Допомогли підібрати секатор Fiskars саме під мої потреби. Інструмент працює бездоганно вже рік.',
                product_purchased: 'Fiskars PowerGear L78',
                rating: 5,
                date: '2024-01-10',
                avatar_color: 'bg-orange-500',
                published: true,
                order: 2
            },
            {
                customer_name: 'Василь Шевченко',
                review_text: 'Придбав бензопилу Husqvarna для професійної роботи. Якість на висоті, плюс отримав знижку як постійний клієнт.',
                product_purchased: 'Husqvarna 372 XP',
                rating: 5,
                date: '2024-01-05',
                avatar_color: 'bg-blue-500',
                published: true,
                order: 3
            },
            {
                customer_name: 'Ірина Бондаренко',
                review_text: 'Дякую за допомогу у виборі системи поливу! Все пояснили, встановили, навчили користуватися. Супер!',
                product_purchased: 'Система поливу Gardena',
                rating: 5,
                date: '2023-12-28',
                avatar_color: 'bg-purple-500',
                published: true,
                order: 4
            },
            {
                customer_name: 'Петро Мельник',
                review_text: 'Звернувся в сервіс з поломкою - полагодили швидко та якісно. Ціни адекватні, майстри професійні.',
                product_purchased: 'Сервісне обслуговування',
                rating: 4,
                date: '2023-12-20',
                avatar_color: 'bg-gray-500',
                published: true,
                order: 5
            },
            {
                customer_name: 'Наталія Гриценко',
                review_text: 'Великий вибір товарів, приємні ціни. Замовляла колун Fiskars - доставили наступного дня. Все супер!',
                product_purchased: 'Fiskars X27 XXL',
                rating: 5,
                date: '2023-12-15',
                avatar_color: 'bg-pink-500',
                published: true,
                order: 6
            }
        ];

        console.log('Populating Testimonials...');
        for (const testimonial of testimonials) {
            try {
                await this.request('/testimonials', 'POST', testimonial);
                console.log(`✅ Created testimonial from: ${testimonial.customer_name}`);
            } catch (error) {
                console.error(`Failed to create testimonial from ${testimonial.customer_name}:`, error);
            }
        }
    }

    // Features (collection)
    async populateFeatures() {
        const features = [
            {
                title: 'Офіційний дилер',
                description: 'Ми є офіційним представником провідних світових брендів садової техніки з повною гарантією від виробника',
                icon_name: 'quality',
                published: true,
                order: 1
            },
            {
                title: 'Експертна консультація',
                description: 'Наші фахівці допоможуть обрати оптимальне рішення саме для вашого саду та бюджету',
                icon_name: 'support',
                published: true,
                order: 2
            },
            {
                title: 'Сервісний центр',
                description: 'Власний сервісний центр з кваліфікованими майстрами та оригінальними запчастинами',
                icon_name: 'warranty',
                published: true,
                order: 3
            },
            {
                title: 'Широкий асортимент',
                description: 'Понад 10 000 найменувань товарів в наявності та під замовлення для будь-яких потреб',
                icon_name: 'experience',
                published: true,
                order: 4
            },
            {
                title: 'Швидка доставка',
                description: 'Доставка по всій Україні протягом 1-3 днів. Власна служба доставки для Києва',
                icon_name: 'shipping',
                published: true,
                order: 5
            },
            {
                title: 'Найкращі ціни',
                description: 'Прямі поставки від виробників дозволяють нам пропонувати найвигідніші ціни на ринку',
                icon_name: 'price',
                published: true,
                order: 6
            }
        ];

        console.log('Populating Features...');
        for (const feature of features) {
            try {
                await this.request('/features', 'POST', feature);
                console.log(`✅ Created feature: ${feature.title}`);
            } catch (error) {
                console.error(`Failed to create feature ${feature.title}:`, error);
            }
        }
    }

    // Main populate function
    async populateAll() {
        console.log('🚀 Starting Strapi data population...\n');

        try {
            // Test connection
            console.log('Testing API connection...');
            await this.request('');
            console.log('✅ API connection successful!\n');

            // Populate single types
            await this.populateSiteSettings();
            console.log('✅ Site Settings populated\n');

            await this.populateHeroSection();
            console.log('✅ Hero Section populated\n');

            // Populate collections
            await this.populateBrands();
            console.log('✅ Brands populated\n');

            await this.populateProducts();
            console.log('✅ Products populated\n');

            await this.populateTestimonials();
            console.log('✅ Testimonials populated\n');

            await this.populateFeatures();
            console.log('✅ Features populated\n');

            console.log('🎉 All data successfully populated!');
            console.log('📌 Now open your landing page to see the hydrated content.');

        } catch (error) {
            console.error('❌ Population failed:', error);
        }
    }
}

// Run the populator
const populator = new StrapiPopulator();
populator.populateAll();