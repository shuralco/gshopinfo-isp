module.exports = (plugin) => {
  // Get the default public permissions
  const publicRole = async () => {
    const result = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });
    return result;
  };

  // Override the bootstrap function
  const bootstrap = plugin.bootstrap;
  plugin.bootstrap = async (ctx) => {
    // Call the original bootstrap
    if (bootstrap) {
      await bootstrap(ctx);
    }

    // Set permissions for public role
    const role = await publicRole();
    if (role) {
      const permissions = [
        // Site Settings
        { action: 'api::site-setting.site-setting.find' },
        { action: 'api::site-setting.site-setting.update' },
        // Hero Section
        { action: 'api::hero-section.hero-section.find' },
        { action: 'api::hero-section.hero-section.update' },
        // Brands
        { action: 'api::brand.brand.find' },
        { action: 'api::brand.brand.findOne' },
        { action: 'api::brand.brand.create' },
        { action: 'api::brand.brand.update' },
        // Products
        { action: 'api::product.product.find' },
        { action: 'api::product.product.findOne' },
        { action: 'api::product.product.create' },
        { action: 'api::product.product.update' },
        // Testimonials
        { action: 'api::testimonial.testimonial.find' },
        { action: 'api::testimonial.testimonial.findOne' },
        { action: 'api::testimonial.testimonial.create' },
        { action: 'api::testimonial.testimonial.update' },
        // Features
        { action: 'api::feature.feature.find' },
        { action: 'api::feature.feature.findOne' },
        { action: 'api::feature.feature.create' },
        { action: 'api::feature.feature.update' },
      ];

      for (const perm of permissions) {
        const existingPermission = await strapi
          .query("plugin::users-permissions.permission")
          .findOne({
            where: {
              action: perm.action,
              role: role.id,
            },
          });

        if (!existingPermission) {
          await strapi.query("plugin::users-permissions.permission").create({
            data: {
              ...perm,
              role: role.id,
            },
          });
          console.log(`✅ Created permission: ${perm.action}`);
        }
      }
    }
  };

  return plugin;
};