const likescontroller = require('../../likeslib/controllers.js')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

      // https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#controllers

      async find(ctx) {
        const userid = ctx.state.user?ctx.state.user.id:0
        console.log('noticias.find userid', userid)
        return []
      },

    async like(ctx) {
        return likescontroller.like('noticias', ctx)
    },
  
  
    
    async dislike(ctx) {
      return likescontroller.dislike('noticias', ctx)
    },

};
