'use strict';

const { sanitizeEntity } = require('strapi-utils');

/*

Funcionamiento de suscripción:

- para usuarios registrados: si el usuario registrado está validado (con el correo electrónico) se suscribe y desuscribe libremente

- para usuarios no registrados: 
    - el usuario debe especificar una dirección de correo.
    - al crear la suscripción (en model) se crea un código secreto
    - también se crea un hash encriptado que contiene el correo y el código secreto
    - al crear la suscripción se dispara el webhook de creación
    - en n8n se recibe el webhook, se detecta que es una nueva suscripción con hash
    - el n8n manda un correo de validación al usuario
    - el usuario recibe en su correo el mensaje de validación y hace click en el enlace
    - ese enlace le lleva a la página del frontend de suscripciones
    - en frontend se detecta que es una validación y llama a la api /suscripciones/validate/:hash
    - se valida con el hash, desencriptando y parseando el objeto para obtener el correo y el secreto
    - se comprueba si el código secreto coincide

Importante: 

Una suscripción está aprobada (validada) si está publicada (con el campo published_at rellenado)

*/



/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

// const {idy} = require('./../../../libs/utils')
const {
  makeid,
  generales,
  especificos,
  decrypt
} = require('./../../../libs/suscripcioneslib/suscripciones')


module.exports = {

  async my(ctx) {
    console.log('my', ctx.request.body)
    let {correo, codigo, usuario} = ctx.request.body
    console.log('correo', correo, 'codigo', codigo, 'usuario', usuario)
    let [entity] = await strapi.services.suscripciones.find(correo?{correo, secreto:codigo}:{usuario})
    console.log(entity)
    if(!entity)
      return ctx.notFound()
    delete entity.hash
    return sanitizeEntity(entity, { model: strapi.models.suscripciones });
  },

  /* Valida la clave secreta */
  async validate(ctx) {
    let {
      hash
    } = ctx.params

    try {

      if (!hash)
        return ctx.badRequest('Debe especificar el hash')

      const str = decrypt(JSON.parse(hash))
      let {
        correo,
        secreto
      } = JSON.parse(str)

      if (!correo || !secreto)
        return ctx.badRequest('Datos no válidos')

      console.log('correo', correo, 'secreto', secreto)

      let [suscripcion] = await strapi.services.suscripciones.find({
        correo,
        secreto,
        _publicationState: 'preview',  // 'preview' es para publicados y borradores
        published_at_null: true // no ha sido publicado
      })

      if (!suscripcion)
        return ctx.badRequest('Enlace caducado')

      console.log('suscripcion', suscripcion)

      const [suscripcionMaster] = await strapi.services.suscripciones.find({
        correo
      })

      if (suscripcionMaster) {
        console.log('tiene suscripción anterior validada', suscripcionMaster)

        // agrupamos la suscripción del mismo correo electrónico
        for (const collection of generales) {
          suscripcionMaster[collection] = suscripcionMaster[collection] || suscripcion[collection]
        }
        for (const collection of especificos) {
          suscripcionMaster[collection] = suscripcionMaster[collection].concat(suscripcion[collection])
        }
        const result = await strapi.services.suscripciones.update(suscripcionMaster.id, suscripcionMaster)
        await strapi.services.suscripciones.delete({
          id: suscripcion.id
        })
        console.log('result', result)
        return result
      }

      return await strapi.services.suscripciones.update({
        id: suscripcion.id
      }, {
        published_at: new Date().toISOString(),
        // hash: ''
      })
    } catch (err) {
      console.log(err)
      ctx.badRequest('Validación incorrecta')
    }
    return null
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
      return ctx.badRequest(`Debe especificar la coleccion`)

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
    } else {
      if (!id) ctx.badRequest(`Debe especificar el id`)
      let params = {}
      params[coleccion] = id
      let lista = await strapi.services.suscripciones.find(params)
      return lista

    }

  }


};
