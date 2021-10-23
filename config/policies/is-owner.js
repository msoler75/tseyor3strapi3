// para que funcione, el tipo de contenido ha de tener una relación de 1-N con la tabla users-permissions y el campo debe llamarse "autor"

module.exports = async (ctx, next) => {
  // console.log('isOwner?', ctx.state.user.username)

  if(!ctx.state.user)
    return ctx.unauthorized(`Debes autenticarte`)

  const collection = ctx.request.route.controller
  if (!strapi.services[collection])
    return ctx.notFound(`Colección ${collection} no encontrada`)

  const [content] = await strapi.services[collection].find({
    id: ctx.params.id,
    'autor.id': ctx.state.user.id
  })

  // console.log('content', content)

  if (!content) {
    return ctx.forbidden(`Acceso denegado`)
  }
  return await next()
}
