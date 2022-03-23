'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */


 async function uniformDates(results) {
    console.log(results)
    for(const r of results)
    {
        //r.fecha = r.fecha.replace(/T/, ' ').replace(/Z/, '')
    }
}

module.exports = {


  meilisearch: {
    settings: {
        filterableAttributes: [],
        distinctAttribute: null,
        searchableAttributes: ['titulo', 'texto', 'equipo']
    }
  },

    lifecycles: {
        /*async beforeCreate (data) {
          await normalizeData(data)
        },
    
        async beforeUpdate (params, data) {
          await normalizeData(data)
        },*/
    
        async afterFind(results, params, populate) {
            uniformDates(results)
        },
    
        async afterFindOne(results, params, populate) {
            uniformDates(results)
        }
      }
};
