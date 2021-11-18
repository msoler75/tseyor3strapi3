"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

async function getEquipos(ctx, relacion) {
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
  const equipos = user && user[relacion] ? user[relacion].map((x) => x.id) : [];
  const foundIn = equipos.findIndex((id) => id === equipoid);
  // console.log("equipos", equipos)
  // console.log("foundIn", foundIn)
  return {equipos, foundIn, equipoid}
}

async function updateUser(ctx, relacion, equipos) {
  const userid = ctx.state.user.id;
  console.log("updateUser", userid);
  //await strapi.services.user.updateById(ctx.state.user.id, {equipos})
  const obj = {}
  obj[relacion] = equipos
  await strapi
    .query("user", "users-permissions")
    .update({ id: userid }, obj)
}

module.exports = {
  async join(ctx) {
    // console.log('--- join ---')
    const {equipos, foundIn, equipoid } = await getEquipos(ctx, 'equipos');
    if (foundIn === -1) {
        console.log('equipoid', equipoid)
      equipos.push(equipoid);
      await updateUser(ctx, 'equipos', equipos);
    }
    return {
        status: '200'
     }
  },

  async leave(ctx) {
    // console.log('--- leave ---')
    const {equipos, foundIn, equipoid } = await getEquipos(ctx, 'equipos');
    if (foundIn === -1) 
        return ctx.unauthorized(`No estás en ese equipo`);
    equipos.splice(foundIn, 1);
    // console.log('equipos2', equipos)
    await updateUser(ctx, 'equipos', equipos);
     //Will return sanitized orders
     return {
        status: '200'
     }
  },

  async suscribe(ctx) {
    // console.log('--- join ---')
    const {equipos, foundIn, equipoid } = await getEquipos(ctx, 'suscrito');
    if (foundIn === -1) {
        console.log('equipoid', equipoid)
      equipos.push(equipoid);
      await updateUser(ctx, 'suscrito', equipos);
    }
    return {
        status: '200'
     }
  },

  async unsuscribe(ctx) {
    // console.log('--- leave ---')
    const {equipos, foundIn, equipoid } = await getEquipos(ctx, 'suscrito');
    if (foundIn === -1) 
        return ctx.unauthorized(`No estás en ese equipo`);
    equipos.splice(foundIn, 1);
    // console.log('equipos2', equipos)
    await updateUser(ctx, 'suscrito', equipos);
     //Will return sanitized orders
     return {
        status: '200'
     }
  },

}
