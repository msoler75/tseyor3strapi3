'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {

  meilisearch: {
    settings: {
      distinctAttribute: null,
      searchableAttributes: ['titulo', 'descripcion', 'slug', 'etiquetas'],
      filterableAttributes: ['etiquetas'],
      displayedAttributes: ['titulo', 'descripcion', 'imagen', 'slug', 'etiquetas'],
      sortableAttributes: ['fecha']
    },
    transformEntry({
      entry
    }) {
      return {
        ...entry,
        etiquetas: entry.etiquetas.map(x => x.nombre), // map categories to only have categories name.
      }
    },
  }

};
