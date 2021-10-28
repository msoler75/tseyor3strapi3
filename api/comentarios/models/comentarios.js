'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    // Called before an entry is created
    beforeCreate (data) {
      if (!data.autor && !data.nombre)
        throw strapi.errors.badRequest('must be defined')
    }
  }
}
