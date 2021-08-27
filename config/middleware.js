module.exports = {
    //...
    settings: {
      /* cors: {
        origin: ['http://localhost', 'https://mysite.com', 'https://www.mysite.com'],
      }, */
      public: {
        enabled: true,
        maxAge: 60000,
        path: "../nuxt2/static",
        defaultIndex: true
      },
      gzip: {
          enabled: true,
      }
    },
  };
