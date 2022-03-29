'use strict';

const contenidos = require('../../../libs/contenidoslib/contenidos.js')


/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    meilisearch: {
        settings: {
            filterableAttributes: ['tipo'],
            distinctAttribute: null,
            searchableAttributes: ['nombre', 'descripcion']
        }
      },


      async afterDelete(result, params) {
        await contenidos.delete('centros', result)
    }
};
