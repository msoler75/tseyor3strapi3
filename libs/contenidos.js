// tipos de contenido que indexar
const todas_las_colecciones = ['archivos', 'audios', 'blogs', 'carpetas', 'centros', 'comunicados', 'contactos', 'entradas', 'eventos', 'equipos', 'guias', 'libros', 'normativas', 'noticias', 'paginas', 'redes', 'salas', 'usuarios']

const {idy} = require('./utils')

// divide el texto en partes de 1000 palabras máximo (ya que es una limitación de meilisearch)
// retorna un array con cada uno de los grupos de texto
const split_text = function (texto) {
  if (!texto) return {}
  // limpia el texto
  texto = texto.replace(/ANEXOS?.*/, '')
    .replace(/\!?\[([^\]]*)\]\([^\)]*\)/g, ' $1 ')
    .replace(/[\*\`\"\'\-\_\t\r]/g, ' ')

  const getField = (n) => 'texto' + (num == 1 ? '' : num)
  const cleanSpaces = (txt) => txt.replace(/\s{2,99}/g, ' ').replace(/^\s|\s$/g, '')
  const lines = texto.split(/\n/)
  const result = {}
  let current = []
  let num = 1
  for (const line of lines) {
    const words = line.split(/\[\.\(\)\,]/)
    if (current.length + words.length >= 1000) {
      const field = getField(num)
      result[field] = cleanSpaces(current.join(' '))
      current = []
      num++
    }
    current = current.concat(words)
  }
  const field = getField(num)
  result[field] = cleanSpaces(current.join(' '))
  return result
}

module.exports = {

  async save(collection, data) {
    try {
      /*console.log('contenidos.save', collection, {
        ...data,
        texto: '...'
      }) */

      const textfields = split_text(data.texto)

      const toSave = {
        ...textfields,
        coleccion: collection,
        idref: data.id,
        slugref: data.slug || null,
        tipo: '',
        formato: 'web',
        titulo: data.titulo || data.titular || data.nombre || data.nombreSimbolico || data.username,
        descripcion: data.descripcion || '',
      }

      if (collection === 'audios') {
        toSave.tipo = 'audios'
        toSave.extra = data.categoria
      }
      if (collection === 'blogs') {
        toSave.tipo = 'artículos'
      }
      if (collection === 'centros') {
        toSave.tipo = 'organización'
        toSave.extra = data.categoria
      }
      if (collection === 'comunicados') {
        toSave.tipo = 'documentos'
        toSave.extra = data.numero
        // console.log('guardaremos', toSave)
      }
      if (collection === 'contactos') {
        if (data.usuario) {
          toSave.tipo = 'personas'
          const resultados = await strapi.connections.default.raw(`SELECT * FROM \`users-permissions_user\` WHERE id=${idy(data.usuario)}`)
          const usuario = resultados[0][0]
          if (usuario) {
            // console.log('usuario', usuario)
            toSave.titulo = usuario.nombreSimbolico || usuario.username
            toSave.extra = usuario.correo
          }
        }
        if (data.centro) {
          toSave.tipo = 'organización'
          let resultados = await strapi.connections.default.raw(`SELECT * FROM centros WHERE id=${idy(data.centro)}`)
          const centro = resultados[0][0]
          if (centro) {
            toSave.titulo = centro.nombre
            // console.log('centro', centro)
            if (centro.equipo) {
              resultados = await strapi.connections.default.raw(`SELECT * FROM equipos WHERE id=${idy(centro.equipo)}`)
              const equipo = resultados[0][0]
              if (equipo)
                toSave.extra = equipo.nombre
            }
          }
        }
        let pais = 'España'
        let code = data.pais.toUpperCase()
        const countries = require('./countries.js')
        let found = countries.findIndex(x => x.code === code)
        if (found >= 0) pais = countries[found].label
        toSave.descripcion = data.direccion1 + ' ' + data.direccion2 + ' ' + data.poblacion + ' ' + data.provincia + ' ' + pais
        toSave.descripcion = toSave.descripcion.replace(/\bnull\b/, '')
        // console.log('data', data)
        // console.log('Guardaremos', toSave)
      }
      if (collection === 'entradas') {
        toSave.tipo = 'artículos'
        const [blog] = await strapi.connections.default.raw(`SELECT * FROM blogs WHERE id=${idy(data.blog)}`)
        // console.log('blog', blog)
        toSave.extra = blog.nombre
        //console.log('Guardaremos', toSave)
      }
      if (collection === 'equipos') {
        toSave.tipo = 'organización'
      }
      if (collection === 'eventos') {
        toSave.tipo = 'actividades'
      }
      if (collection === 'guias') {
        toSave.tipo = 'personas'
        toSave.extra = data.subtitulo
      }
      if (collection === 'libros') {
        toSave.tipo = 'documentos'
      }
      if (collection === 'normativas') {
        toSave.tipo = 'organización'
      }
      if (collection === 'noticias') {
        toSave.tipo = 'artículos'
      }
      if (collection === 'paginas') {
        toSave.tipo = 'organización'
      }
      if (collection === 'redes') {
        toSave.tipo = 'organización'
      }
      if (collection === 'salas') {
        toSave.tipo = 'organización'
      }
      if (collection === 'usuarios') {
        toSave.tipo = 'personas'
        toSave.extra = data.username
      }

      // MEDIA, ARCHIVOS Y CARPETAS
      if (collection === 'media') {
        toSave.extra = data.url
      }
      if (collection === 'archivos') {
        if (data.carpeta) {
          const resultados = await strapi.connections.default.raw(`SELECT * FROM \`carpetas\` WHERE id=${idy(data.carpeta)}`)
          const carpeta = resultados[0][0]
          if (carpeta) {
            toSave.extra = carpeta.ruta
            toSave.texto = carpeta.descripcion
          }
        }
      }
      if (collection === 'carpetas') {
        toSave.tipo = 'documentos'
        toSave.extra = data.ruta
      }
      if (collection === 'media' || collection === 'archivos') {
        let url = data.url ? data.url : data.nombre
        url = url.toLowerCase()
        toSave.tipo =
          url.match(/\.(mp3|wav|m4a|mp4|flac|wma|aac|3ga|amr|aiff|ape|asf|asx|cda|dvf|gp4|gp5|gpx|m4b|midi|pcm|snd)$/) ? 'audios' :
          url.match(/\.(docx?|pdf|pptx?|odf|odt)$/) ? 'documentos' :
          url.match(/\.(jpe?g|png|webp|gif|pcx)$/) ? 'imágenes' :
          'varios'
      }

      // comprobamos si el contenido ya existe
      let [contenido] = await strapi.services.contenidos.find({
        idref: data.id,
        coleccion: collection
      });
      // console.log(contenido ? 'existe ya el contenido id=' + contenido.id + '' + contenido.coleccion : 'no existia')

      // si no existe lo creamos, y si no, lo actualizamos
      if (!contenido)
        await strapi.services.contenidos.create(toSave)
      else
        await strapi.services.contenidos.update({
          id: contenido.id
        }, toSave)

    } catch (err) {
      console.log(err)
    }
  },

  async delete(collection, id) {
    console.log('contenidos.delete', collection, id)

    console.log('probamos a borrar directamente')
    let result = await strapi.services.contenidos.delete({
      coleccion: collection,
      idRef: id
    })
    console.log('resultado', result)

    console.log('borramos en 2 pasos')
    /*let [entry] = await strapi.services.contenidos.find({
      idref: id,
      coleccion: collection
    });
    console.log(entry)
    if (entry)
      await strapi.services.contenidos.delete({id:entry.id}) */
  },


  // reconstruye todo el índice (según tipo de contenido o todos)
  async rebuild(collection) {
    console.log('rebuild', collection)

    const filterAll = {
      _limit: -1
    }

    
    // primero eliminamos los contenidos de la colección selecionada (o todos si no se indica colección)
    const contenidos = await strapi.services.contenidos.find(collection ? {
      ...filterAll,
      coleccion: collection
    } : filterAll)
    // console.log('found', contenidos.length, 'contenidos')

    for (const contenido of contenidos){
      // console.log('delete contenido', contenido)
      const result = await strapi.services.contenidos.delete({id:contenido.id})
      // console.log('result', result)
    }

    // recorremos todas las colecciones o solo la colección indicada
     let collections = collection ? [collection] : todas_las_colecciones
    for (const collection of collections) {
      let entries
      if (collection === 'usuarios')
        entries = await strapi.plugins['users-permissions'].services.user.fetchAll()
      else
        entries = await strapi.services[collection].find(filterAll)
      for (const entry of entries) {
        this.save(collection, entry)
      }
    } 

    // await strapi.connections.default.raw(`TRUNCATE contenidos`)
    // to do: MEDIA  ?
    /* 
    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion, texto, extra)
    SELECT 'media', id, '', 'archivos', ext, uf.name, caption, alternativeText, url 
    FROM upload_file uf`)
    */

  }

}
