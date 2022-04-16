'use strict';

const collection = 'contactos'
const contenidos = require('../../../libs/contenidos.js')
const {
  normalizarTitulo
} = require('../../../libs/utils.js')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  /*meilisearch: {
    settings: {
      filterableAttributes: ['pais'],
      distinctAttribute: null,
      searchableAttributes: ['provincia', 'direccion1', 'direccion2', 'poblacion', 'telefono', 'correo']
    }
  },*/

  lifecycles: {

    async beforeCreate(params, data) {
      console.log('beforeCreate', collection, params, data)
      data.direccion1 = normalizarTitulo(data.direccion1)
      data.direccion2 = normalizarTitulo(data.direccion2)
      data.poblacion = normalizarTitulo(data.poblacion)
      data.provincia = normalizarTitulo(data.provincia)
    },

    async beforeUpdate(params, data) {
      console.log('beforeUpdate', collection, params, data)
      data.direccion1 = normalizarTitulo(data.direccion1)
      data.direccion2 = normalizarTitulo(data.direccion2)
      data.poblacion = normalizarTitulo(data.poblacion)
      data.provincia = normalizarTitulo(data.provincia)
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
