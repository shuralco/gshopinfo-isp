'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Створення таблиці contact_messages якщо її немає
    try {
      const tableExists = await strapi.db.connection.schema.hasTable('contact_messages');
      if (!tableExists) {
        await strapi.db.connection.schema.createTable('contact_messages', (table) => {
          table.increments('id').primary();
          table.string('name').notNullable();
          table.string('phone').notNullable();
          table.string('email').notNullable();
          table.string('subject');
          table.text('message');
          table.enu('status', ['new', 'processed', 'archived']).defaultTo('new');
          table.timestamp('created_at').defaultTo(strapi.db.connection.fn.now());
          table.timestamp('updated_at').defaultTo(strapi.db.connection.fn.now());
        });
        console.log('✅ Contact messages table created');
      }
    } catch (error) {
      console.log('Table creation error (may already exist):', error.message);
    }

    // Налаштування дозволів для contact-message API
    const permissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
      where: {
        action: 'api::contact-message.contact-message.create',
      },
    });

    if (permissions.length === 0) {
      // Створити дозвіл для публічного користувача
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: {
            action: 'api::contact-message.contact-message.create',
            subject: null,
            properties: {},
            conditions: [],
            role: publicRole.id,
          },
        });
        
        console.log('✅ Contact form permissions set for public role');
      }

      // Додати дозволи для читання адміністратором
      const adminRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      if (adminRole) {
        const existingReadPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: {
            action: 'api::contact-message.contact-message.find',
            role: adminRole.id,
          },
        });

        if (!existingReadPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action: 'api::contact-message.contact-message.find',
              subject: null,
              properties: {},
              conditions: [],
              role: adminRole.id,
            },
          });
          
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action: 'api::contact-message.contact-message.findOne',
              subject: null,
              properties: {},
              conditions: [],
              role: adminRole.id,
            },
          });
          
          console.log('✅ Contact form read permissions set for admin role');
        }
      }
    }

    // Налаштування дозволів для brand та category APIs
    const apiEndpoints = [
      'api::brand.brand.find',
      'api::brand.brand.findOne', 
      'api::brand.brand.create',
      'api::brand.brand.update',
      'api::brand.brand.delete',
      'api::category.category.find',
      'api::category.category.findOne',
      'api::category.category.create', 
      'api::category.category.update',
      'api::category.category.delete'
    ];

    for (const endpoint of apiEndpoints) {
      // Дозволи для публічних API (читання)
      if (endpoint.includes('.find')) {
        const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: { type: 'public' },
        });

        if (publicRole) {
          const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              action: endpoint,
              role: publicRole.id,
            },
          });

          if (!existingPermission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action: endpoint,
                subject: null,
                properties: {},
                conditions: [],
                role: publicRole.id,
              },
            });
            console.log(`✅ Permission ${endpoint} set for public role`);
          }
        }
      }

      // Всі дозволи для аутентифікованих користувачів
      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      if (authenticatedRole) {
        const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: {
            action: endpoint,
            role: authenticatedRole.id,
          },
        });

        if (!existingPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action: endpoint,
              subject: null,
              properties: {},
              conditions: [],
              role: authenticatedRole.id,
            },
          });
          console.log(`✅ Permission ${endpoint} set for authenticated role`);
        }
      }
    }
  },
};