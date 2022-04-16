const {idy} = require('./utils')
  
module.exports = {
  soyAutor: function (contenido, user) {
    if (!user || !user.id || !('autor' in contenido) || !contenido.autor)
      return false
    return contenido.autor === user.id || contenido.autor.id === user.id
  },

  // comprueba si el usuario tiene acceso segun los permisos indicados
  tengoPermiso: async function (contenido, modo, user) {
    console.log('tengoPermiso?', modo, user)
    // console.log('contenido', contenido)
    if (this.soyAutor(contenido, user)) return true
    // if (!('permisos' in contenido)) return false
    let permisos = contenido.permisos
    console.log('tengo acceso?', permisos)
    if (!permisos) {
      // busca los permisos en los lugares adecuados, según sea una carpeta o un archivo
      let carpetaBase = contenido.carpeta || contenido.padre
      carpetaBase = carpetaBase
        ? await strapi.services.carpetas.findOne({ id: idy(carpetaBase) })
        : null
      if (carpetaBase)
        permisos = carpetaBase.permisos
      else 
        permisos = await permisos.buscaPermisos('/')
    }
    if (typeof permisos === 'number') {
      permisos = await strapi.services.permisos.findOne({ id: permisos })
      contenido.permisos = permisos
    }
    if (!permisos) {
      console.log('no se han encontrado permisos')
      return true
    }
    const p = permisos[modo]

    if (!p) return false
    console.log('permisos son', p)
    if (p.rol === 'Publico') return true
    console.log('user', user)
    if (user && user.id) {
      // console.log('miramos permisos de usuario', user)
      if (p.rol === 'Autenticados') {
        return true
      }
      if (p.rol === 'Delegados' && user.role.type === 'delegado') {
        return true
      }
      if (p.rol === 'Muul' && user.role.type === 'muul') {
        return true
      }
      if (p.usuarios.find(x => idy(x) === user.id)) {
        return true
      }
      for (const g of p.grupos) {
        if (user.grupos.find(x => idy(x) === idy(g))) {
          return true
        }
      }
      for (const e of p.equipos) {
        if (user.equipos.find(x => idy(x) === idy(e))) {
          return true
        }
      }
    }
    console.log('no permissions')
    return false
  },

  listaPermisosDesc: null,
  // let listaPermisosAsc = null

  preparaListaPermisos: async function () {
    if (!this.listaPermisosDesc) {
      const sql = `SELECT id, ruta FROM permisos ORDER BY ruta DESC`
      const knex = strapi.connections.default
      const permisos = await knex.raw(sql)
      this.listaPermisosDesc = permisos[0].map(x => ({
        id: x.id,
        ruta: x.ruta.toLowerCase()
      }))
      // listaPermisosAsc = await strapi.services.permisos.find({_sort: 'ruta::asc'})
      // console.log('listapermisosdesc', listaPermisosDesc)
    }
  },

  /**
   * Busca en todas las rutas, ordenadas de forma descendente, por lo que cuando encuentre una que empareje, es la buena
   *
   * Ejemplo:
   *
   * buscamos permisos para la carpeta /archivos/muul/divulgacion
   *
   * Y tenemos este listado de rutas:
   *
   * /archivos/ong/actas
   * /archivos/ong
   * /archivos/muul        <--- encuentra esta
   * /archivos/junantal
   * /archivos
   */
  buscaPermisos: async function (ruta) {
    ruta = ruta.toLowerCase()
    await preparaListaPermisos() // carga la variable 'listaPermisos'
    for (const p of this.listaPermisosDesc) {
      if (ruta.indexOf(p.ruta) === 0) {
        return p.id
      }
    }
    return null
  }
}
