function idy(el) {
    if (!el) return null
    if (typeof el !== 'object') return el
    if (el.id) return el.id
    return el
  }

  
  module.exports = {
      idy
  }