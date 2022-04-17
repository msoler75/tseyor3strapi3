'use strict';


const collection = 'paginas'
const imagenes = require('../../../libs/imagenes.js')
const contenidos = require('../../../libs/contenidos.js')
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
          await imagenes.parsearImagenes(data, collection)
          data.titulo = normalizarTitulo(data.titulo)
        },
    
        async beforeUpdate(params, data) {
          console.log('beforeUpdate', collection, params, data)
          await imagenes.parsearImagenes(data, collection)
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
