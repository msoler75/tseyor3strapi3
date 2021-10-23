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
    for (const src of images) {
        if(src[1].match(/^data:image\/([^;]+)/)) continue
        const img = await strapi.plugins.upload.services.upload.fetch({url: src[1]});
        if(img&&img.id)
        {
            data.imagenes.push(img.id)
        }
    }
}

module.exports = {

    lifecycles: {
        // Called when entry is updated
        async beforeUpdate(params, data) {
            await saveImagenes(data)
        },

        // Called when entry is created
        async beforeCreate(data) {
            await saveImagenes(data)
        },
      },


};
