import { pool } from "../config/db.js";
import { convertTo24Hour } from "../utils/timeUtils.js";
import crypto from "crypto";

export const getReservas = async (fecha_consulta) => {
  if(!fecha_consulta){
      const [rows] = await pool.query(
    `
    SELECT 
      reserva_id, 
      usuarioId, 
      DATE_FORMAT(fecha_reserva, '%Y-%m-%d') as fecha, 
      hora_reserva,
      horas,
      DATE_FORMAT(fecha_reserva_inicio, '%Y-%m-%d %H:%i:%s') as fecha_hora_inicio,
      DATE_FORMAT(fecha_reserva_fin, '%Y-%m-%d %H:%i:%s') as fecha_hora_fin
    FROM reservas;
  `);
  return rows;
  }
  const [rows] = await pool.query(
    `
    SELECT 
      reserva_id, 
      usuarioId, 
      DATE_FORMAT(fecha_reserva, '%Y-%m-%d') as fecha, 
      hora_reserva,
      horas,
      DATE_FORMAT(fecha_reserva_inicio, '%Y-%m-%d %H:%i:%s') as fecha_hora_inicio,
      DATE_FORMAT(fecha_reserva_fin, '%Y-%m-%d %H:%i:%s') as fecha_hora_fin
    FROM reservas
    WHERE DATE_FORMAT(fecha_reserva, '%Y-%m-%d') = ?;
  `,
    fecha_consulta
  );
  return rows;
};

export const getReservasById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT 
      reserva_id, 
      usuarioId, 
      DATE_FORMAT(fecha_reserva, '%Y-%m-%d') as fecha, 
      hora_reserva,
      horas,
      DATE_FORMAT(fecha_reserva_inicio, '%Y-%m-%d %H:%i:%s') as fecha_hora_inicio,
      DATE_FORMAT(fecha_reserva_fin, '%Y-%m-%d %H:%i:%s') as fecha_hora_fin
    FROM reservas
    WHERE usuarioId = ?;
  `,
    id
  );
  return rows;
};

export const createReserva = async (reserva) => {
  const { usuarioId, fecha_reserva, hora_reserva, horas } = reserva;

  const resultado = await verificarDisponibilidad(
    fecha_reserva,
    hora_reserva,
    horas
  );
  if (!resultado.valido) {
    throw new Error(resultado.mensaje);
  }

  const hora24 = convertTo24Hour(hora_reserva);

  const codigo = `RSV-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const [result] = await pool.query(
    `INSERT INTO reservas (usuarioId, fecha_reserva, hora_reserva, horas, codigo)
     VALUES (?, STR_TO_DATE(?, '%d/%m/%Y'), ?, ?, ?)`,
    [usuarioId, fecha_reserva, hora24, horas, codigo]
  );

  return {
    codigo,
    fecha_reserva,
    hora_reserva: hora24,
    horas,
  };
};

export const verificarDisponibilidad = async (
  fechaInput,
  horaInput,
  horas = 1
) => {
  try {
    const [dia, mes, anio] = fechaInput.split("/");
    const fechaISO = `${anio}-${mes}-${dia}`;
    const hora24 = convertirHoraA24(horaInput);

    const inicioReserva = new Date(`${fechaISO}T${hora24}`);
    const finReserva = new Date(
      inicioReserva.getTime() + horas * 60 * 60 * 1000
    );

    if (inicioReserva < new Date()) {
      return {
        valido: false,
        mensaje: "La fecha y hora no pueden ser anteriores a la actual",
      };
    }

    const [rows] = await pool.query(
      `
      SELECT 
        reserva_id,
        usuarioId,
        fecha_reserva,
        hora_reserva,
        fecha_reserva_fin
      FROM reservas
      WHERE 
        TIMESTAMP(fecha_reserva, hora_reserva) < ? 
        AND fecha_reserva_fin > ?
      `,
      [finReserva, inicioReserva]
    );

    if (rows.length > 0) {
      return {
        valido: false,
        mensaje: "El horario seleccionado no disponible",
      };
    }

    return { valido: true, mensaje: "Horario disponible" };
  } catch (error) {
    console.error("Error en verificarDisponibilidad:", error);
    throw new Error("Error procesando la fecha/hora");
  }
};

function convertirHoraA24(hora12h) {
  const match = hora12h.trim().match(/^(\d{1,2}):(\d{2})\s?(am|pm)$/i);
  if (!match)
    throw new Error(
      "Formato de hora inválido. Ejemplo válido: 8:00 am o 10:30 pm"
    );

  let [_, hora, minutos, periodo] = match;
  hora = parseInt(hora);
  minutos = parseInt(minutos);

  if (periodo.toLowerCase() === "pm" && hora < 12) hora += 12;
  if (periodo.toLowerCase() === "am" && hora === 12) hora = 0;

  if (hora < 8 || hora > 22)
    throw new Error("Solo se permiten reservas entre 8:00 am y 10:00 pm");

  return `${hora.toString().padStart(2, "0")}:${minutos
    .toString()
    .padStart(2, "0")}:00`;
}

export const editarReservaPorCodigo = async (
  codigo,
  fecha_reserva,
  hora_reserva,
  horas
) => {
  const resultado = await verificarDisponibilidad(
    fecha_reserva,
    hora_reserva,
    horas
  );
  if (!resultado.valido) {
    return { exito: false, mensaje: resultado.mensaje };
  }

  const hora24 = convertTo24Hour(hora_reserva);

  const [result] = await pool.query(
    `UPDATE reservas 
     SET fecha_reserva = STR_TO_DATE(?, '%d/%m/%Y'), hora_reserva = ?, horas = ?
     WHERE codigo = ?`,
    [fecha_reserva, hora24, horas, codigo]
  );

  if (result.affectedRows === 0) {
    return {
      exito: false,
      mensaje: "No se encontró la reserva para actualizar",
    };
  }

  return { exito: true, mensaje: "Reserva actualizada correctamente" };
};

export const getReservaPorCodigo = async (codigo) => {
  const [rows] = await pool.query("SELECT * FROM reservas WHERE codigo = ?", [
    codigo,
  ]);
  return rows.length > 0 ? rows[0] : null;
};

export const eliminarReservaPorCodigo = async (codigo) => {
  const reserva = await getReservaPorCodigo(codigo);

  if (!reserva) {
    return {
      exito: false,
      mensaje: "No se encontró ninguna reserva con ese código",
    };
  }

  const [result] = await pool.query("DELETE FROM reservas WHERE codigo = ?", [
    codigo,
  ]);

  if (result.affectedRows === 0) {
    return { exito: false, mensaje: "No se pudo eliminar la reserva" };
  }

  return { exito: true, mensaje: "Reserva eliminada correctamente" };
};

export const obtenerHorariosDisponibles = async (fecha) => {
  console.log(fecha);
  const [rows] = await pool.query('CALL sp_obtener_horarios_disponibles(?)', [fecha]);
  return rows[0];
};
