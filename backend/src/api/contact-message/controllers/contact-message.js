'use strict';

/**
 * contact-message controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::contact-message.contact-message', ({ strapi }) => ({
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Валідація даних
      if (!data.name || !data.phone || !data.email) {
        return ctx.badRequest('Обов\'язкові поля: ім\'я, телефон, email');
      }
      
      // Створення запису в базі даних
      const entity = await strapi.entityService.create('api::contact-message.contact-message', {
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          subject: data.subject || 'Нове звернення з сайту',
          message: data.message || '',
          status: 'new'
        }
      });

      // Відправка email
      try {
        await strapi.plugins['email'].services.email.send({
          to: 'info@gardentech.com.ua', // Email отримувача
          from: 'noreply@gardentech.com.ua',
          replyTo: data.email,
          subject: `Нове звернення: ${data.subject || 'Консультація'}`,
          html: `
            <h2>Нове звернення з сайту</h2>
            <p><strong>Ім'я:</strong> ${data.name}</p>
            <p><strong>Телефон:</strong> ${data.phone}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Тема:</strong> ${data.subject || 'Не вказано'}</p>
            <p><strong>Повідомлення:</strong></p>
            <p>${data.message || 'Повідомлення не вказано'}</p>
            <hr>
            <p><small>Відправлено з сайту ${new Date().toLocaleString('uk-UA')}</small></p>
          `
        });
        
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Не блокуємо відповідь, якщо email не відправився
      }

      return ctx.send({
        data: entity,
        meta: {
          message: 'Ваше повідомлення успішно відправлено!'
        }
      });
      
    } catch (error) {
      console.error('Contact form error:', error);
      return ctx.internalServerError('Помилка при відправці повідомлення');
    }
  }
}));