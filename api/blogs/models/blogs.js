'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    meilisearch: {
        settings: {
            filterableAttributes: [],
            distinctAttribute: null,
            searchableAttributes: ['nombre', 'descripcion', 'slug']
        }
      },
};
