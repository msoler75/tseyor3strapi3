// para que funcione, el tipo de contenido ha de tener una relación de 1-N con la tabla users-permissions y el campo debe llamarse "autor"

const permisos = require('../../libs/permisoslib/permisos')

module.exports = async (ctx, next) => {

  if (!ctx.state.user) return ctx.unauthorized(`Debes autenticarte`)

  let data = ctx.request.body

  if (
    !tengoPermiso(data, 'creacion', ctx.state.user) &&
    !tengoPermiso(data, 'administracion', ctx.state.user)
  )
    return ctx.forbidden(`No tienes permisos`)

  return await next()
}
