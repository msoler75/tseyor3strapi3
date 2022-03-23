'use strict';

const cfs = require('../../../libs/carpetaslib/carpeta.js');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */



const saveImagenes = async (data) => {
    if(!data.texto) return
    const regexp = /\!\[[^\]]*\]\((data:image[^)]+|.+?\.(jpe?g|png|webp|gif)[^)]*)\)/g;
    const images = data.texto.matchAll(regexp);
    data.imagenes = []
    var bestImage = data.imagen
    if(bestImage&&(!bestImage.id||!bestImage.width||bestImage.width<200))
        bestImage = null
    for (const src of images) {
        if(src[1].match(/^data:image\/([^;]+)/)) continue
        const img = await strapi.plugins.upload.services.upload.fetch({url: src[1]});
        if(img&&img.id)
        {
            data.imagenes.push(img.id)
            if (
               (!bestImage && (img.width > 200 && img.height > 200)) || 
               (bestImage && bestImage.width < 400 && img.width > bestImage.width && img.height > 200)
            )
            {
                bestImage = img
            }
        }
    }
    if(!bestImage) {
        var r = data.texto.match(/(shilcars|noiwanak|rasbek|orsil|melcor|orjaín|\borja.{1,5}n\b|jalied|seiph)/i)
        const guia = r?r[1].toLowerCase():'shilcars'
        const src = `${guia}.jpg`
        const img = await strapi.plugins.upload.services.upload.fetch({name: src});
        if(img)
            bestImage = img
    }
    data.imagen = bestImage
}

async function ubicarImagenesEnCarpeta(data) {
    // agarramos todas las imagenes en un solo array
    var mediaFiles = data.imagenes.concat([])
    if(data.imagen&&!mediaFiles.find(x=>x.id===data.imagen.id))
        mediaFiles.push(data.imagen)
    if(!mediaFiles.length) return
    const ruta = `/archivos/comunicados/${data.id}`
    await cfs.crearCarpeta(ruta)
    const archivos = await cfs.dameArchivosDeMediaList(mediaFiles)
    await cfs.reemplazarArchivosARuta(ruta, archivos)
}


module.exports = {

    meilisearch: {
        settings: {
          filterableAttributes: [],
          distinctAttribute: null,
          searchableAttributes: ['titulo', 'texto', 'slug'],
          displayedAttributes: ['titulo', 'descripcion', 'imagen', 'slug']
        }
      },

    lifecycles: {

        async beforeUpdate(params, data) {
            console.log('beforeUpdate')
            await saveImagenes(data)
        },

        async beforeCreate(data) {
            console.log('beforeCreate')
            await saveImagenes(data)
        },        
        
        async afterCreate(result, data) {
            console.log('afterCreate')
            await ubicarImagenesEnCarpeta(result)
        },

        async afterUpdate(result, params, data) {
            console.log('afterUpdate')
            await ubicarImagenesEnCarpeta(result)
        },

        // truco para actualizar las imagenes
        async afterFindOne(result, params, populate) {
            console.log('afterFindOne')
            await ubicarImagenesEnCarpeta(result)
            /* let carpeta = await cfs.dameCarpeta('/ong')
            console.log(carpeta)
            carpeta = await cfs.dameCarpeta('/archivos/ong')
            console.log(carpeta)
            await cfs.crearCarpeta('/pepito/amoroso/celta') */
        },
      },


};
