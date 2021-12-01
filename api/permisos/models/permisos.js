'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

async function damePermisos () {
  const sql = `SELECT id, ruta FROM permisos ORDER BY ruta DESC`
  const knex = strapi.connections.default
  const permisos = await knex.raw(sql)
  return permisos[0].map(x => ({ id: x.id, ruta: x.ruta.toLowerCase() }))
}

function permisosRuta (permisos, ruta) {
  ruta = ruta.toLowerCase()
  for (const p of permisos) {
    if (ruta.indexOf(p.ruta) === 0) {
      console.log('permisos de ruta', p.ruta)
      return p.id
    }
  }
  return null
}

// revisa los permisos de todas las carpetas
async function actualizaCarpetas () {
  console.log('revisamos los permisos de todas las carpetas')
  const carpetas = await strapi.services.carpetas.find({})
  const permisos = await damePermisos()
  for (const carpeta of carpetas) {
    const oldpid = carpeta.permisos ? carpeta.permisos.id : null
    const newpid = permisosRuta(permisos, carpeta.ruta)
    // si ha habido cambios, actualizamos la carpeta con los nuevos permisos
    if (oldpid !== newpid) {
      console.log('carpeta con nuevos permisos', carpeta.ruta, newpid)
      await strapi.services.carpetas.update(
        { id: carpeta.id },
        { permisos: newpid }
      )
    }
  }
}

module.exports = {
  lifecycles: {
    async afterCreate (result, data) {
      await actualizaCarpetas()
    },

    async afterUpdate (result, params, data) {
      // solo si se modifica la ruta
      if ('ruta' in data) {
        await actualizaCarpetas()
      }
    },

    async afterDelete (result, params) {
      await actualizaCarpetas()
    }
  }
}
