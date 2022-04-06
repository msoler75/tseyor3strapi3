'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

// const {idy} = require('./../../../libs/utils')
const {
  makeid,
  generales
} = require('./../../../libs/suscripcioneslib/suscripciones')


module.exports = {

  async validate(ctx) {
    let {
      email
    } = ctx.params
    let secreto = ctx.query.secreto

    const [suscripcion] = await strapi.services.suscripciones.find({
      correo: email,
      secreto
    })

    if (!suscripcion) {
      return ctx.unauthorized(`No existe suscripción`)
    }

    return suscripcion
  },

  async resetSecret(ctx) {
    let {
      id
    } = ctx.params
    return await strapi.services.suscripciones.update({
      id
    }, {
      secreto: makeid(16)
    })
  },

  async list(ctx) {
    let {
      coleccion
    } = ctx.params
    let {
      id
    } = ctx.query

    if (!coleccion)
      return ctx.notFound(`Debe especificar la coleccion`)

    if (generales.includes(coleccion)) {
      let params = {}
      params[coleccion] = 1
      // es una colección de tipo general
      let lista = await strapi.services.suscripciones.find(params)
      const registrados = []
      const visitantes = []
      lista.forEach(x => {
        if (x.usuario) {
          registrados.push(x.usuario.email)
        } else
          visitantes.push({
            correo: x.correo,
            secreto: x.secreto
          })
      })
      return {
        registrados,
        visitantes
      }
    }

  }


};
