// generales
const generales = ['boletines', 'audios', 'comunicados', 'eventos', 'libros', 'normativas', 'noticias']
// contenidos
const especificos = ['blogs', 'carpetas', 'comentarios', 'equipos', 'paginas']


function makeid(length) {
  var result = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  return result
}


// CRYPTO
// basado en https://www.geeksforgeeks.org/node-js-crypto-createdecipheriv-method/?ref=lbp

const crypto = require('crypto-browserify');

// Difining algorithm
const algorithm = 'aes-256-cbc';

// Defining key
const key = process.env.CRYPTO_SUSCRIPTION_KEY || crypto.randomBytes(32);


// An encrypt function
function encrypt(text) {

  // Defining iv
  const iv = crypto.randomBytes(16);

  // Creating Cipheriv with its parameter
  const cipher =
    crypto.createCipheriv(algorithm, Buffer.from(key), iv);

  // Updating text
  let encrypted = cipher.update(text);

  // Using concatenation
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Returning iv and encrypted data
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
}

// A decrypt function
function decrypt(text) {

  const iv = Buffer.from(text.iv, 'hex');
  const encryptedText =
    Buffer.from(text.encryptedData, 'hex');

  // Creating Decipher
  const decipher = crypto.createDecipheriv(
    algorithm, Buffer.from(key), iv);

  // Updating encrypted text
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // returns data after decryption
  return decrypted.toString();
}

/*
// Encrypts input
var output = encrypt("Hola qué tal?");
console.log(output);
  
// Decrypts output
console.log(decrypt(output));
*/



module.exports = {
  generales,
  especificos,
  makeid,
  encrypt,
  decrypt
}
