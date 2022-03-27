const index_file = './../../comunicadosIndex.json'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

'use strict';
const Fuse = require('fuse.js');

// const fs = require('fs');
/* const {
  stringify
} = require('querystring');
*/

module.exports = {
  async fuzzySearch(ctx) {

    const searchTerm = ctx.query._q;
    strapi.log.debug('fuzzy', searchTerm)

    const fuseOptions = {
      keys: ['slug', 'titulo', 'texto'],
      distance: 256,
      includeScore: true
    }

    let indexComunicados = null
    /* try {
      const data = fs.readFileSync(index_file, 'utf8')
      indexComunicados = JSON.parse(data)
      strapi.log.debug('[cache] fuseIndex Comunicados')
    } catch (err) {

    } */

    // obtenemos todos los comunicados de la base de datos
    const comunicados = await strapi.services.comunicados.find({
      _limit: -1
    });

    // si el fichero no existe, creamos el índice
    if (!indexComunicados) {

      // Create the Fuse index
      indexComunicados = Fuse.createIndex(fuseOptions.keys, comunicados)

      /* 
      try {
        fs.writeFileSync(index_file, JSON.stringify(indexComunicados))
      } catch (err) {
        strapi.log.debug(err)
      } */
    }


    const fuse = new Fuse(comunicados, fuseOptions, indexComunicados);

    const resultados = fuse.search(searchTerm);
    strapi.log.debug('got ', resultados.length, 'results')
    return resultados.map(x => ({
      id: x.item.id,
      slug: x.item.slug,
      titulo: x.item.titulo,
      descripcion: x.item.descripcion,
      updated_at: x.item.updated_at,
      imagen: x.item.imagen,
      score: x.score,
      refIndex: x.refIndex
    }));
  }
};
