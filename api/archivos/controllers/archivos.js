'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            if(ctx.state.user)
              data.autor = ctx.state.user.id
            entity = await strapi.services.archivos.create(data, { files });
        } else {
            if(ctx.state.user)
              ctx.request.body.autor = ctx.state.user.id
            entity = await strapi.services.archivos.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.archivos });
      },

      async update (ctx) {       
        const data = ctx.request.body
        // no se pueden modificar estos campos desde la api
        if ('soloSuperAdmin' in data || 'ruta' in data || 'slug' in data) {
          // check user role permission
          return ctx.forbidden(`No tienes permisos`)
        }

        return await super.update(ctx);
      },

};
