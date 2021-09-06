

'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async find(ctx) {

        // solo para usuarios autenticados
        // console.log('user', ctx.state.user)
        //if(!ctx.state.user)
        //return null 
        const userid = 1 // ctx.state.user.id

        // primero obtenemos un listado de actividades en las que estamos inscritos
        // la inscripción es por equipos: si soy miembro de un equipo, recibo la agenda de actividades de dicho equipo
        const sql1 = `
        SELECT *, e.id as id_equipo, a.id as id_actividad FROM actividades a
        JOIN equipos e ON e.id = a.equipo
        JOIN equipos_users__users_equipos eu ON eu.equipo_id=e.id
        WHERE eu.user_id = ${userid}
        `;

        const knex = strapi.connections.default
        const result = await knex.raw(sql1)
        const rows = result[0]
        const actividades = rows.map(x=>x.id_actividad)


        // ahora obtenemos los horarios de cada actividad, y colocamos todos los datos de la actividad, equip oy sala para su fácil uso
            const sql = `
            SELECT actividade_id, dia, hora, a.titulo, a.descripcion, a.tipo, a.sala, a.publica, a.equipo, e.nombre as equipo_nombre, s.nombre AS sala_nombre, horario.id AS horario_id FROM actividades_components ac
            JOIN components_horario_horarios horario ON horario.id = ac.component_id
            JOIN actividades a ON a.id = ac.actividade_id
            JOIN equipos e ON e.id = a.equipo
            LEFT JOIN salas s ON s.id = sala
            WHERE ac.actividade_id IN (${actividades.join(',')})`

            const result2 = await knex.raw(sql)
            const horarios = result2[0].map(x=>(
                {
                    actividad: {
                        id: x.actividade_id,
                        titulo: x.titulo,
                        descripcion: x.descripcion,
                        publica: x.publica,
                    },
                    equipo: {
                        id: x.equipo,
                        nombre: x.equipo_nombre
                    },
                    horario: {
                        id: x.horario_id,
                        dia: x.dia,
                        hora: x.hora,
                    },
                    sala: x.sala?{
                        id: x.sala,
                        nombre: x.sala_nombre 
                    }:null
                }
            ))

            // console.log('horarios', horarios)
            


        return horarios
    }
}