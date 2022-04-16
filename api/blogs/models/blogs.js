'use strict';

const collection = 'blogs'
const contenidos = require('../../../libs/contenidos.js')
const {
  normalizarTitulo
} = require('../../../libs/utils.js')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  meilisearch: {
    settings: {
      filterableAttributes: [],
      distinctAttribute: null,
      searchableAttributes: ['nombre', 'descripcion', 'slug'],
      // displayedAttributes: ['nombre', 'descripcion', 'slug']
    }
  },

  lifecycles: {

    async beforeCreate(params, data) {
      console.log('beforeCreate', collection, params, data)
      data.nombre = normalizarTitulo(data.nombre)
    },

    async beforeUpdate(params, data) {
      console.log('beforeUpdate', collection, params, data)
      data.nombre = normalizarTitulo(data.nombre)
    },

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
};
