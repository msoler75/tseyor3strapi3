module.exports = {

    // devuelve un array donde cada element es el id 
    idsArray(arr) {
        if(typeof arr !== 'object') return []
        return arr.map(x=>x.id?x.id:x)
    },

    // limpia la ruta
    limpiarRuta(ruta) {
        if(!ruta || typeof ruta === 'object') return '/'
        ruta = ruta.replace(/^https?:\/\/[\/]+/, '')
        if(!ruta) return '/'
        if(ruta.charAt(0)!=='/') ruta = '/'+ruta
        return ruta
    },

    // dada una ruta, devuelve la carpeta
    async dameCarpeta (ruta) {
        ruta = this.limpiarRuta(ruta)
        return await strapi.services.carpetas.findOne({ruta}) ||
        await strapi.services.carpetas.findOne({ruta, _publicationState: 'preview'})
    },
    
    // asigna los archivos a una carpeta según la ruta indicada, ignorando si hubiera otros archivos prevcamente
    async reemplazarArchivosARuta (ruta, archivos) {
        ruta = this.limpiarRuta(ruta)
        archivos = this.idsArray(archivos)
        const carpeta = await this.dameCarpeta(ruta)
        if(carpeta)
            await this.reemplazarArchivosEnCarpeta(carpeta, archivos)
    },

    // asigna los archivos a una carpeta, ignorando si hubiera otros archivos previamente
    async reemplazarArchivosEnCarpeta (carpeta, archivos)  {
        archivos = this.idsArray(archivos)
        await strapi.services.carpetas.update(carpeta.id, {archivos})
    },

    // agrega un array de archivos a la carpeta de la ruta indicada
    async agregarArchivosARuta (ruta, archivos) {
        ruta = this.limpiarRuta(ruta)
        const carpeta = await this.dameCarpeta(ruta)
        if(carpeta)
            await this.reemplazarArchivosEnCarpeta(carpeta, carpeta.archivos.concat(archivos))
    },

    // crea una carpeta en la ruta indicada, o no hace nada si ya existe
    async crearCarpeta (ruta) {
        let carpeta = await this.dameCarpeta(ruta)
        if(!carpeta) {
            console.log('la carpeta no existe')
            let carpetaIdPadre = null
            let rutaParcial = ''
            let creando = false
            ruta = this.limpiarRuta(ruta)
            const parts = ruta.split(/\//).filter(x=>!!x)
            console.log(parts)
            for(const part of parts) {
                rutaParcial += '/' + part
                carpeta = creando ? null : await this.dameCarpeta(rutaParcial)
                // si no existe la creamos
                if(!carpeta)
                {
                    console.log('carpeta', rutaParcial, 'no existe. La creamos')
                    creando = true
                    carpeta = await strapi.services.carpetas.create({padre: carpetaIdPadre, nombre: part})
                    if(!carpeta) return false
                }
                carpetaIdPadre = carpeta? carpeta.id : null
                console.log('carpeta.id', carpetaIdPadre)
            }
        }
        return true
    },

    // dada una ruta de archivo, devuelve el archivo ubicado en dicha carpeta y con dicho nombre, o null
    async dameArchivo(ruta) {
        ruta = this.limpiarRuta(ruta)
        const parts = ruta.split(/\//).filter(x=>!!x)
        if(!parts.length) return null
        const slugArchivo = parts[parts.length-1]
        parts.pop()
        const rutaCarpeta = '/' + parts.join('/')
        const carpeta = await this.dameCarpeta(rutaCarpeta)
        if(!carpeta) return null
        const archivo = carpeta.archivos.find(x=>x.slug===slugArchivo)
        return archivo
        // if(!archivo) return null
        // return await strapi.services.carpetas.findOne({id: archivo.id})
    },

    // dado un id de un archivo, devuelve el archivo o null
    async dameArchivoDeId(idArchivo) {
        return await strapi.services.archivos.findOne({id: idArchivo})
    },

    // dado un id de un media o upload file, devuelve el objeto file (upload)
    async dameMediaDeId(idMedia) {
        return await strapi.plugins.upload.services.upload.fetch({id: idMedia})
    },

    // dado un id de un media o upload file, devuelve el primer archivo asociado
    async dameArchivoDesdeMedia(idMedia) {
        const media = await this.dameMediaDeId(idMedia)
        for(const r of media.related)
            if(r.__contentType==='Archivos')
                return await strapi.services.archivos.findOne({id: r.id})
        return null
    }, 

    // crea un archivo a partir de un idMedia o file id (upload)
    async crearArchivoDeMedia(idMedia) {
        const archivo = await this.dameArchivoDesdeMedia(idMedia)
        if(archivo) return archivo
        const media = await this.dameMediaDeId(idMedia)
        return await strapi.services.archivos.create({nombre: media.name, media: idMedia})
    },

    // devuelve un listado de archivos ya creados o existentes a partir de un array de id media o files (upload)
    async dameArchivosDeMediaList(mediaFiles) {
        const archivos = []
        mediaFiles = this.idsArray(mediaFiles)
        for(const idMedia of mediaFiles) {
            const archivo = await this.crearArchivoDeMedia(idMedia)
            if(archivos)
                archivos.push(archivo)
        }
        return archivos
    },


}