'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

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
  }
}

function idy (el) {
  if (!el) return null
  if (typeof el !== 'object') return el
  if (el.id) return el.id
  return el
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

// revisa los permisos de todas las carpetas
async function actualizaCarpetas () {
  const carpetas = await strapi.services.carpetas.find({})
  for (const carpeta of carpetas) {
    const oldpid = carpeta.permisos ? carpeta.permisos.id : null
    const newpid = await buscaPermisos(carpeta.ruta)
    // si ha habido cambios, actualizamos la carpeta con los nuevos permisos
    if (oldpid !== newpid) {
      await strapi.services.carpetas.update(
        { id: carpeta.id },
        { permisos: newpid }
      )
    }
  }
}

const actions = {
  'lectura': ['publico', 'autenticados', 'delegados', 'muul', 'equipos', 'grupos', 'usuarios'], 
  'creacion': ['publico', 'autenticados', 'delegados', 'muul', 'equipos', 'grupos', 'usuarios'], 
  'administracion': ['usuarios']
}

function actualizarConPermisosBase (permisos, action, permisosBase) {
  let modificado = false
  if (!(action in permisosBase) || permisosBase[action] === null) {
    permisosBase[action] = {
      heredado: true,
      publico: false,
      autenticados: false,
      delegados: false,
      muul: false,
      equipos: [],
      grupos: [],
      usuarios: []
    }
  }
  if (permisos[action] === null) {
    permisos[action] = { heredado: true }
    modificado = true
  }
  if (permisos[action].heredado) {
    for (const rol of actions[action]) {
      if (
        !(rol in permisos[action]) ||
        JSON.stringify(permisos[action][rol]) !=
          JSON.stringify(permisosBase[action][rol])
      ) {
        permisos[action][rol] = permisosBase[action][rol]
        if(typeof permisos[action][rol] === 'object' && permisos[action][rol])
          permisos[action][rol] = permisos[action][rol].map(x=>idy(x))
        modificado = true
      }
    }
  }
  return modificado
}

/**
 * Actualiza todos los permisos para que los heredados reflejen el valor del permiso 'padre'
 */
async function actualizaPermisos (rutaPattern) {
  const listaPermisosAsc = await strapi.services.permisos.find({
    ruta_contains: rutaPattern,
    _sort: 'ruta'
  })
  const rutasProcesadas = []
  for (const index in listaPermisosAsc) {
    const permisos = listaPermisosAsc[index]
    if (!permisos.ruta.startsWith(rutaPattern)) {
      // es de otra rama
      continue
    }
    if (rutasProcesadas.find(x => permisos.ruta.startsWith(x))) {
      // esta rama ya se ha actualizado (a través de la llamada a strapi.services.permisos.update (más abajo))
      continue
    }
    let permisosBase = null
    let rutaPadre = permisos.ruta.replace(/\/[^/]+$/, '')
    if (permisos.ruta === rutaPadre) continue
    const permisoIdPadre = await buscaPermisos(rutaPadre)
    if (permisoIdPadre) {
      permisosBase = listaPermisosAsc.find(x => x.id === permisoIdPadre)
    }
    if (!permisosBase) {
      permisosBase = await strapi.services.permisos.findOne({id:permisoIdPadre})
    }
    if (!permisosBase) {
      console.warn('No se han encontrado permisos padre para', rutaPadre)
      continue
    }

    let modificado = false
    for (const action in actions) {
      modificado = modificado || actualizarConPermisosBase(permisos, action, permisosBase)
    }
    if (modificado) {
      listaPermisosAsc[index] = permisos
      await strapi.services.permisos.update({ id: permisos.id }, permisos)
    }
    rutasProcesadas.push(permisos.ruta)
  }
}

/*

  / -> delegados
  /archivos -> hereda -> delegados
  /archivos/ong/actas -> muul
  /archivos/ong/anexos -> hereda -> delegados
  

*/

module.exports = {
  lifecycles: {
    async beforeCreate (data) {
      // no se permiten asignar así las carpetas
      if ('carpetas' in data) delete data.carpetas
    },

    async afterCreate (result, data) {
      // actualiza los permisos para esta ruta
      await actualizaPermisos(result.ruta)
      await actualizaCarpetas()
    },

    async beforeUpdate (params, data) {
      // no se permiten asignar así las carpetas
      if ('carpetas' in data) delete data.carpetas
      if ('ruta' in data) {
        // elimina la barra al final de la ruta
        if (data.ruta !== '/') data.ruta = data.ruta.replace(/\/$/, '')
      }
      let heredan = []
      for (const action in actions) {
        if(action in data && data[action] && data[action].heredado)
          heredan.push(action)
      }
      // alguna herencia?
      if (heredan.length) {
        const orig = await strapi.services.permisos.findOne(params)
        if (!('ruta' in data)) {
          data.ruta = orig.ruta
        }
        if (!('ruta' in data))
          throw strapi.errors.badRequest('Se debe especificar la ruta cuando hay herencia')
        if (data.ruta !== '/') {
          let rutaPadre = data.ruta.replace(/\/[^/]+$/, '')
          const idPermisosBase = await buscaPermisos(rutaPadre)
          const permisosBase = await strapi.services.permisos.findOne({id:idPermisosBase})
          for (const action in actions) {
            actualizarConPermisosBase(data, action, permisosBase)
          }
        }
      }
      // para la ruta raíz '/' no se permite poner heredado
      if('lectura' in data && data.ruta==='/') {
        for (const action in actions) {
          if(action in data && data[action] && data[action].heredado) {
            data[action].heredado = false
          }
        }
      }
    },

    async afterUpdate (result, params, data) {
      // solo si se modifica la ruta
      await actualizaPermisos(result.ruta + '/')
      if ('ruta' in data) {
        await actualizaCarpetas()
      }
    },

    async afterDelete (result, params) {
      // actualizamos permisos para ramas del árbol de ruta
      await actualizaPermisos('')
      await actualizaCarpetas()
    }
  }
}
