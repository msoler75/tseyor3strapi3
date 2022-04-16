'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */


 const {idy} = require('./../../../libs/utils')
 const {makeid, encrypt, especificos} = require('../../../libs/suscripciones')


module.exports = {

  /* Al crear una suscripción se crea un código secreto */
  lifecycles: {
    async beforeCreate(data) {
      let userid = idy(data.usuario)
      data.usuario = userid
      if (userid) {
        let [suscripcion] = await strapi.services.suscripciones.find({
          'usuario.id': userid
        })
        if (suscripcion)
          throw strapi.errors.badRequest(
            'Ya tiene un registro de suscripciones'
          )
      }
      if (!userid && !data.correo)
        throw strapi.errors.badRequest(
          'Necesita al menos un correo electrónico'
        )
      data.secreto = makeid(16)
      if(!userid)
      {
        data.published_at = null 
        // generamos un código hash que tiene codificado el correo y el código secreto
        data.hash = JSON.stringify(encrypt(JSON.stringify({correo: data.correo, secreto: data.secreto})))
      }
    },


    async beforeUpdate(params, data) {
      if('usuario' in data)
      {
        let userid = idy(data.usuario)
        data.usuario = userid
      }
      for(const coleccion of especificos) {
        if(coleccion in data)
          data[coleccion]=data[coleccion].map(x=>idy(x))
      }
    }
  }

}
