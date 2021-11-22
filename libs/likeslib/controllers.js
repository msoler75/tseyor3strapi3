const { sanitizeEntity } = require('strapi-utils');

module.exports = {

  async like(collection, ctx) {
    const { id } = ctx.params;

    const userId = ctx.state.user?ctx.state.user.id:0;

    let entity = await strapi.services[collection].like({ id }, userId);

    return sanitizeEntity(entity, { model: strapi.models[collection] });
  },

  async dislike(collection, ctx) {
    const { id } = ctx.params;

    const userId = ctx.state.user?ctx.state.user.id:0;

    let entity = await strapi.services[collection].dislike({ id }, userId);

    return sanitizeEntity(entity, { model: strapi.models[collection] });
  }

}