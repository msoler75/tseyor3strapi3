'use strict';

const collection = 'audios'
const contenidos = require('../../../libs/contenidos.js')
const {normalizarTitulo} = require('../../../libs/utils.js')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  meilisearch: {
    settings: {
      filterableAttributes: ['categoria'],
      distinctAttribute: null,
      searchableAttributes: ['titulo', 'audio', 'descripcion']
    }
  },


  lifecycles: {

    async beforeCreate(data) {
      console.log('beforeCreate', collection, data)
      data.titulo = normalizarTitulo(data.titulo)
    },

    async beforeUpdate(params, data) {
      console.log('beforeUpdate', collection, params, data)
      data.titulo = normalizarTitulo(data.titulo)
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
