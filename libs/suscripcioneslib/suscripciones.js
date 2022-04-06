// generales
const generales = ['boletines', 'audios', 'comunicados', 'eventos', 'libros', 'normativas', 'noticias']
// contenidos
const especificos =  ['blogs', 'carpetas', 'comentarios', 'equipos', 'paginas']


function makeid(length) {
  var result = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  return result
}


module.exports = {
    generales,
    especificos,
    makeid
}