'use strict'

const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const slugify = require('slugify')

let listaPermisosDesc = null
// let listaPermisosAsc = null

async function preparaListaPermisos () {
  if (!listaPermisosDesc) {
    const sql = `SELECT id, ruta FROM permisos ORDER BY ruta DESC`
    const knex = strapi.connections.default
    const permisos = await knex.raw(sql)
    listaPermisosDesc = permisos[0].map(x => ({
      id: x.id,
      ruta: x.ruta.toLowerCase()
    }))
    // listaPermisosAsc = await strapi.services.permisos.find({_sort: 'ruta::asc'})
    // console.log('listapermisosdesc', listaPermisosDesc)
  }
}

/**
 * Busca en todas las rutas, ordenadas de forma descendente, por lo que cuando encuentre una que empareje, es la buena
 *
 * Ejemplo:
 *
 * buscamos permisos para la carpeta /archivos/muul/divulgacion
 *
 * Y tenemos este listado de rutas:
 *
 * /archivos/ong/actas
 * /archivos/ong
 * /archivos/muul        <--- encuentra esta
 * /archivos/junantal
 * /archivos
 */
async function buscaPermisos (ruta) {
  ruta = ruta.toLowerCase()
  await preparaListaPermisos() // carga la variable 'listaPermisos'
  for (const p of listaPermisosDesc) {
    if (ruta.indexOf(p.ruta) === 0) {
      return p.id
    }
  }
  return null
}

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

function soyAutor (contenido, user) {
  if (!user || !user.id || !('autor' in contenido) || !contenido.autor)
    return false
  return contenido.autor === user.id || contenido.autor.id === user.id
}

// comprueba si el usuario tiene acceso segun los permisos indicados
function tengoPermiso (contenido, modo, user) {
  if (soyAutor(contenido, user)) return true
  if (!('permisos' in contenido)) return false
  const permisos = contenido.permisos
  // console.log('tengo acceso?', permisos)
  if (!permisos) return true
  const p = permisos[modo]
  if (!p) return false
  // console.log('permisos son', p)
  if (p.rol === 'Publico') return true
  console.log('user', user)
  if (user && user.id) {
    // console.log('miramos permisos de usuario', user)
    if (p.rol === 'Autenticados') {
      return true
    }
    if (p.rol==='Delegados' && user.role.type === 'delegado') {
      return true
    }
    if (p.rol==='Muul' && user.role.type ==='muul') {
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
    let entities
    if (ctx.query._q) {
      entities = await strapi.services.carpetas.search(ctx.query)
    } else {
      entities = await strapi.services.carpetas.find(ctx.query)
    }
    return entities
      .filter(carpeta => tengoPermiso(carpeta, 'lectura', ctx.state.user))
      .map(entity => sanitizeEntity(entity, { model: strapi.models.carpetas }))
  },

  async findOne (ctx) {
    const { id } = ctx.params

    const carpeta = await strapi.services.carpetas.findOne({ id })

    if (!carpeta) {
      return ctx.notFound('La carpeta no existe')
    }

    // console.log(carpeta)

    if (carpeta && !tengoPermiso(carpeta, 'lectura', ctx.state.user)) {
      return ctx.forbidden(`No tienes permisos`)
    }

    return sanitizeEntity(carpeta, { model: strapi.models.carpetas })
  },

  async create (ctx) {
    console.log('create')
    // nunca va a ser multipart
    let data = ctx.request.body
    if (ctx.state.user) data.autor = ctx.state.user.id

    if ('nombre' in data) data.slug = slugify(data.nombre, { lower: true })

    // buscamos la carpeta padre o los permisos raíz para ver si podemos crear esta carpeta
    let permisosPadre = null

    let carpetaPadre = data.padre
      ? await strapi.services.carpetas.findOne({ id: idy(data.padre) })
      : null
    if (carpetaPadre) {
      permisosPadre = carpetaPadre.permisos
    } else {
      let permisosId = await buscaPermisos('/')
      if (permisosId)
        permisosPadre = await strapi.services.carpetas.findOne({
          id: permisosId
        })
    }
    if (permisosPadre) {
      let nuevoContenido = {
        permisos: permisosPadre
      }
      if (!tengoPermiso(nuevoContenido, 'creacion', ctx.state.user)&&!tengoPermiso(nuevoContenido, 'administracion', ctx.state.user))
        return ctx.forbidden(`No tienes permisos`)
    }

    console.log('ctx', ctx.request.body)
    let entity = await strapi.services.carpetas.create(data)

    return sanitizeEntity(entity, { model: strapi.models.carpetas })
  },

  async update (ctx) {
    const { id } = ctx.params
    // nunca va a ser multipart
    const data = ctx.request.body

    // comprobar permisos
    /*
    const carpeta = await strapi.services.carpetas.findOne({ id })
    if (carpeta && !tengoPermiso(carpeta, 'administracion', ctx.state.user)) {
      return ctx.forbidden(`No tienes permisos`)
    }
    */

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
