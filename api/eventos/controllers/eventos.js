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


      async join(ctx) {
        // console.log('--- join ---')
        if(!ctx.state.user)
            return ctx.unauthorized(`Debes autenticarte`)

        const user = await strapi.plugins["users-permissions"].services.user.fetch({
            id: ctx.state.user.id,
        })

        const id = parseInt(ctx.params.id)

        let eventos = user.asiste.map(x=>x.id)
        if(!eventos.find(x=>x===id)) {
            eventos.push(id)
            await strapi.query("user", "users-permissions")
                        .update({ id: ctx.state.user.id }, 
                                {
                                    asiste: eventos
                                })
        }

        let entity = await strapi.services.eventos.find({id});
        return sanitizeEntity(entity[0], { model: strapi.models.eventos });
      },


      async leave(ctx) {
        // console.log('--- join ---')
        if(!ctx.state.user)
            return ctx.unauthorized(`Debes autenticarte`)

        const user = await strapi.plugins["users-permissions"].services.user.fetch({
            id: ctx.state.user.id,
        })

        const id = parseInt(ctx.params.id)

        let eventos = user.asiste.map(x=>x.id)
        let idx = eventos.findIndex(x=>x===id)
        if(idx>-1) {
            eventos.splice(idx, 1)
            await strapi.query("user", "users-permissions")
                        .update({ id: ctx.state.user.id }, 
                                {
                                    asiste: eventos
                                })
        }

        let entity = await strapi.services.eventos.find({id});
        return sanitizeEntity(entity[0], { model: strapi.models.eventos });
      },
    

};
