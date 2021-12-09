// para que funcione, el tipo de contenido ha de tener una relación de 1-N con la tabla users-permissions y el campo debe llamarse "autor"


const permisos = require('../../libs/permisoslib/permisos')

module.exports = async (ctx, next) => {
  // console.log('isOwner?', ctx.state.user.username)

  if(!ctx.state.user)
    return ctx.unauthorized(`Debes autenticarte`)

  const {id} = ctx.params
  const collection = ctx.request.route.controller
  // comprobar permisos
    const contenido = await strapi.services[collection].findOne({id})
  if (contenido && !(await permisos.tengoPermiso(contenido, 'creacion', ctx.state.user))
  && !(await permisos.tengoPermiso(contenido, 'administracion', ctx.state.user))) {
    return ctx.forbidden(`No tienes permisos`)
  }
    
  return await next()
}
