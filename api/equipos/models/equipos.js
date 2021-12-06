'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const slugify = require('slugify')

const cfs = require('../../../libs/carpetaslib/carpeta.js');

async function prepararCarpeta(ruta, quienPuede) {
    console.log('prepararCarpeta', ruta)
    let carpeta = await cfs.dameCarpeta(ruta)
    if(!carpeta)
    {
        console.log('creamos carpeta')
        if(await cfs.crearCarpeta(ruta))
            carpeta = await cfs.dameCarpeta(ruta)
    }
    if(carpeta)
    {
        let permisos = carpeta.permisos
        console.log('permisos1', permisos)
        if(!permisos||permisos.ruta!==ruta)
        {
            console.log('creamos permisos')
            permisos = await strapi.services.permisos.create({ruta, lectura:{}, escritura: {}})
        }
        console.log('permisos2', permisos)
        // volvemos a cargar la carpeta para ver si se ha modificado los permisos
        //carpeta = cfs.dameCarpeta(ruta)
        if(permisos)
            await strapi.services.permisos.update({id: permisos.id}, quienPuede)
    } else 
    console.log('no se pudo crear carpeta en ', ruta)
}

async function prepararCarpetasEquipo(equipo) {
    const rutaBase = equipo.carpeta?equipo.carpeta.ruta:'/archivos/equipos/'+equipo.slug
    const rutaCompartir = rutaBase + '/compartidos'
    // const rutaPublico = rutaBase + '/publico'    
    await prepararCarpeta(rutaBase,  {
        lectura: {
            delegados: true
        },
        administracion: {
            usuarios: cfs.idsArray(equipo.coordinadores)
        }
    })
    await prepararCarpeta(rutaCompartir,  {
        lectura: {
            delegados: true
        },
        escritura: {
            equipos: [equipo.id]
        },
        administracion: {
            usuarios: cfs.idsArray(equipo.coordinadores)
        }
    })
}


module.exports = {
  /**
   * Triggered before user creation.
   */
  lifecycles: {
    async afterCreate (result, data) {
        prepararCarpetasEquipo(result)
    },

    async beforeUpdate (params, data) {
      const id = typeof params.id === 'string' ? parseInt(params.id) : params.id
      console.log('carpetas.beforeUpdate', params, data)
      if ('nombre' in data) {
        data.slug = slugify(data.nombre, { lower: true })
        console.log('slug', data.slug)
      }
    },

    async afterUpdate (result, params, data) {
        if('coordinadores' in data)
            prepararCarpetasEquipo(result)
    },

    async beforeDelete (params) {
        // ... ?
    }
  }
}
