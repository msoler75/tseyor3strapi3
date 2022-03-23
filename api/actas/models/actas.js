'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

// sirve para normalizar la información relacional
async function normalizeData (data) {
  const reunion = data.reunion
    ? await strapi.services.reuniones.findOne({ id: data.reunion })
    : null
  const actividad = reunion
    ? await strapi.services.reuniones.findOne({ id: reunion.actividad.id })
    : data.actividad
    ? await strapi.services.actividades.findOne({ id: data.actividad })
    : data.equipo
    ? await strapi.services.actividades.findOne({
        titulo: 'Reuniones',
        equipo: data.equipo
      })
    : null
  if (data.reunion) {
    data.actividad = reunion.actividad.id
    data.equipo = reunion.equipo.id
  } else if (data.actividad) {
    data.reunion = null
    data.equipo = actividad.equipo.id
  } else if (data.equipo) {
    data.reunion = null
    data.actividad = null
  }
}

async function uniformDates(results) {
    console.log(results)
    for(const r of results)
    {

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
    async beforeCreate (data) {
      await normalizeData(data)
    },

    async beforeUpdate (params, data) {
      await normalizeData(data)
    },

    async afterFind(results, params, populate) {
        uniformDates(results)
    },

    async afterFindOne(results, params, populate) {
        uniformDates(results)
    }
  }
}
