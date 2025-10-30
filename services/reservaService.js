import { pool } from '../config/db.js';
import { convertTo24Hour } from '../utils/timeUtils.js';

export const getReservas = async () => {
  const [rows] = await pool.query('SELECT * FROM reservas');
  return rows;
};

export const createReserva = async (reserva) => {
  const { usuarioId, fecha_reserva, hora_reserva } = reserva;

  const resultado = await verificarDisponibilidad(fecha_reserva, hora_reserva);
  if (!resultado.valido) {
    throw new Error(resultado.mensaje);
  }

  const hora24 = convertTo24Hour(hora_reserva);

  const [result] = await pool.query(
    `INSERT INTO reservas (usuarioId, fecha_reserva, hora_reserva)
     VALUES (?, STR_TO_DATE(?, '%d/%m/%Y'), ?)`,
    [usuarioId, fecha_reserva, hora24]
  );

  return { id: result.insertId, ...reserva, hora_reserva: hora24 };
};


export const verificarDisponibilidad = async (fechaInput, horaInput) => {
  try {
    // Convertir fecha dd/mm/yyyy → yyyy-mm-dd
    const [dia, mes, anio] = fechaInput.split('/');
    const fechaISO = `${anio}-${mes}-${dia}`;

    // Convertir hora "8:00 pm" → "20:00:00"
    const hora24 = convertirHoraA24(horaInput);

    // Validar que la fecha/hora no sean anteriores a la actual
    const fechaHoraConsulta = new Date(`${fechaISO}T${hora24}`);
    const ahora = new Date();
    if (fechaHoraConsulta < ahora) {
      return { valido: false, mensaje: 'La fecha y hora no pueden ser anteriores a la actual' };
    }

    // Consultar si ya existe una reserva en esa fecha/hora
    const [rows] = await pool.query(
      'SELECT * FROM reservas WHERE fecha_reserva = ? AND hora_reserva = ?',
      [fechaISO, hora24]
    );

    if (rows.length > 0) {
      return { valido: false, mensaje: 'La hora ya está reservada por otro usuario' };
    }

    return { valido: true, mensaje: 'Horario disponible' };
  } catch (error) {
    console.error('Error en verificarDisponibilidad:', error);
    throw new Error('Error procesando la fecha/hora');
  }
};

// 🔸 Convertir "8:00 pm" → "20:00:00"
function convertirHoraA24(hora12h) {
  const match = hora12h.trim().match(/^(\d{1,2}):(\d{2})\s?(am|pm)$/i);
  if (!match) throw new Error('Formato de hora inválido. Ejemplo válido: 8:00 am o 10:30 pm');

  let [_, hora, minutos, periodo] = match;
  hora = parseInt(hora);
  minutos = parseInt(minutos);

  if (periodo.toLowerCase() === 'pm' && hora < 12) hora += 12;
  if (periodo.toLowerCase() === 'am' && hora === 12) hora = 0;

  if (hora < 8 || hora > 22) throw new Error('Solo se permiten reservas entre 8:00 am y 10:00 pm');

  return `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`;
}
