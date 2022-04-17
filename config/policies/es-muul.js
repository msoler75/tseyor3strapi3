// para que funcione, el tipo de contenido ha de tener una relación de 1-N con la tabla users-permissions y el campo debe llamarse "autor"

module.exports = async (ctx, next) => {
  // console.log('isOwner?', ctx.state.user.username)

  if (!ctx.state.user)
    return ctx.unauthorized(`Debes autenticarte`)


  const user = await strapi.plugins["users-permissions"].services.user.fetch({
    id: ctx.state.user.id,
  })
  console.log('ES MUUL? USER DATA=', user)

  if (!user.grupos.find(x => x.nombre.toLowerCase() === 'muul'))
    return ctx.forbidden(`No tienes permisos`)

  return await next()
}
