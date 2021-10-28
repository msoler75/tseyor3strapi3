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
            if(ctx.state.user)
              data.autor = ctx.state.user.id
            entity = await strapi.services.comentarios.create(data, { files });
        } else {
            if(ctx.state.user)
              ctx.request.body.autor = ctx.state.user.id
            entity = await strapi.services.comentarios.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.comentarios });
      },


      // https://strapi.io/documentation/developer-docs/latest/guides/is-owner.html#limit-the-update
      /* async update(ctx) {
        const { id } = ctx.params;

        let entity;

        const [comment] = await strapi.services.comentarios.find({
          id: ctx.params.id,
          'user.id': ctx.state.user.id,
        });
    
        if (!comment) {
          return ctx.unauthorized(`Acceso denegado`);
        }

        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          entity = await strapi.services.comentarios.update({ id }, data, {
            files,
          });
        } else {
          entity = await strapi.services.comentarios.update({ id }, ctx.request.body);
        }
    
        return sanitizeEntity(entity, { model: strapi.models.comentarios });
      },
      */

      /*

      async delete(ctx) {

        const { id } = ctx.params;

        const [comment] = await strapi.services.comentarios.find({
          id: ctx.params.id,
          'user.id': ctx.state.user.id,
        });
    
        if (!comment) {
          return ctx.unauthorized(`Acceso denegado`);
        }

        let entity = await strapi.services.comentarios.delete({ id });
    
        return sanitizeEntity(entity, { model: strapi.models.comentarios });
      },

      */


         // https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#controllers

    async like(ctx) {
      return likescontroller.like('comentarios', ctx)
    },


  
  async dislike(ctx) {
    return likescontroller.dislike('comentarios', ctx)
  },


};
