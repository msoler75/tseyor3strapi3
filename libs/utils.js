function idy(el) {
    if (!el) return null
    if (typeof el !== 'object') return el
    if (el.id) return el.id
    return el
  }


  function normalizarTitulo(texto) {
    // solo normalizamos si acaso no hay ninguna letra minúscula
    if(!texto) return texto
    if(texto.indexOf(/[a-z]/)>=0) return texto
    const words = texto.toLowerCase().split(/\s+/g)
    const r = []
    const palabras = 'un una el la los las a ante bajo cabe con contra de desde durante en entre hacia hasta mediante para por según sin so sobre tras versus vía'.split(' ')
    let firstWord = true
    for (let w of words) {
        if (firstWord || !(palabras.includes(w)))
            // capitalize
            w = w.charAt(0).toUpperCase() + w.substr(1)
        r.push(w)
        firstWord = w.indexOf('.') > -1
    }
    return r.join(' ').replace('la pm', 'La Pm')
}


  
  module.exports = {
      idy,
      normalizarTitulo
  }