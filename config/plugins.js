module.exports = ({ env }) => ({
    email: {
        provider: "console",
    },
    upload: {
        // https://strapi.io/documentation/developer-docs/latest/development/plugins/upload.html#configuration
        breakpoints: {
          /* none here */
          large: 1000,
          small: 500,
          xsmall: 64
        }
    },
    graphql: {
        amountLimit: 500
    }
   });