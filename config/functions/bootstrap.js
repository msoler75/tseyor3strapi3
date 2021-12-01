'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = () => {
    strapi.admin.services.permission.conditionProvider.register({
        displayName: 'No protegidos por superadmin',
        name: 'no-protegidos-por-superadmin',
        plugin: 'admin',
        handler: (user) => { 
            console.log('user', user)
            // return !user.superadmin 
            return  { soloSuperAdmin: {$eq:  false } }
        },
    });

};
