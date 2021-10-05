'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');


const likescontroller = require('../../likeslib/controllers.js')


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
            data.user = ctx.state.user.id;
            entity = await strapi.services.comentarios.create(data, { files });
        } else {
            ctx.request.body.user = ctx.state.user.id;
            entity = await strapi.services.comentarios.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.comentarios });
      },


      async update(ctx) {
        const { id } = ctx.params;

        let entity = await strapi.services.comentarios.findOne({ id });
        
        // check  owner
        if(entity.user && entity.user.id===ctx.state.user.id)
        {
          if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.services.comentarios.update({ id }, data, {
              files,
            });
          } else {
            entity = await strapi.services.comentarios.update({ id }, ctx.request.body);
          }
        }
    
        return sanitizeEntity(entity, { model: strapi.models.comentarios });
      },


      async delete(ctx) {

        const { id } = ctx.params;

        let entity = await strapi.services.comentarios.findOne({ id });
        
        // check owner
        if(entity.user && entity.user.id===ctx.state.user.id)
          entity = await strapi.services.comentarios.delete({ id });
    
        return sanitizeEntity(entity, { model: strapi.models.comentarios });
      },


         // https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#controllers

    async like(ctx) {
      return likescontroller.like('comentarios', ctx)
  },


  
  async dislike(ctx) {
    return likescontroller.dislike('comentarios', ctx)
  },


};
