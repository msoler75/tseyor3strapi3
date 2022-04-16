'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const collection = 'carpetas'
const contenidos = require('../../../libs/contenidos.js')
const {
  idy,
  normalizarTitulo
} = require('../../../libs/utils.js')
const slugify = require('slugify')

const dameArchivo = async params => {
  return (
    // (await strapi.services.archivos.findOne(params)) ||
    (await strapi.services.archivos.findOne({
      ...params,
      _publicationState: 'preview' // devuelve borradores y publicados
    }))
  )
}

const dameCarpeta = async params => {
  return (
    // (await strapi.services.carpetas.findOne(params)) ||
    (await strapi.services.carpetas.findOne({
      ...params,
      _publicationState: 'preview'
    }))
  )
}

async function detectCycle(data, id, orig) {
  if (!id && !data.subcarpetas) return false
  if (!data.subcarpetas && id) {
    if (!orig) orig = await dameCarpeta({
      id
    })
    data.subcarpetas = orig.subcarpetas
  }
  const ids = []
  const next = []
  if (data.padre) ids.push(idy(data.padre))
  if (id && ids.includes(id)) return true // caso raro
  if (id) ids.push(id)
  let current = data
  if (id && (!current.subcarpetas || typeof current.subcarpetas !== 'object'))
    current = orig
  if (!current) current = await dameCarpeta({
    id
  })
  while (current) {
    for (const carpeta of current.subcarpetas) {
      const id = idy(carpeta)
      next.push(id)
      if (ids.includes(id)) return true
      ids.push(id)
    }
    current = null
    while (next.length && !(current = await dameCarpeta({
        id: next.shift()
      })));
  }
  return false
}

async function eliminarContenidosCarpeta(carpeta) {
  console.log('borrada carpeta (it)', carpeta.id, carpeta.nombre, carpeta.ruta)
  console.log('vamos a borrar sus subcarpetas:', carpeta.subcarpetas)
  for (const subcarpeta of carpeta.subcarpetas) {
    console.log(
      'borraremos subcarpeta',
      subcarpeta.id,
      subcarpeta.nombre,
      subcarpeta.ruta
    )
    await strapi.services.carpetas.delete({
      id: subcarpeta.id
    })
  }
  for (const archivo of carpeta.archivos) {
    console.log('borraremos archivo', archivo.id, archivo.nombre, archivo.ruta)
    await strapi.services.archivos.delete({
      id: archivo.id
    })
  }
}

async function damePermisos() {
  const sql = `SELECT id, ruta FROM permisos ORDER BY ruta DESC`
  const knex = strapi.connections.default
  const permisos = await knex.raw(sql)
  return permisos[0].map(x => ({
    id: x.id,
    ruta: x.ruta.toLowerCase()
  }))
}

async function permisosRuta(ruta) {
  const permisos = await damePermisos()
  ruta = ruta.toLowerCase()
  for (const p of permisos) {
    if (ruta.indexOf(p.ruta) === 0) {
      console.log('permisos de ruta', p.ruta)
      return p.id
    }
  }
  return null
}

const isIterable = value => {
  return Symbol.iterator in Object(value)
}


function changedPadre(orig, data) {
  return idy(orig.padre) !== idy(data.padre)
}

function changedDirs(orig, data) {
  if (changedPadre(orig, data)) return true
  const f1 = orig.subcarpetas ? orig.subcarpetas.map(x => idy(x)) : []
  const f2 = data.subcarpetas ? data.subcarpetas.map(x => idy(x)) : []
  if (f1.length !== f2.length) return true
  for (const id of f1)
    if (!f2.includes(id)) return true
  // ningun cambio
  return false
}

function changedArchivos(orig, data) {
  const a1 = orig.archivos ? orig.archivos.map(x => idy(x)) : []
  const a2 = data.archivos ? data.archivos.map(x => idy(x)) : []
  if (a1.length !== a2.length) return true
  for (const id of a1)
    if (!a2.includes(id)) return true
  // ningun cambio
  return false
}

module.exports = {
  /**
   * Triggered before user creation.
   */
  lifecycles: {
    async beforeCreate(data) {
      data.slug = slugify(data.nombre, {
        lower: true
      })
      // comprobamos la no circularidad infinita de carpetas
      if (await detectCycle(data))
        throw strapi.errors.badRequest('No se puede crear una carpeta cíclica')
      // no se admite creación de carpetas con archivos ya definidos
      data.archivos = []

      let padreid = data.padre
      let rutaPadre = ''
      if (padreid) {
        const padre = await dameCarpeta({
          id: padreid
        }).catch(e => {
          console.warn(JSON.stringify(e))
        })
        rutaPadre = padre ? padre.ruta : ''
      }
      data.ruta = rutaPadre + '/' + data.slug
      // instauramos los permiso de esta carpeta
      data.permisos = await permisosRuta(data.ruta)
      data.nombre = normalizarTitulo(data.nombre)
    },

    async afterCreate(result, data) {
      console.log('afterCreate', collection, result)
      await contenidos.save(collection, result)
      // carpeta things:
      for (const carpeta of result.subcarpetas)
        await strapi.services.carpetas.update({
          id: carpeta.id
        }, {
          slug: carpeta.slug,
          padre: result
        })
    },

    async beforeUpdate(params, data) {
      const id = typeof params.id === 'string' ? parseInt(params.id) : params.id
      console.log('carpetas.beforeUpdate', params, data)
      if ('nombre' in data) {
        data.slug = slugify(data.nombre, {
          lower: true
        })
        console.log('slug', data.slug)
      }

      const orig = await dameCarpeta({
        id
      })


      // no se pueden asignar archivos mediante la carpeta
      if ('archivos' in data && changedArchivos(orig, data))
        throw strapi.errors.badRequest(
          'No se pueden asignar o cambiar archivos desde aquí'
        )

      // evitamos la modificación manual de la ruta
      if ('ruta' in data) delete data.ruta
      // si cambia alguno de estos valores...
      if ('slug' in data || 'padre' in data || 'subcarpetas' in data || 'soloSuperAdmin' in data) {

        if (!('nombre' in data)) data.nombre = orig.nombre
        if (!('subcarpetas' in data)) data.subcarpetas = orig.subcarpetas
        if (!('padre' in data)) data.padre = orig.padre
        data.slug = slugify(data.nombre, {
          lower: true
        })
        console.log('data+orig', data)

        if (changedDirs(orig, data)) {
          // solo revisaremos si ha habido cambios en carpeta padre o subcarpetas
          if (await detectCycle(data, id)) {
            throw strapi.errors.badRequest(
              'No se puede ubicar una carpeta cíclica'
            )
          }


          //if(changedPadre(orig, data))
          //data.soloSuperAdmin = padre?padre.soloSuperAdmin:data.soloSuperAdmin

          // recalcularemos ruta de esta carpeta
          let rutaPadre = ''
          let padre = data.padre
          console.log('padre', padre)
          if (padre) {
            const isObj = typeof padre === 'object'
            let padreid = isObj ? padre.id : padre
            padre = isObj ? padre : await dameCarpeta({
              id: padreid
            })
            // if('padre' in data)
            rutaPadre = padre ? padre.ruta : ''
          }
          data.ruta = rutaPadre + '/' + data.slug
          console.log('data.ruta', data.ruta)

          // instauramos los permiso de esta carpeta
          data.permisos = await permisosRuta(data.ruta)

          // llamamos a todas las subcarpetas y activamos update (data: padre) para que se auto modifiquen su ruta en beforeUpdate
          for (let carpeta of data.subcarpetas) {
            // console.log('actualizar subcarpeta', carpeta)
            if (typeof carpeta !== 'object')
              carpeta = await dameCarpeta({
                id: carpeta
              })
            console.log('actualizar subcarpeta', carpeta.ruta)
            const save = {
              slug: carpeta.slug,
              padre: {
                ...data,
                id
              }
            }
            // si protegemos una carpeta, protegemos todas sus subcarpetas
            if (data.soloSuperAdmin) {
              console.log('protegemos subcarpeta', carpeta.ruta)
              save.soloSuperAdmin = 1
            }
            await strapi.services.carpetas.update({
                id: idy(carpeta)
              },
              save
            )
          }
          // actualizamos solo la protección de subcarpetas
        } else if (data.soloSuperAdmin) {
          for (let carpeta of data.subcarpetas) {
            console.log('protegemos subcarpeta', carpeta.ruta)
            await strapi.services.carpetas.update({
              id: idy(carpeta)
            }, {
              soloSuperAdmin: 1
            })
          }

        }

        // if(data.padre) data.padre = data.padre.id?data.padre.id:data.padre
        // if('subcarpetas' in data) data.subcarpetas = data.subcarpetas.map(x=>x.id)
      }

      // si hay algún cambio en soloSuperAdmin...
      if (
        ('soloSuperAdmin' in data &&
          orig.soloSuperAdmin !== data.soloSuperAdmin)
      ) {
        if (!('archivos' in data)) data.archivos = orig.archivos
        for (const archivo of data.archivos) {
          await strapi.services.archivos.update({
            id: idy(archivo)
          }, {
            soloSuperAdmin: data.soloSuperAdmin
          })
        }
      }

      data.nombre = normalizarTitulo(data.nombre)
    },

    async afterUpdate(result, params, data) {
      console.log('afterUpdate', collection, result)
      await contenidos.save(collection, result)
      // si cambia el permiso especial de soloSuperAdmin... lo actualizamos en todos los archivos
      // ??
    },

    async beforeDelete(params) {
      console.log('carpetas.beforeDelete')
      let carpeta = null
      // let carpetas = null
      //
      if (params.id) carpeta = await dameCarpeta({
        id: params.id
      })
      /* else if (params._where)
      {
        carpetas = await strapi.services.carpetas.find(params._where[0])
        carpetas = carpetas.concat(await strapi.services.carpetas.find({...params._where[0], _publicationState: 'preview' }))
      }*/
      if (carpeta && carpeta.subcarpetas.length && !('recursive' in params)) {
        throw strapi.errors.badRequest(
          'No se puede eliminar porque tiene subcarpetas'
        )
      }
      if (carpeta && carpeta.archivos.length && !('recursive' in params)) {
        throw strapi.errors.badRequest(
          'No se puede eliminar porque tiene archivos'
        )
      }

      /*if(carpetas) {
        for(carpeta of carpetas)
          if(carpeta.subcarpetas.length && !('recursive' in params))
          {
            // no funciona: bloquea el frontend, pero al menos evita el borrado
            throw strapi.errors.badRequest(`No se puede eliminar porque la carpeta con ruta '${carpeta.ruta}' tiene subcarpetas`)      
          }
      }*/
    },

    async afterDelete(result, params) {
      console.log('afterDelete', collection, params, result)
      await contenidos.delete(collection, params.id)
      // si se borra una carpeta, se borran todas las carpetas hija? por defecto: sí!
      if (isIterable(result))
        for (const carpeta of result) await eliminarContenidosCarpeta(carpeta)
      else await eliminarContenidosCarpeta(result)
    }
  }
}
