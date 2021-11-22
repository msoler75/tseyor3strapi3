const { isDraft } = require('strapi-utils').contentTypes;

module.exports = {

  async like(collection, params, userId) {
    const existingEntry = await strapi.query(collection).findOne(params);

    if(!existingEntry || isDraft(existingEntry, strapi.models[collection]))
        // do nothing
        return existingEntry

    validData = {likes: existingEntry.likes.map(obj=>obj.id)}
    if(!validData.likes.includes(userId))
        validData.likes.push(userId)

    const entry = await strapi.query(collection).update(params, validData);

    return entry;
  },


  
  async dislike(collection, params, userId) {
    const existingEntry = await strapi.query(collection).findOne(params);

    if(!existingEntry || isDraft(existingEntry, strapi.models[collection]))
        // do nothing
        return existingEntry

    validData = {likes: existingEntry.likes.map(obj=>obj.id)}
    const idx = validData.likes.findIndex(id=>id===userId)
    if(idx>-1)
        validData.likes.splice(idx, 1)

    const entry = await strapi.query(collection).update(params, validData);

    return entry;
  }
}