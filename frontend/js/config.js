/**
 * Central Configuration for Contact Details and Site Settings
 * This file centralizes all contact information to avoid duplication
 */

(function(window) {
    'use strict';

    // Contact Information Configuration
    const contactConfig = {
        phone: {
            display: '+380 (68) 355-11-77',
            href: 'tel:+380683551177',
            raw: '+380683551177'
        },
        viber: {
            display: 'Viber',
            href: 'viber://chat?number=%2B380683551177',
            number: '+380683551177'
        },
        telegram: {
            display: 'Telegram',
            href: 'https://t.me/gardentech_ua',
            handle: '@gardentech_ua'
        },
        email: {
            display: 'info@gardena.ua',
            href: 'mailto:info@gardena.ua',
            address: 'info@gardena.ua'
        },
        whatsapp: {
            display: 'WhatsApp',
            href: 'https://wa.me/380683551177',
            number: '+380683551177'
        }
    };

    // Business Information
    const businessConfig = {
        name: 'Garden Tech Ukraine',
        legalName: 'ТОВ "Гарден Тех Україна"',
        address: {
            street: 'вул. Промислова, 15',
            city: 'Київ',
            postalCode: '03056',
            country: 'Україна',
            full: 'вул. Промислова, 15, Київ, 03056, Україна'
        },
        workingHours: {
            weekdays: '9:00 - 18:00',
            saturday: '10:00 - 16:00',
            sunday: 'Вихідний',
            display: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00'
        }
    };

    // Social Media Links
    const socialConfig = {
        facebook: 'https://facebook.com/gardentech.ua',
        instagram: 'https://instagram.com/gardentech_ua',
        youtube: 'https://youtube.com/gardentechukraine',
        linkedin: 'https://linkedin.com/company/gardentech-ukraine'
    };

    // Initialize contact elements on DOM ready
    function initializeContactElements() {
        // Update all elements with data-contact attributes
        document.querySelectorAll('[data-contact]').forEach(element => {
            const contactType = element.getAttribute('data-contact');
            const field = element.getAttribute('data-field') || 'display';
            
            if (contactConfig[contactType] && contactConfig[contactType][field]) {
                if (element.tagName === 'A' && field === 'href') {
                    element.href = contactConfig[contactType][field];
                } else {
                    element.textContent = contactConfig[contactType][field];
                }
            }
        });

        // Update phone links
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            if (!link.hasAttribute('data-contact')) {
                link.href = contactConfig.phone.href;
                if (!link.textContent || link.textContent.includes('+380')) {
                    link.textContent = contactConfig.phone.display;
                }
            }
        });

        // Update email links
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            if (!link.hasAttribute('data-contact')) {
                link.href = contactConfig.email.href;
                if (!link.textContent || link.textContent.includes('@')) {
                    link.textContent = contactConfig.email.display;
                }
            }
        });

        // Update Viber links
        document.querySelectorAll('a[href^="viber:"]').forEach(link => {
            if (!link.hasAttribute('data-contact')) {
                link.href = contactConfig.viber.href;
            }
        });

        // Update Telegram links
        document.querySelectorAll('a[href*="t.me"]').forEach(link => {
            if (!link.hasAttribute('data-contact')) {
                link.href = contactConfig.telegram.href;
            }
        });

        // Update WhatsApp links
        document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
            if (!link.hasAttribute('data-contact')) {
                link.href = contactConfig.whatsapp.href;
            }
        });
    }

    // Helper function to get formatted contact info
    function getContactInfo(type, field = 'display') {
        return contactConfig[type] && contactConfig[type][field] || '';
    }

    // Helper function to create contact link
    function createContactLink(type, className = '') {
        const config = contactConfig[type];
        if (!config) return null;

        const link = document.createElement('a');
        link.href = config.href;
        link.textContent = config.display;
        link.className = className;
        
        if (type === 'phone') {
            link.setAttribute('aria-label', 'Зателефонувати ' + config.display);
        } else if (type === 'email') {
            link.setAttribute('aria-label', 'Написати на ' + config.display);
        }
        
        return link;
    }

    // Export configuration and helper functions
    window.siteConfig = {
        contact: contactConfig,
        business: businessConfig,
        social: socialConfig,
        getContactInfo: getContactInfo,
        createContactLink: createContactLink,
        initialize: initializeContactElements
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeContactElements);
    } else {
        // DOM is already ready
        initializeContactElements();
    }

})(window);