const likesservices = require('../../../libs/likeslib/services.js')

module.exports = {
  /**
   * Promise to edit record
   *
   * @return {Promise}
   */

  async like(params, userId) {
      return likesservices.like('comentarios', params, userId)
  },


  
  async dislike(params, userId) {
    return likesservices.dislike('comentarios', params, userId)
  },

};
 