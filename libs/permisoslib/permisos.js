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
        console.log('no permisos')
        if(contenido.carpeta)
        {
            console.log('carpeta', contenido.carpeta)
            permisos = contenido.carpeta.permisos
        }
    }
    if(typeof permisos === 'number') 
    {
        permisos = await strapi.services.permisos.findOne({id: permisos})
    }
    if(!permisos) {
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
  }
}
