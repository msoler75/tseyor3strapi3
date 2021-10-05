'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

      // https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#controllers

      async like(ctx) {
        const { id } = ctx.params;

        const userId = ctx.state.user?ctx.state.user.id:0;

        let entity = await strapi.services.libros.like({ id }, userId);

        return sanitizeEntity(entity, { model: strapi.models.libros });
      },

      async dislike(ctx) {
        const { id } = ctx.params;

        const userId = ctx.state.user?ctx.state.user.id:0;

        let entity = await strapi.services.libros.dislike({ id }, userId);

        return sanitizeEntity(entity, { model: strapi.models.libros });
      },

};
