'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const collection = 'anexos'
const imagenes = require('../../../libs/imagenes.js')
const {
    normalizarTitulo
  } = require('../../../libs/utils.js')
  

module.exports = {

    lifecycles: {
        // Called when entry is updated
        async beforeUpdate(params, data) {
            await imagenes.parsearImagenes(data, collection)
            data.titulo = normalizarTitulo(data.titulo)
        },

        // Called when entry is created
        async beforeCreate(data) {
            await imagenes.parsearImagenes(data, collection)
            data.titulo = normalizarTitulo(data.titulo)
        },
      },


};
