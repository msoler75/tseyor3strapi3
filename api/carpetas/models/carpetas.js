'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const slugify = require('slugify')

async function detectCycle (data, id) {
  if (!data.subcarpetas && id) {
    const curdata = await strapi.services.carpetas.findOne({ id })
    data.subcarpetas = curdata.subcarpetas
  }
  const ids = []
  const next = []
  if (data.padre) ids.push(data.padre.id?data.padre.id:data.padre)
  if (id && ids.includes(id)) return true // caso raro
  if (id) ids.push(id)
  let current = data
  while (current) {
    for (const carpeta of current.subcarpetas) {
      const id = carpeta.id ? carpeta.id : carpeta
      if (ids.includes(id)) return true
      ids.push(id)
    }
    current = null
    while (
      next.length &&
      !(current = await strapi.services.carpetas.findOne({ id: next.shift() }))
    );
  }
  return false
}

module.exports = {
  /**
   * Triggered before user creation.
   */
  lifecycles: {
    async beforeCreate (data) {
      data.slug = slugify(data.nombre, { lower: true })
      // comprobamos la no circularidad infinita de carpetas
      if (await detectCycle(data)) {
        data.padre = null
        data.subcarpetas = []
      }

      let padreid = data.padre
      let rutaPadre = ''
      if (padreid) {
        const padre = await strapi.services.carpetas.findOne({ id: padreid })
        rutaPadre = padre ? padre.ruta : ''
      }
      data.ruta = rutaPadre + '/' + data.slug
    },

    async afterCreate (result, data) {
      for (const carpeta of result.subcarpetas)
        await strapi.services.carpetas.update(
          { id: carpeta.id },
          { slug: carpeta.slug, padre: result }
        )
    },

    async beforeUpdate (params, data) {
      const id = typeof params.id === 'string' ? parseInt(params.id):params.id
      console.log('beforeUpdate', params, data)
      if ('nombre' in data) 
      {
          data.slug = slugify(data.nombre, { lower: true })
          console.log('slug', data.slug)
      }
      // evitamos la modificación manual de la ruta
      if ('ruta' in data) delete data.ruta
      // si cambia alguno de estos valores...
      if ('slug' in data || 'padre' in data) {
        // comprobamos la no circularidad infinita de carpetas
        if (await detectCycle(data, id)) {
          data.padre = null
          data.subcarpetas = []
        }

        // recalcularemos ruta de esta carpeta
        let data2 =
          'padre' in data && 'subcarpetas' in data
            ? data
            : (await strapi.services.carpetas.findOne({ id })) ||
              (await strapi.services.carpetas.findOne({
                id,
                _publicationState: 'preview'
              }))
        console.log('data2', data2)
        if (data2) {
          let rutaPadre = ''
          let padre = data.padre? data.padre : data2.padre
          console.log('padre', padre)
          if (padre) {
            const isObj = typeof padre === 'object'
            let padreid = isObj ? padre.id : padre
            padre = isObj
              ? padre
              : (await strapi.services.carpetas.findOne({ id: padreid })) ||
                (await strapi.services.carpetas.findOne({
                  id: padreid,
                  _publicationState: 'preview'
                }))
            rutaPadre = padre ? padre.ruta : ''
          }
          data.ruta = rutaPadre + '/' + data.slug
          console.log('data.ruta', data.ruta)
        }
        
        console.log('data', data)

        if(!('subcarpetas' in data))
            data.subcarpetas = data2.subcarpetas

        console.log('data*', data)
        
        // llamamos a todas las subcarpetas y activamos update (data: padre) para que se auto modifiquen su ruta en beforeUpdate
        for (let carpeta of data.subcarpetas)
        {
            console.log('actualizar subcarpeta', carpeta)
            if(typeof carpeta !== 'object')
                carpeta = await strapi.services.carpetas.findOne({id: carpeta})
            console.log('actualizar subcarpeta', carpeta)
            await strapi.services.carpetas.update(
                { id: carpeta.id?carpeta.id:carpeta },
                { slug: carpeta.slug, padre: {...data, id} }
                )
        }

        // if(data.padre) data.padre = data.padre.id?data.padre.id:data.padre
        // if('subcarpetas' in data) data.subcarpetas = data.subcarpetas.map(x=>x.id)
      }
    },


    async afterUpdate (result, params, data) {
        console.log('afterUpdate', result, params, data)
      // si cambia alguno de estos valores...
      // if ('slug' in data || 'padre' in data) {
        
      //}
    }
  }
}
