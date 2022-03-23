'use strict'

const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const slugify = require('slugify')

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


const permisos = require('../../../libs/permisoslib/permisos')


module.exports = {
  async find (ctx) {
    let entities
    if (ctx.query._q) {
      entities = await strapi.services.carpetas.search(ctx.query)
    } else {
      entities = await strapi.services.carpetas.find(ctx.query)
    }
    return entities
      .filter(async carpeta => await permisos.tengoPermiso(carpeta, 'lectura', ctx.state.user))
      .map(entity => sanitizeEntity(entity, { model: strapi.models.carpetas }))
  },

  async create (ctx) {
    // nunca va a ser multipart
    let data = ctx.request.body
    
    // guardamos el autor
    data.autor = ctx.state.user.id

    data.slug = slugify(data.nombre, { lower: true })

    // habitual creation from here
    let entity = await strapi.services.carpetas.create(data)

    return sanitizeEntity(entity, { model: strapi.models.carpetas })
  },

  
  async update (ctx) {
    const { id } = ctx.params
    // nunca va a ser multipart
    const data = ctx.request.body

    // no se pueden modificar estos campos desde la api
    const campos = ['fija', 'soloSuperAdmin', 'permisos', 'slug', 'ruta', 'archivos', 'subcarpetas', 'autor']
    for(const campo of campos)
    if(campo in data)
      delete data[campo]

    if ('padre' in data) data.padre = idy(data.padre)
    if ('subcarpetas' in data) data.subcarpetas = idy(data.subcarpetas)

    // verificamos si están cambiando la carpeta de lugar
    if ('padre' in data || 'subcarpetas' in data) {
      const curdata = await strapi.services.carpetas.findOne({ id })
      if (!curdata) return ctx.notFound(`Carpeta ${id} no encontrada`)

      curdata.subcarpetas = curdata.subcarpetas.map(x => idy(x))
      if (
        'subcarpetas' in data &&
        JSON.stringify(data.subcarpetas) !== JSON.stringify(curdata.subcarpetas)
      )
        return ctx.forbidden(`No se pueden establecer subcarpetas directamente`)

      curdata.padre = idy(curdata.padre)
      if (curdata.fija && 'padre' in data && data.padre !== curdata.padre)
        return ctx.forbidden(`Esta carpeta no se puede mover`)

      if ('padre' in data && data.padre !== curdata.padre) {
        const padredata = await strapi.services.carpetas.findOne({
          id: data.padre
        })
        if (!padredata)
          return ctx.notFound(`Carpeta ${data.padre} no encontrada`)
      }

      if (await detectCycle(data, id)) return ctx.forbidden(`Ciclo detectado`)
    }

    let entity = await strapi.services.carpetas.update({ id }, data)

    return sanitizeEntity(entity, { model: strapi.models.carpetas })
  }
}
