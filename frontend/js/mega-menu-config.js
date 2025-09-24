/**
 * Mega Menu Configuration
 * URL mappings and category structures for each brand
 */

const MEGA_MENU_CONFIG = {
    // Base URLs for each brand
    baseUrls: {
        gardena: 'https://g-shop.com.ua',
        fiskars: 'https://fiskars-garden.com.ua',
        husqvarna: 'https://g-shop.ua'
    },
    
    // Category URL mappings
    categoryMappings: {
        gardena: {
            'poliv-zroshennya': 'системи-поливу',
            'gazonokosarky': 'газонокосарки',
            'sadovi-nozhytsi': 'садові-ножиці',
            'nasosy': 'насоси',
            'roboty-sileno': 'роботи-газонокосарки',
            'akumulyatorna-tekhnika': 'акумуляторна-техніка',
            'sadovi-instrumenty': 'садові-інструменти',
            'aksesuary-poliv': 'аксесуари-поливу',
            'elektroinstrumenty': 'електроінструменти',
            'doglyad-gazon': 'догляд-за-газоном'
        },
        fiskars: {
            'sekatory': 'секатори',
            'sokyry': 'сокири',
            'lopaty': 'лопати',
            'grabli': 'граблі',
            'nozhi': 'ножі',
            'obrizka-derev': 'обрізка-дерев',
            'sadovi-sovky': 'садові-совки',
            'aksesuary': 'аксесуари',
            'kulinariya': 'кулінарія',
            'myjky-instrumenty': 'мийні-інструменти'
        },
        husqvarna: {
            'benzopyly': 'бензопили',
            'gazonokosarky': 'газонокосарки',
            'traktory': 'садові-трактори',
            'motokosy': 'мотокоси',
            'automower': 'роботи-газонокосарки',
            'kultyvatory': 'культиватори',
            'povitrodyuvky': 'повітродувки',
            'myjky': 'мийки-високого-тиску',
            'zakhyst': 'захисне-спорядження',
            'zapchastyny': 'запчастини'
        }
    },
    
    // Subcategory mappings for detailed navigation
    subcategoryMappings: {
        gardena: {
            'poliv-zroshennya': [
                { name: 'Краплинний полив', slug: 'kraplynnyj-poliv' },
                { name: 'Дощувачі', slug: 'doshchuvachi' },
                { name: 'Шланги', slug: 'shlangy' },
                { name: 'Фітинги', slug: 'fityngy' }
            ],
            'gazonokosarky': [
                { name: 'Електричні', slug: 'elektrychni' },
                { name: 'Акумуляторні', slug: 'akumulyatorni' },
                { name: 'Роботи SILENO', slug: 'roboty-sileno' },
                { name: 'Аксесуари', slug: 'aksesuary' }
            ],
            'sadovi-nozhytsi': [
                { name: 'Секатори', slug: 'sekatory' },
                { name: 'Ножиці для живоплоту', slug: 'nozhytsi-zhyvoplit' },
                { name: 'Сучкорізи', slug: 'suchkorizy' }
            ],
            'nasosy': [
                { name: 'Дренажні насоси', slug: 'drenazhni-nasosy' },
                { name: 'Садові насоси', slug: 'sadovi-nasosy' },
                { name: 'Насосні станції', slug: 'nasosni-stantsii' }
            ],
            'roboty-sileno': [
                { name: 'SILENO city', slug: 'sileno-city' },
                { name: 'SILENO life', slug: 'sileno-life' },
                { name: 'SILENO+', slug: 'sileno-plus' },
                { name: 'Аксесуари', slug: 'aksesuary' }
            ],
            'akumulyatorna-tekhnika': [
                { name: 'Система POWER FOR ALL', slug: 'power-for-all' },
                { name: 'Газонокосарки', slug: 'gazonokosarky' },
                { name: 'Кущорізи', slug: 'kushchorizy' }
            ],
            'sadovi-instrumenty': [
                { name: 'Лопати', slug: 'lopaty' },
                { name: 'Граблі', slug: 'grabli' },
                { name: 'Мотики', slug: 'motyky' },
                { name: 'Садовий інвентар', slug: 'sadovyj-inventar' }
            ],
            'aksesuary-poliv': [
                { name: "З'єднувачі", slug: 'zjednuvachi' },
                { name: 'Розпилювачі', slug: 'rozpylyvachi' },
                { name: 'Таймери', slug: 'tajmery' }
            ],
            'elektroinstrumenty': [
                { name: 'Електротримери', slug: 'elektrotrimery' },
                { name: 'Електроножиці', slug: 'elektronozhytsi' },
                { name: 'Подовжувачі', slug: 'podovzhuvachi' }
            ],
            'doglyad-gazon': [
                { name: 'Добрива', slug: 'dobryva' },
                { name: 'Насіння газонної трави', slug: 'nasinnya' },
                { name: 'Аератори', slug: 'aeratory' }
            ]
        },
        fiskars: {
            'sekatory': [
                { name: 'PowerGear', slug: 'powergear' },
                { name: 'Quantum', slug: 'quantum' },
                { name: 'SingleStep', slug: 'singlestep' },
                { name: 'Classic', slug: 'classic' }
            ],
            'sokyry': [
                { name: 'X-series', slug: 'x-series' },
                { name: 'Norden', slug: 'norden' },
                { name: 'IsoCore', slug: 'isocore' },
                { name: 'Аксесуари', slug: 'aksesuary' }
            ],
            'lopaty': [
                { name: 'Xact', slug: 'xact' },
                { name: 'Solid', slug: 'solid' },
                { name: 'Light', slug: 'light' },
                { name: 'Ергономічні', slug: 'ergonomichni' }
            ],
            'grabli': [
                { name: 'QuikFit', slug: 'quikfit' },
                { name: 'Solid', slug: 'solid' },
                { name: 'Leaf rakes', slug: 'leaf-rakes' }
            ],
            'nozhi': [
                { name: 'Кухонні ножі', slug: 'kukhonni-nozhi' },
                { name: 'Туристичні', slug: 'turystychni' },
                { name: 'Мультитули', slug: 'multytuly' }
            ],
            'obrizka-derev': [
                { name: 'Телескопічні', slug: 'teleskopichni' },
                { name: 'Сучкорізи', slug: 'suchkorizy' },
                { name: 'Пилки', slug: 'pylky' }
            ],
            'sadovi-sovky': [
                { name: 'Ергономічні', slug: 'ergonomichni' },
                { name: 'Міцні', slug: 'mitsni' },
                { name: 'Компактні', slug: 'kompaktni' }
            ],
            'aksesuary': [
                { name: 'Рукавички', slug: 'rukavychky' },
                { name: 'Наколінники', slug: 'nakolinnyky' },
                { name: 'Сумки', slug: 'sumky' }
            ],
            'kulinariya': [
                { name: 'Кухонні ножиці', slug: 'kukhonni-nozhytsi' },
                { name: 'Кухонне приладдя', slug: 'pryladdy' },
                { name: 'Обробні дошки', slug: 'doshky' }
            ],
            'myjky-instrumenty': [
                { name: 'Щітки', slug: 'shhitky' },
                { name: 'Губки', slug: 'gubky' },
                { name: 'Аксесуари для мийки', slug: 'aksesuary-myjky' }
            ]
        },
        husqvarna: {
            'benzopyly': [
                { name: 'Професійні', slug: 'profesijni' },
                { name: 'Фермерські', slug: 'fermerski' },
                { name: 'Побутові', slug: 'pobutovi' },
                { name: 'Аксесуари', slug: 'aksesuary' }
            ],
            'gazonokosarky': [
                { name: 'Самохідні', slug: 'samokhidni' },
                { name: 'Несамохідні', slug: 'nesamokhidni' },
                { name: 'Райдери', slug: 'rajdery' },
                { name: 'Нульовий поворот', slug: 'nulovyj-povorot' }
            ],
            'traktory': [
                { name: 'Трактори', slug: 'traktory' },
                { name: 'Райдери', slug: 'rajdery' },
                { name: 'Аксесуари', slug: 'aksesuary' }
            ],
            'motokosy': [
                { name: 'Професійні', slug: 'profesijni' },
                { name: 'Побутові', slug: 'pobutovi' },
                { name: 'Акумуляторні', slug: 'akumulyatorni' }
            ],
            'automower': [
                { name: 'Automower 305', slug: 'automower-305' },
                { name: '315X', slug: 'automower-315x' },
                { name: '430X', slug: 'automower-430x' },
                { name: '450X', slug: 'automower-450x' }
            ],
            'kultyvatory': [
                { name: 'Мотоблоки', slug: 'motobloky' },
                { name: 'Культиватори', slug: 'kultyvatory' },
                { name: 'Аксесуари', slug: 'aksesuary' }
            ],
            'povitrodyuvky': [
                { name: 'Ранцеві', slug: 'rantsevi' },
                { name: 'Ручні', slug: 'ruchni' },
                { name: 'Акумуляторні', slug: 'akumulyatorni' }
            ],
            'myjky': [
                { name: 'Побутові', slug: 'pobutovi' },
                { name: 'Професійні', slug: 'profesijni' },
                { name: 'Аксесуари', slug: 'aksesuary' }
            ],
            'zakhyst': [
                { name: 'Шоломи', slug: 'sholomy' },
                { name: 'Окуляри', slug: 'okulyary' },
                { name: 'Рукавички', slug: 'rukavychky' },
                { name: 'Одяг', slug: 'odyag' }
            ],
            'zapchastyny': [
                { name: 'Ланцюги', slug: 'lantsyugy' },
                { name: 'Шини', slug: 'shyny' },
                { name: 'Фільтри', slug: 'filtry' },
                { name: 'Мастила', slug: 'mastyla' }
            ]
        }
    },
    
    // Analytics configuration
    analytics: {
        enabled: true,
        trackingEvents: {
            menuOpen: 'mega_menu_open',
            menuClose: 'mega_menu_close',
            linkClick: 'mega_menu_link_click',
            categoryView: 'mega_menu_category_view'
        }
    },
    
    // Mobile configuration
    mobile: {
        breakpoint: 768,
        accordionMode: true,
        touchDelay: 300
    },
    
    // Accessibility configuration
    accessibility: {
        announceMenuChanges: true,
        focusManagement: true,
        keyboardNavigation: true
    }
};

/**
 * Generate external URL for category
 * @param {string} brand - Brand identifier (gardena, fiskars, husqvarna)
 * @param {string} category - Category key
 * @param {string} subcategory - Optional subcategory
 * @returns {string} Complete URL
 */
function generateCategoryUrl(brand, category, subcategory = null) {
    const config = window.MEGA_MENU_CONFIG || MEGA_MENU_CONFIG;
    const baseUrl = config.baseUrls[brand];
    const categoryMapping = config.categoryMappings[brand];
    
    if (!baseUrl || !categoryMapping) {
        console.warn(`No URL configuration found for brand: ${brand}`);
        return '#';
    }
    
    const categorySlug = categoryMapping[category] || category;
    let url = `${baseUrl}/${encodeURIComponent(categorySlug)}`;
    
    if (subcategory) {
        const subcategorySlug = subcategory.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '');
        url += `/${encodeURIComponent(subcategorySlug)}`;
    }
    
    return url;
}

/**
 * Generate category URL with subcategory support
 * @param {string} brand - Brand identifier
 * @param {string} category - Main category
 * @param {object} subcategoryData - Subcategory object with name and slug
 * @returns {string} Complete URL
 */
function generateSubcategoryUrl(brand, category, subcategoryData) {
    const config = window.MEGA_MENU_CONFIG || MEGA_MENU_CONFIG;
    const baseUrl = config.baseUrls[brand];
    const categoryMapping = config.categoryMappings[brand];
    
    if (!baseUrl || !categoryMapping) {
        console.warn(`No URL configuration found for brand: ${brand}`);
        return '#';
    }
    
    const categorySlug = categoryMapping[category] || category;
    return `${baseUrl}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(subcategoryData.slug)}`;
}

/**
 * Track mega menu interactions
 * @param {string} event - Event type
 * @param {object} data - Event data
 */
function trackMegaMenuEvent(event, data) {
    const config = window.MEGA_MENU_CONFIG || MEGA_MENU_CONFIG;
    
    if (!config.analytics.enabled) return;
    
    // Console logging for development
    console.log(`Mega Menu Event: ${event}`, data);
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', event, {
            event_category: 'mega_menu',
            ...data
        });
    }
    
    // Custom analytics can be added here
}

/**
 * Get subcategories for a brand and category
 * @param {string} brand - Brand identifier
 * @param {string} category - Category key
 * @returns {Array} Array of subcategory objects
 */
function getSubcategories(brand, category) {
    const config = window.MEGA_MENU_CONFIG || MEGA_MENU_CONFIG;
    const subcategories = config.subcategoryMappings[brand];
    
    if (!subcategories || !subcategories[category]) {
        return [];
    }
    
    return subcategories[category];
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobileDevice() {
    const config = window.MEGA_MENU_CONFIG || MEGA_MENU_CONFIG;
    return window.innerWidth < config.mobile.breakpoint || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MEGA_MENU_CONFIG;
} else {
    window.MEGA_MENU_CONFIG = MEGA_MENU_CONFIG;
    window.generateCategoryUrl = generateCategoryUrl;
    window.generateSubcategoryUrl = generateSubcategoryUrl;
    window.trackMegaMenuEvent = trackMegaMenuEvent;
    window.getSubcategories = getSubcategories;
    window.isMobileDevice = isMobileDevice;
}