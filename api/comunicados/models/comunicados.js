'use strict';

const collection = 'comunicados'
const imagenes = require('../../../libs/imagenes.js');
const contenidos = require('../../../libs/contenidos.js')
const {
  normalizarTitulo
} = require('../../../libs/utils.js')
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

function obtenerGuiaImagen(texto) {
    const r = texto.match(/(shilcars|noiwanak|rasbek|orsil|melcor|orjaín|\borja.{1,5}n\b|jalied|seiph)/i)
    const guia = r ? r[1].toLowerCase() : 'shilcars'
    const imagen = `${guia}.jpg`
    return imagen
}


module.exports = {

  meilisearch: {
    settings: {
      filterableAttributes: ['fecha'],
      distinctAttribute: null,
      searchableAttributes: ['titulo', 'texto', 'slug'],
      displayedAttributes: ['titulo', 'descripcion', 'imagen', 'slug']
    }
  },

  lifecycles: {


    async beforeCreate(data) {
      console.log('beforeCreate', collection, data)
      await imagenes.parsearImagenes(obtenerGuiaImagen(data.texto), data)
      data.titulo = normalizarTitulo(data.titulo)
    },


    async beforeUpdate(params, data) {
      console.log('beforeUpdate', collection, params)
      await imagenes.parsearImagenes(obtenerGuiaImagen(data.texto), data)
      data.titulo = normalizarTitulo(data.titulo)

    },

    // truco para actualizar las imagenes
    async afterFindOne(result, params, populate) {
      console.log('afterFindOne')
      //// DESCOMENTAR!!!
      // await imagenes.ubicarImagenesEnCarpeta('comunicados', result)

      /* let carpeta = await cfs.dameCarpeta('/ong')
      console.log(carpeta)
      carpeta = await cfs.dameCarpeta('/archivos/ong')
      console.log(carpeta)
      await cfs.crearCarpeta('/pepito/amoroso/celta') */
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
  },


};
