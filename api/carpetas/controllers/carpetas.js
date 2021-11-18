'use strict'

const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

function idy (x) {
  return x && typeof x === 'object' ? x.id : x
}

async function detectCycle (data, id) {
  if (typeof id === 'string') id = parseInt(id)
  console.log('detectCycle', data, 'id', id)
  if (!data.subcarpetas && id) {
    const curdata = await strapi.services.carpetas.findOne({ id })
    data.subcarpetas = curdata.subcarpetas
  }
  const ids = []
  const next = []
  if (data.padre) ids.push(data.padre.id ? data.padre.id : data.padre)
  if (id && ids.includes(id)) return true // caso raro
  if (id) ids.push(id)
  let current = data
  while (current) {
    for (const carpeta of current.subcarpetas) {
      const id = carpeta.id ? carpeta.id : carpeta
      if (ids.includes(id)) return true
      ids.push(id)
    }
    current = null
    while (
      next.length &&
      !(current = await strapi.services.carpetas.findOne({ id: next.shift() }))
    );
  }
  return false
}

module.exports = {
  async update (ctx) {
    const { id } = ctx.params
    // nunca va a ser multipart
    const data = ctx.request.body
    if ('fija' in data) {
      // check user role permission
      return ctx.forbidden(`No tienes permisos`)
    }

    if ('padre' in data) data.padre = idy(data.padre)
    if ('subcarpetas' in data) data.subcarpetas = idy(data.subcarpetas)

    // verificamos si están cambiando la carpeta de lugar
    if ('padre' in data || 'subcarpetas' in data) {
      const curdata = await strapi.services.carpetas.findOne({ id })
      if(!curdata)
        return ctx.notFound(`Carpeta ${id} no encontrada`)

      curdata.subcarpetas = curdata.subcarpetas.map(x => idy(x))
      if (
        'subcarpetas' in data &&
        JSON.stringify(data.subcarpetas) !== JSON.stringify(curdata.subcarpetas)
      )
        return ctx.forbidden(`No se pueden establecer subcarpetas directamente`)

      curdata.padre = idy(curdata.padre)
      if (curdata.fija && 'padre' in data && data.padre !== curdata.padre)
        return ctx.forbidden(`Esta carpeta no se puede mover`)

      if('padre' in data && data.padre !== curdata.padre)
      {
          const padredata = await strapi.services.carpetas.findOne({ id: data.padre })
          if(!padredata)
            return ctx.notFound(`Carpeta ${data.padre} no encontrada`)
      }

      if (await detectCycle(data, id)) 
        return ctx.forbidden(`Ciclo detectado`)
    }

    let entity = await strapi.services.carpetas.update({ id }, data)

    return sanitizeEntity(entity, { model: strapi.models.carpetas })
  }
}
