'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async find(ctx) {
        /* let entities;
        if (ctx.query._q) {
          entities = await strapi.services.noticias.search(ctx.query);
        } else {
          entities = await strapi.services.noticias.find(ctx.query);
        } */
        const offset = ctx.query._start || 0
        const limit = ctx.query._limit || 20
        const tipo = ctx.query._tipo || null
        const updated_at = ctx.query._upd

        const cdescripcion = {
            entradas: 'substring(texto, 0, 1024) AS descripcion',
        }

        const ctitulo = {
            noticias: 'titular'
        }

        const sql = tipo ?
        `
        SELECT ${tipo}.id, slug, ${ctitulo[tipo] || 'titulo'}, ${cdescripcion[tipo] || 'descripcion'}, ${tipo}.updated_at, "${tipo}" AS tipo, uf.url as imagen, uf.width, uf.height FROM ${tipo} 
        JOIN upload_file_morph ufm ON related_id=${tipo}.id AND related_type="${tipo}" AND field="imagen"
        JOIN upload_file uf ON upload_file_id=uf.id
        ${updated_at?"WHERE "+tipo+".updated_at<'"+updated_at+"'":""}
        ORDER BY updated_at DESC
        LIMIT ${limit}
        `
        :
        `
        SELECT entradas.id, slug, ${ctitulo['entradas'] || 'titulo'}, ${cdescripcion['entradas'] || 'descripcion'}, entradas.updated_at, "entradas" AS tipo, uf.url as imagen, uf.width, uf.height  FROM entradas 
            JOIN upload_file_morph ufm ON related_id=entradas.id AND related_type="entradas" AND field="imagen"
            JOIN upload_file uf ON upload_file_id=uf.id
        UNION
        SELECT noticias.id, slug, ${ctitulo['noticias'] || 'titulo'}, ${cdescripcion['noticias'] || 'descripcion'}, noticias.updated_at, "noticias" AS tipo, uf.url as imagen, uf.width, uf.height FROM noticias 
            JOIN upload_file_morph ufm ON related_id=noticias.id AND related_type="noticias" AND field="imagen"
            JOIN upload_file uf ON upload_file_id=uf.id
        UNION
        SELECT comunicados.id, slug, ${ctitulo['comunicados'] || 'titulo'}, ${cdescripcion['comunicados'] || 'descripcion'}, comunicados.updated_at, "comunicados" AS tipo, uf.url as imagen, uf.width, uf.height  FROM comunicados 
            JOIN upload_file_morph ufm ON related_id=comunicados.id AND related_type="comunicados" AND field="imagen"
            JOIN upload_file uf ON upload_file_id=uf.id
        UNION
        SELECT eventos.id, slug, ${ctitulo['eventos'] || 'titulo'}, ${cdescripcion['eventos'] || 'descripcion'}, eventos.updated_at, "eventos" AS tipo, uf.url as imagen, uf.width, uf.height  FROM eventos 
            JOIN upload_file_morph ufm ON related_id=eventos.id AND related_type="eventos" AND field="imagen"
            JOIN upload_file uf ON upload_file_id=uf.id
        UNION
        SELECT libros.id, slug, ${ctitulo['libros'] || 'titulo'}, ${cdescripcion['libros'] || 'descripcion'}, libros.updated_at, "libros" AS tipo, uf.url as imagen, uf.width, uf.height  FROM libros 
            JOIN upload_file_morph ufm ON related_id=libros.id AND related_type="libros" AND field="imagen"
            JOIN upload_file uf ON upload_file_id=uf.id
        ORDER BY updated_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
        `
        console.log(sql)
        const r = await strapi.connections.default.raw(sql)
    
        return r[0] // .map(entity => sanitizeEntity(entity, { model: strapi.models.noticias }));
      },
};
