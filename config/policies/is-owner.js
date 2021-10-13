// para que funcione, el tipo de contenido ha de tener una relación de 1-N con la tabla users-permissions y el campo debe llamarse "autor"

module.exports = async (ctx, next) => {
  // console.log('isOwner?', ctx.state.user.username)
  // console.log(ctx.request)
  const url = ctx.request.url
  // console.log('url', url)
  const parts = url.split('/')
  const last = parts[parts.length - 1]
  const collection = parts[parts.length - (last.match(/^\d+$/) ? 2 : 1)]
  // console.log('collection', collection)
  if (!strapi.services[collection])
    return ctx.unauthorized(`Colección ${collection} no encontrada`)

  const [content] = await strapi.services[collection].find({
    id: ctx.params.id,
    'autor.id': ctx.state.user.id
  })

  // console.log('content', content)

  if (!content) {
    return ctx.unauthorized(`Acceso denegado`)
  }
  return await next()
}
