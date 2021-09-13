const md5 = require("md5")
const slugify = require("slugify")
const pathParse = require('path-parse');

module.exports = ({ env }) => ({
  email: {
    provider: "console",
  },
  upload: {
    // https://github.com/Lith/strapi-provider-upload-google-cloud-storage#setting-up-the-configuration-file
    provider: "google-cloud-storage",
    providerOptions: {
      bucketName: "tseyor2022",
      publicFiles: true,
      uniform: true,
      basePath: "",
       generateUploadFileName: (file) => {
         // console.log('env', env)
         // console.log('file', file)
        const hash = md5(file.name); // Some hashing function, for example MD-5
        const extension = file.ext.toLowerCase().substring(1);
        let carpeta = extension
        if(extension.match(/jpe?g|png|webp|gif/i))
          carpeta = 'imagenes'
        if(extension.match(/mp3|mp4|m4a|wma|wav|mpe?g|aiff|au|midi?/i))
          carpeta = 'audios'
        if(extension.match(/pdf|docx?|pptx?|ppsx?/i))
          carpeta = 'docs'
        return `${carpeta}/${slugify(pathParse(file.name).name)}-${hash}.${extension}`;
      }, 
    }
  },
  graphql: {
    amountLimit: 500,
  },
});
