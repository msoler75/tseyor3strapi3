'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {

  meilisearch: {
    settings: {
      filterableAttributes: ['coleccion', 'tipo', 'formato'],
      distinctAttribute: null,
      searchableAttributes: ['titulo', 'slugref', 'tipo', 'formato', 'descripcion', 'texto', 'texto2', 'texto3', 'texto4', 'texto5', 'texto6', 'texto7', 'texto8', 'texto9', 'texto10', 'extra'],
      displayedAttributes: ['titulo', 'coleccion', 'idref', 'slugref', 'tipo', 'formato', 'extra']
    }
  },

};
