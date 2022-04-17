const cfs = require('./carpeta.js');

module.exports = {

  // guarda las imagenes del comunicado en una carpeta en la zona de archivos
  async ubicarImagenesEnCarpeta(collection, data) {
    return 
    // agarramos todas las imagenes en un solo array
    var mediaFiles = data.imagenes.concat([])
    if (data.imagen && !mediaFiles.find(x => x.id === data.imagen.id))
      mediaFiles.push(data.imagen)
    if (!mediaFiles.length) return
    const ruta = `/archivos/${collection}/imagenes/${data.id}`
    await cfs.crearCarpeta(ruta)
    const archivos = await cfs.dameArchivosDeMediaList(mediaFiles)
    await cfs.reemplazarArchivosARuta(ruta, archivos)
  },



  async parsearImagenes(data, default_image) {
    if (!data.texto) return
    const regexp = /\!\[[^\]]*\]\((data:image[^)]+|.+?\.(jpe?g|png|webp|gif)[^)]*)\)/g;
    const images = data.texto.matchAll(regexp);
    if(!('imagenes' in data))
      data.imagenes = []
    console.log('bestImage', data.imagen)
    var bestImage = data.imagen
    // if(bestImage&&(!bestImage.id||!bestImage.width||bestImage.width<200))
    // bestImage = null
    for (const src of images) {
      if (src[1].match(/^data:image\/([^;]+)/)) continue
      const img = await strapi.plugins.upload.services.upload.fetch({
        url: src[1]
      });
      if (img && img.id) {
        data.imagenes.push(img.id)
        if (
          (!bestImage && (img.width > 200 && img.height > 200)) ||
          (bestImage && bestImage.width < 400 && img.width > bestImage.width && img.height > 200)
        ) {
          bestImage = img.id
        }
      }
    }
    if (!bestImage&& collection) {
      const img = await strapi.plugins.upload.services.upload.fetch({
        name: default_image || 'sello'
      });
      if (img)
        bestImage = img.id
    }
    data.imagen = bestImage
  }

}
