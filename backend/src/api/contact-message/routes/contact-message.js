'use strict';

/**
 * contact-message router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::contact-message.contact-message', {
  only: ['create', 'find', 'findOne'],
  config: {
    create: {
      middlewares: ['api::contact-message.rate-limit']
    }
  }
});