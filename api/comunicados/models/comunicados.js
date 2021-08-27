'use strict';

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


module.exports = {

    lifecycles: {

        async beforeSave(params, data) {
            console.log('beforeSave', params, data)
        },

        // Called when entry is updated
        async beforeUpdate(params, data) {
            console.log('beforeUpdate')
            await saveImagenes(data)
        },

        // Called when entry is created
        async beforeCreate(data) {
            console.log('beforeCreate')
            await saveImagenes(data)
        },
      },


};
