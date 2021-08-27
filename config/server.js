module.exports = ({ env }) => ({
  url: env("URL", "http://localhost:1337"),
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '6a92de34e56723045a9f8cbdca35a805'),
    },
  },
});
