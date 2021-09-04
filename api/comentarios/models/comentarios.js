'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {

    lifecycles: {

        // Called when entry is created
        async beforeCreate(data) {
            console.log('beforeCreate', data)
            //data 
            //await saveImagenes(data)
            // console.log(data)
        },
      },


};
