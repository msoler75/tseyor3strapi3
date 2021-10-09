'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async find(ctx) {
        // solo para usuarios autenticados
        // if (!ctx.state.user) ctx.unauthorized(`Debes iniciar sesión`);
        // if(!ctx.state.user)
        // return null 
        const userid = ctx.state.user?ctx.state.user.id:0
        
        console.log('userid', userid)

        let actividades
        const knex = strapi.connections.default


         // primero obtenemos un listado de actividades en las que estamos inscritos por ser miembro
        // la inscripción es por equipos: si soy miembro de un equipo, recibo la agenda de actividades de dicho equipo
        const sql1 = `
        SELECT *, e.id as id_equipo, a.id as id_actividad FROM actividades a
        JOIN equipos e ON e.id = a.equipo
        JOIN equipos_miembros__users_equipos eu ON eu.equipo_id=e.id
        WHERE eu.user_id = ${userid}
        `;
        console.log(sql1)

        const result1 = await knex.raw(sql1)
        const rows1 = result1[0]
        const actividades1 = rows1.map(x=>x.id_actividad)
        const misequipos = rows1.map(x=>x.id_equipo)

        
        // actividades de equipos en los que soy coordinador/a
        const sql2 = `
        SELECT *, e.id as id_equipo, a.id as id_actividad FROM actividades a
        JOIN equipos e ON e.id = a.equipo
        JOIN equipos_coordinadores__users_coordinas eu ON eu.equipo_id=e.id
        WHERE eu.user_id = ${userid}
        `;
        console.log(sql2)

        
        const result2 = await knex.raw(sql2)
        const rows2 = result2[0]
        const actividades2 = rows2.map(x=>x.id_actividad)

        
        // actividades a la que está suscrito
        // también se ponen las actividades públicas
        const sql3 = `
        SELECT *, e.id as id_equipo, a.id as id_actividad FROM actividades a
        JOIN equipos e ON e.id = a.equipo
        JOIN equipos_suscriptores__users_notificaciones_equipos eu ON eu.equipo_id=e.id
        WHERE (${userid} = 0 AND a.publica) OR eu.user_id = ${userid}
        `;
        console.log(sql3)

        
        const result3 = await knex.raw(sql3)
        const rows3 = result3[0]
        const actividades3 = rows3.map(x=>x.id_actividad)
        

        console.log('query', ctx.query)
        if(ctx.query.actividad)
        {
            actividades = [ctx.query.actividad]
        }
        else 
        {
            // ponemos todas las actividades juntas
            actividades = actividades1
            for(const a of actividades2)
            {
                if(actividades.indexOf(a)<0)
                    actividades.push(a)
            }
            for(const a of actividades3)
            {
                if(actividades.indexOf(a)<0)
                    actividades.push(a)
            }

        }

        // ahora obtenemos los horarios de cada actividad, y colocamos todos los datos de la actividad, equipo y sala para su fácil uso
        const sql = `
            SELECT actividade_id, dia, hora, a.titulo, a.descripcion, a.tipo, a.sala, a.publica, a.equipo, e.nombre as equipo_nombre, e.zonahoraria, s.nombre AS sala_nombre, horario.id AS horario_id FROM actividades_components ac
            JOIN components_horario_horarios horario ON horario.id = ac.component_id
            JOIN actividades a ON a.id = ac.actividade_id
            JOIN equipos e ON e.id = a.equipo
            LEFT JOIN salas s ON s.id = sala
            WHERE ac.actividade_id IN (${actividades.length?actividades.join(','):'0'})`


            console.log(sql)

            const result = await knex.raw(sql)
            const horarios = result.length?result[0].map(x=>(
                {
                    actividad: {
                        id: x.actividade_id,
                        titulo: x.titulo,
                        descripcion: x.descripcion,
                        publica: x.publica,
                    },
                    equipo: {
                        id: x.equipo,
                        nombre: x.equipo_nombre,
                        zonahoraria: x.zonahoraria,
                        soymiembro: misequipos.indexOf(x.equipo)>-1,
                        suscrito: actividades2.indexOf(x.actividade_id)>-1
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
            :
            []

            // console.log('horarios', horarios)
            


        return horarios
    }
}