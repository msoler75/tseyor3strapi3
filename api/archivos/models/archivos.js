'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const collection = 'archivos'
const contenidos = require('../../../libs/contenidos.js')
const slugify = require('slugify')
const {
  idy
} = require('./../../../libs/utils')

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



module.exports = {
  /**
   * Triggered before user creation.
   */
  lifecycles: {
    async beforeCreate(data) {
      data.slug = slugify(data.nombre, {
        lower: true
      })
      if (data.carpeta) {
        const carpeta = await dameCarpeta({
          id: idy(data.carpeta)
        })
        if (carpeta) {
          data.ruta = carpeta.ruta + '/' + data.slug
          data.soloSuperAdmin = carpeta.soloSuperAdmin
        }
      }
    },

    async beforeUpdate(params, data) {
      const id = typeof params.id === 'string' ? parseInt(params.id) : params.id
      // console.log('beforeUpdate', params, data)
      if ('nombre' in data) {
        data.slug = slugify(data.nombre, {
          lower: true
        })
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
      if ('carpeta' in data && data.carpeta) {
        const carpeta = await dameCarpeta({
          id: idy(data.carpeta)
        })
        if (carpeta)
          data.soloSuperAdmin = carpeta.soloSuperAdmin
      }
    },

    /*async afterUpdate (result, params, data) {
      console.log('afterUpdate', result, params, data)
      // si cambia alguno de estos valores...
    }*/



    async afterCreate(result, data) {
      console.log('afterCreate', collection, result)
      await contenidos.save(collection, result)
    },

    async afterUpdate(result, params, data) {
      console.log('afterUpdate', collection, result)
      await contenidos.save(collection, result)
    },

    async afterDelete(result, params) {
      console.log('afterDelete', collection, params, result)
      await contenidos.delete(collection, params.id)
    }
  }
}
