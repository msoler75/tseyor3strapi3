"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

async function getEquipos(ctx) {
  if (!ctx.state.user) ctx.unauthorized(`Debes iniciar sesión`);
  // console.log(ctx.state.user);
  const { id } = ctx.params;
  const equipoid = parseInt(id);
  const userid = ctx.state.user.id;
  // console.log("equipoid", equipoid);
  // console.log("userid", userid);
  const user = await strapi.plugins["users-permissions"].services.user.fetch({
    id: userid,
  });
  // console.log("user", user);
  //console.log('equipo', equipo)
  const equipos = user && user.equipos ? user.equipos.map((x) => x.id) : [];
  const foundIn = equipos.findIndex((id) => id === equipoid);
  // console.log("equipos", equipos)
  // console.log("foundIn", foundIn)
  return {equipos, foundIn, equipoid}
}

async function updateUser(ctx, equipos) {
  const userid = ctx.state.user.id;
  // console.log("updateUser", equipos);
  //await strapi.services.user.updateById(ctx.state.user.id, {equipos})
  await strapi
    .query("user", "users-permissions")
    .update({ id: userid }, { equipos })
}

module.exports = {
  async join(ctx) {
    // console.log('--- join ---')
    const {equipos, foundIn, equipoid } = await getEquipos(ctx);
    if (foundIn === -1) {
        console.log('equipoid', equipoid)
      equipos.push(equipoid);
      await updateUser(ctx, equipos);
    }
    return {
        status: '200'
     }
  },

  async leave(ctx) {
    // console.log('--- leave ---')
    const {equipos, foundIn, equipoid } = await getEquipos(ctx);
    if (foundIn === -1) 
        ctx.unauthorized(`No estás en ese equipo`);
    equipos.splice(foundIn, 1);
    // console.log('equipos2', equipos)
    await updateUser(ctx, equipos);
     //Will return sanitized orders
     return {
        status: '200'
     }
  },
}
