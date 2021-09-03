module.exports = {
    //...
    settings: {
      /* cors: {
        origin: ['http://localhost', 'https://mysite.com', 'https://www.mysite.com'],
      }, */
      cors: {
        enabled: true,
        origin: ['*'],
        expose: ['WWW-Authenticate', 'Server-Authorization', 'Access-Control-Expose-Headers'],
        maxAge: 31536000,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        headers: [
          'Content-Type',
          'Authorization',
          'X-Frame-Options',
          'Origin',
          'Access-Control-Allow-Headers',
          'access-control-allow-origin',
        ],
      },
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
