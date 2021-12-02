'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

 const slugify = require('slugify')

const dameCarpeta = async params => {
  return (
    (await strapi.services.carpetas.findOne(params)) ||
    (await strapi.services.carpetas.findOne({
      ...params,
      _publicationState: 'preview'
    }))
  )
}

/* const dameArchivo = async params => {
  return (
    (await strapi.services.archivos.findOne(params)) ||
    (await strapi.services.archivos.findOne({
      ...params,
      _publicationState: 'preview'
    }))
  )
}
*/

function idy (el) {
  if (!el) return null
  if (typeof el !== 'object') return el
  if (el.id) return el.id
  return el
}

module.exports = {
  /**
   * Triggered before user creation.
   */
  lifecycles: {
    async beforeCreate (data) {
      data.slug = slugify(data.nombre, { lower: true })
      if (data.carpeta) {
        const carpeta = await dameCarpeta({id: idy(data.carpeta)})
        if (carpeta) {
          data.ruta = carpeta.ruta + '/' + data.slug
          data.soloSuperAdmin = carpeta.soloSuperAdmin
        }
      }
    },

    async beforeUpdate (params, data) {
      const id = typeof params.id === 'string' ? parseInt(params.id) : params.id
      // console.log('beforeUpdate', params, data)
      if ('nombre' in data) {
        data.slug = slugify(data.nombre, { lower: true })
      }
      // evitamos la modificación manual de la ruta
      /*if('ruta' in data) 
        delete data.ruta
        // actualizamos ruta si es necesario
      if ('slug' in data || 'carpeta' in data) {
        let carpeta
        if ('carpeta' in data) carpeta = data.carpeta
        else {
          const archivo = await dameArchivo({ id })
          carpeta = archivo ? archivo.carpeta : null
        }
        if (carpeta) {
          if (!carpeta.id) carpeta = await dameCarpeta({ id: carpeta })
          if (carpeta)
            data.ruta = carpeta.ruta + '/' + data.slug
        } else data.ruta = ''
      }
      */
     if('carpeta' in data && data.carpeta) {
      const carpeta = await dameCarpeta({id: idy(data.carpeta)})
      if(carpeta)
        data.soloSuperAdmin = carpeta.soloSuperAdmin
     }
    },

    /*async afterUpdate (result, params, data) {
      console.log('afterUpdate', result, params, data)
      // si cambia alguno de estos valores...
    }*/
  }
}
