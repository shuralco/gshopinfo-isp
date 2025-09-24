/**
 * Contact Form Handler
 */

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitButton = document.getElementById('form-submit-button');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        // Валідація
        if (!this.validateForm(data)) {
            return;
        }

        // Показати стан завантаження
        this.setLoading(true);

        try {
            const response = await fetch('/api/contact-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data })
            });

            const result = await response.json();

            if (response.ok) {
                this.showSuccess('Дякуємо! Ваше повідомлення успішно відправлено. Ми зв\'яжемося з вами найближчим часом.');
                this.form.reset();
            } else {
                throw new Error(result.error?.message || 'Помилка відправки');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            this.showError('Помилка при відправці повідомлення. Спробуйте ще раз або зателефонуйте нам.');
        } finally {
            this.setLoading(false);
        }
    }

    validateForm(data) {
        // Перевірка обов'язкових полів
        if (!data.name?.trim()) {
            this.showError('Будь ласка, вкажіть ваше ім\'я');
            return false;
        }

        if (!data.phone?.trim()) {
            this.showError('Будь ласка, вкажіть ваш телефон');
            return false;
        }

        if (!data.email?.trim()) {
            this.showError('Будь ласка, вкажіть ваш email');
            return false;
        }

        // Перевірка email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showError('Будь ласка, вкажіть коректний email');
            return false;
        }

        // Перевірка телефону (базова)
        const phoneRegex = /[\d\s\+\-\(\)]{10,}/;
        if (!phoneRegex.test(data.phone)) {
            this.showError('Будь ласка, вкажіть коректний телефон');
            return false;
        }

        return true;
    }

    setLoading(loading) {
        if (this.submitButton) {
            this.submitButton.disabled = loading;
            this.submitButton.textContent = loading ? 'Відправляємо...' : 'Відправити заявку';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Видалити попередні повідомлення
        const existingNotification = document.querySelector('.form-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Створити нове повідомлення
        const notification = document.createElement('div');
        notification.className = `form-notification p-4 rounded-lg mb-4 ${
            type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
        }`;
        notification.textContent = message;

        // Вставити перед формою
        this.form.parentNode.insertBefore(notification, this.form);

        // Автоматично прибрати через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Ініціалізувати форму після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});