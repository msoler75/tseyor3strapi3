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

function soyAutor(contenido, user) {
    if(!user||!user.id||!('autor' in contenido) || !contenido.autor) return false
    return contenido.autor===user.id || contenido.autor.id===user.id
}

// comprueba si el usuario tiene acceso segun los permisos indicados
function tengoPermiso (contenido, modo, user) {
    if( soyAutor(contenido, user) ) return true
    if(!('permisos' in contenido))
      return false
    const permisos = contenido.permisos
    // console.log('tengo acceso?', permisos)
    if (!permisos) return true
    const p = permisos[modo]
    if(!p) return false
    // console.log('permisos son', p)
    if (p.rol==='Publico') return true
    // console.log('user', user)
    if (user && user.id) {
      // console.log('miramos permisos de usuario', user)
      if (p.rol==='Autenticados') {
        return true
      }
      if (p.rol==='Delegados' && user.role.find(x => x.type === 'delegado')) {
        return true
      }
      if (p.rol==='Muul' && user.role.find(x => x.type === 'muul')) {
        return true
      }
      if (p.usuarios.find(x => idy(x) === user.id)) {
        return true
      }
      for (const g of p.grupos) {
        if (user.grupos.find(x => idy(x) === idy(g))) {
          return true
        }
      }
      for (const e of p.equipos) {
        if (user.equipos.find(x => idy(x) === idy(e))) {
          return true
        }
      }
    }
    return false
}


module.exports = {
  async find (ctx) {
      let entities;
      if (ctx.query._q) {
        entities = await strapi.services.carpetas.search(ctx.query);
      } else {
        entities = await strapi.services.carpetas.find(ctx.query);
      }
      return entities.filter(carpeta=>tengoPermiso(carpeta, 'lectura', ctx.state.user)).map(entity => sanitizeEntity(entity, { model: strapi.models.carpetas }));
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    const carpeta = await strapi.services.carpetas.findOne({ id });

    if (!carpeta) {
      return ctx.notFound('La carpeta no existe');
    }

    // console.log(carpeta)

     if (
      carpeta &&
      !tengoPermiso(carpeta, 'lectura', ctx.state.user)
    ) {
      return ctx.forbidden(`No tienes permisos`)
    }
    
    return sanitizeEntity(carpeta, { model: strapi.models.carpetas })
  },

  async update (ctx) {
    const { id } = ctx.params
    // nunca va a ser multipart
    const data = ctx.request.body

    // comprobar permisos
    const carpeta = await strapi.services.carpetas.findOne({ id })
    if (
      carpeta &&
      !tengoPermiso(carpeta, 'administracion', ctx.state.user)
    ) {
      return ctx.forbidden(`No tienes permisos`)
    }

    // no se pueden modificar estos campos desde la api
    if (
      'fija' in data ||
      'soloSuperAdmin' in data ||
      'permisos' in data ||
      'slug' in data ||
      'ruta' in data
    ) {
      // check user role permission
      return ctx.forbidden(`Algunos campos no se pueden modificar desde la API`)
    }

    if ('archivos' in data) {
      return ctx.forbidden(`No se pueden establecer archivos directamente`)
    }

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
