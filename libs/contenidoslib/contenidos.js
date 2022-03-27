module.exports = {

  async save(collection, data) {
    console.log('contenidos.save', collection, data.id)

    let texto = data.texto

    const toSave = {
      coleccion: collection,
      idRef: data.id,
      slugRef: data.slug || null,
      tipo: data.tipoContenido || 'web',
      formato: data.formato || '',
      titulo: data.title || data.titular || data.nombre,
      descripcion: data.descripcion || '',
      texto: texto
    }

    let [contenido] = await strapi.services.contenidos.find({
      idref: data.id,
      coleccion: collection
    });
    console.log(contenido ? 'existe ya el contenido id=' + contenido.id + '' + contenido.coleccion : 'no existia')

    if (!contenido)
      await strapi.services.contenidos.create(toSave)
    else
      await strapi.services.contenidos.update({
        id: contenido.id
      }, toSave)

  },

  async delete(collection, id) {
    // data.texto = 'texto--'
    console.log('contenidos.delete', collection, id)

    await strapi.services.contenidos.delete(id)
    //const { id } = ctx.params;

    //const userId = ctx.state.user?ctx.state.user.id:0;

    //let entity = await strapi.services[collection].dislike({ id }, userId);

    //return sanitizeEntity(entity, { model: strapi.models[collection] });
  },

  async rebuild() {

    await strapi.connections.default.raw(`TRUNCATE contenidos`)


    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, tipo, formato, titulo, descripcion, extra)
                                          SELECT 'audios', id, 'audios', 'web', titulo, descripcion, categoria 
                                          FROM audios`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion)
                                          SELECT 'blogs', id, slug, 'artículos', 'web', nombre, descripcion 
                                          FROM blogs`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion)
                                          SELECT 'centros', id, slug, 'organización', 'web', nombre, descripcion 
                                          FROM centros`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion, texto)
                                          SELECT 'comunicados', id, slug, 'documentos', 'web', titulo, descripcion, texto 
                                          FROM comunicados`)
                                          // ADVERTENCIAS

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion)
                                          SELECT 'contactos', contactos.id, '', 'personas', 'web', CONCAT(username, ' ', nombreSimbolico), CONCAT (direccion1, ' ', direccion2, ' ' , poblacion, ' ', provincia, ' ', pais, correo) 
                                          FROM contactos
                                          JOIN \`users-permissions_user\` user ON user.id=contactos.usuario`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion, texto, extra)
                                          SELECT 'entradas', entradas.id, entradas.slug, 'artículos', 'web', titulo, descripcion, entradas.texto, blogs.nombre 
                                          FROM entradas
                                          JOIN blogs ON blogs.id = entradas.blog`)

    await strapi.connections.default.raw(`INSERT INTO equipos (coleccion, idref, slugref, tipo, formato, titulo, descripcion)
                                          SELECT 'equipos', id, slug, 'equipos', 'web', nombre, descripcion 
                                          FROM equipos`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion, extra)
                                          SELECT 'guias', id, slug, 'personas', 'web', nombre, descripcion, subtitulo 
                                          FROM guias`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion, extra)
                                          SELECT 'libros', id, slug, 'documentos', 'web', titulo, descripcion, categoria
                                          FROM libros`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion)
                                          SELECT 'normativas', id, slug, 'organización', 'web', titulo, descripcion 
                                          FROM normativas`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion, texto)
                                          SELECT 'noticias', id, slug, 'artículos', 'web', titular, descripcion, texto
                                          FROM noticias`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion, texto)
                                          SELECT 'paginas', id, slug, 'organización', 'web', titulo, descripcion, texto
                                          FROM paginas`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo)
                                          SELECT 'redes', id, '', 'organización', 'web', titulo
                                          FROM redes`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion)
                                          SELECT 'salas', id, '', 'organización', 'web', nombre, descripcion
                                          FROM salas`)

    await strapi.connections.default.raw(`INSERT INTO contenidos (coleccion, idref, slugref, tipo, formato, titulo, descripcion, texto, extra)
                                          SELECT 'media', id, '', 'archivos', ext, uf.name, caption, alternativeText, url 
                                          FROM upload_file uf`)

  }

}
