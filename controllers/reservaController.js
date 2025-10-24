import * as reservaService from '../services/reservaService.js';

export const listarReservas = async (req, res) => {
  const reservas = await reservaService.getReservas();
  res.json(reservas);
};

export const crearReserva = async (req, res) => {
  const nuevaReserva = await reservaService.createReserva(req.body);
  res.status(201).json(nuevaReserva);
};

export const verificarDisponibilidad = async (req, res) => {
  try {
    const { fecha, hora } = req.body;

    if (!fecha || !hora) {
      return res.status(400).json({ mensaje: 'Debe enviar fecha y hora en el cuerpo de la solicitud' });
    }

    const resultado = await reservaService.verificarDisponibilidad(fecha, hora);

    if (!resultado.valido) {
      return res.status(400).json({
        disponible: false,
        fecha,
        hora,
        mensaje: resultado.mensaje
      });
    }

    res.status(200).json({
      disponible: true,
      fecha,
      hora,
      mensaje: resultado.mensaje
    });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};