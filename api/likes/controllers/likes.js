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
            const exist = await strapi.services.likes.find({ uid: data.uid, user: ctx.state.user.id });
            if(!exist.length) 
            {
                data.user = ctx.state.user.id;
                entity = await strapi.services.likes.create(data, { files });
            }
            else 
            // ya tiene like
            entity = exist[0]
        } else {
            const exist = await strapi.services.likes.find({ uid:  ctx.request.body.uid, user: ctx.state.user.id });
            if(!exist.length) 
            {
                ctx.request.body.user = ctx.state.user.id;
                entity = await strapi.services.likes.create(ctx.request.body);
            }
            else 
            // ya tiene like
            entity = exist[0]
        }
        return sanitizeEntity(entity, { model: strapi.models.likes });
      },


      async delete(ctx) {

        const { id } = ctx.params;

        let entity = await strapi.services.likes.findOne({ id });
        
        // check if is owner
        if(entity.user && entity.user.id===ctx.state.user.id)
          entity = await strapi.services.likes.delete({ id });
    
        return sanitizeEntity(entity, { model: strapi.models.likes });
      },

};
