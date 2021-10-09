'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

 const noEsCoordinador = async (ctx, id_actividad) => {
    
    const [actividad] = await strapi.services.actividades.find({
        id: id_actividad,
    });

    if(!actividad)
        return `Actividad ${id_actividad} no existe`

    if(!actividad.equipo||actividad.equipo.id)
        return `Equipo no válido`

    const [equipo] = await strapi.services.equipo.find({
        id: actividad.equipo.id
    })

    if(!equipo.coordinadores.find(x=>x.id===ctx.state.user.id))
        return `No eres coordinador/a`

    return false
 };


module.exports = {


     // https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#controllers
     async create(ctx) {
        let entity;
        let msg

        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            
            console.log(data)
            if(msg=noEsCoordinador(ctx, data.actividades.id))
                return ctx.unauthorized(msg)
            
             entity = await strapi.services.reuniones.create(data, { files });

        } else {
            console.log('body')
            console.log(ctx.request.body)
            if(msg=noEsCoordinador(ctx, ctx.request.body.id))
                return ctx.unauthorized(msg)
                
            entity = await strapi.services.reuniones.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.reuniones });
      },


      // https://strapi.io/documentation/developer-docs/latest/guides/is-owner.html#limit-the-update
      async update(ctx) {
        const { id } = ctx.params;

        let entity;
        let msg

        const [reunion] = await strapi.services.reuniones.find({
          id: ctx.params.id,
        });
    
        if (!reunion) {
          return ctx.unauthorized(`Reunión no existe`);
        }

        console.log('reunion', reunion)

        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          
          console.log(data)
          if(msg=noEsCoordinador(ctx, data.actividades.id||reunion.actividades.id))
            return ctx.unauthorized(msg)

            entity = await strapi.services.reuniones.update({ id }, data, {
                files,
            });

        } else {

            console.log('body')
            console.log(ctx.request.body)
            if(msg=noEsCoordinador(ctx, ctx.request.body.id||reunion.actividades.id))
                return ctx.unauthorized(msg)

            entity = await strapi.services.reuniones.update({ id }, ctx.request.body);
        }
    
        return sanitizeEntity(entity, { model: strapi.models.reuniones });
      },


      async delete(ctx) {

        const { id } = ctx.params;
        let msg
        let entity;

        const [reunion] = await strapi.services.reuniones.find({
            id: ctx.params.id,
          });
      
          if (!reunion) {
            return ctx.unauthorized(`Reunión no existe`);
          }

        if(msg=noEsCoordinador(ctx, reunion.actividades.id))
            return ctx.unauthorized(msg)

        entity = await strapi.services.reuniones.delete({ id });
    
        return sanitizeEntity(entity, { model: strapi.models.reuniones });

      },
      
};
