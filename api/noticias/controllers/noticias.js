const likescontroller = require('../../likeslib/controllers.js')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

      // https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#controllers

    async like(ctx) {
        return likescontroller.like('noticias', ctx)
    },
  
  
    
    async dislike(ctx) {
      return likescontroller.dislike('noticias', ctx)
    },

};
