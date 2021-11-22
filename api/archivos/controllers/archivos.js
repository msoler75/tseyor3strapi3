'use strict';

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
              data.subidoPor = ctx.state.user.id
            entity = await strapi.services.comentarios.create(data, { files });
        } else {
            if(ctx.state.user)
              ctx.request.body.subidoPor = ctx.state.user.id
            entity = await strapi.services.comentarios.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.comentarios });
      },
};
