'use strict';

const collection = 'eventos'
const imagenes = require('../../../libs/imagenes.js')
const contenidos = require('../../../libs/contenidos.js')
const slugify = require('slugify')
const {
  normalizarTitulo
} = require('../../../libs/utils.js')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */



module.exports = {

  lifecycles: {

    async beforeCreate(data) {
      console.log('beforeCreate', collection, data)
      data.titulo = normalizarTitulo(data.titulo)
      if(!data.slug)data.slug = slugify(data.titulo, {
        lower: true
      })
    },

    async beforeUpdate(params, data) {
      console.log('beforeUpdate', collection, params, data)
      data.titulo = normalizarTitulo(data.titulo)
      if(!data.slug)data.slug = slugify(data.titulo, {
        lower: true
      })
    },

    async afterCreate(result, data) {
      console.log('afterCreate', collection, result)
      await imagenes.ubicarImagenesEnCarpeta(collection, result)
      await contenidos.save(collection, result)
    },

    async afterUpdate(result, params, data) {
      console.log('afterUpdate', collection, result)
      await imagenes.ubicarImagenesEnCarpeta(collection, result)
      await contenidos.save(collection, result)
    },

    async afterDelete(result, params) {
      console.log('afterDelete', collection, params, result)
      await contenidos.delete(collection, params.id)
    }

  }


};
