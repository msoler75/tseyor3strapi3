'use strict';

const collection = 'libros'
const imagenes = require('../../../libs/imagenes.js');
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
      distinctAttribute: null,
      searchableAttributes: ['titulo', 'descripcion', 'slug', 'categoria'],
      filterableAttributes: ['categoria'],
      displayedAttributes: ['titulo', 'descripcion', 'imagen', 'slug', 'categoria', 'published_at', 'updated_at'],
      sortableAttributes: ['edicionFecha', 'categoria', 'published_at', 'updated_at']
    },
    transformEntry({
      entry
    }) {
      return {
        ...entry,
        etiquetas: entry.etiquetas.map(x => x.nombre), // map categories to only have categories name.
      }
    },
  },

  lifecycles: {

    async beforeCreate(params, data) {
      console.log('beforeCreate', collection, params, data)
      data.titulo = normalizarTitulo(data.titulo)
    },

    async beforeUpdate(params, data) {
      console.log('beforeUpdate', collection, params, data)
      data.titulo = normalizarTitulo(data.titulo)
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
