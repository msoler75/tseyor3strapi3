'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const contenidos = require('../../../libs/contenidoslib/contenidos.js')

module.exports = {
  async rebuild() {
    contenidos.rebuild()
  }
};
