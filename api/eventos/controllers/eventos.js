'use strict';


const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

     // https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#controllers
     async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            data.autor = ctx.state.user.id;
            entity = await strapi.services.eventos.create(data, { files });
        } else {
            ctx.request.body.autor = ctx.state.user.id;
            entity = await strapi.services.eventos.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.eventos });
      },

};
