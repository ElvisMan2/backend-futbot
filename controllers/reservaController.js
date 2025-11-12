import * as reservaService from "../services/reservaService.js";

export const listarReservas = async (req, res) => {
  const { fecha } = req.params;
  const reservas = await reservaService.getReservas(fecha);
  res.json(reservas);
};

export const listarReservasById = async (req, res) => {
  const { id } = req.params;
  // const { fecha } = req.query;
  const reservas = await reservaService.getReservasById(id);
  res.json(reservas);
};

export const crearReserva = async (req, res) => {
  try {
    const nuevaReserva = await reservaService.createReserva(req.body);
    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error("Error al crear reserva:", error.message);
    res.status(400).json({ mensaje: error.message });
  }
};

export const verificarDisponibilidad = async (req, res) => {
  try {
    const { fecha, hora, horas } = req.body;

    if (!fecha || !hora) {
      return res
        .status(400)
        .json({
          mensaje: "Debe enviar fecha y hora en el cuerpo de la solicitud",
        });
    }

    const resultado = await reservaService.verificarDisponibilidad(
      fecha,
      hora,
      horas
    );

    if (!resultado.valido) {
      return res.status(400).json({
        disponible: false,
        fecha,
        hora,
        horas,
        mensaje: resultado.mensaje,
      });
    }

    res.status(200).json({
      disponible: true,
      fecha,
      hora,
      horas,
      mensaje: resultado.mensaje,
    });
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const obtenerReservaPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    if (!codigo) {
      return res
        .status(400)
        .json({ mensaje: "Debe proporcionar un código de reserva" });
    }

    const reserva = await reservaService.getReservaPorCodigo(codigo);

    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    res.status(200).json(reserva);
  } catch (error) {
    console.error("Error al obtener reserva por código:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const editarReservaPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { fecha_reserva, hora_reserva, horas } = req.body;

    if (!fecha_reserva || !hora_reserva) {
      return res
        .status(400)
        .json({ mensaje: "Debe enviar fecha_reserva y hora_reserva" });
    }

    const resultado = await reservaService.editarReservaPorCodigo(
      codigo,
      fecha_reserva,
      hora_reserva,
      horas
    );

    if (!resultado.exito) {
      return res.status(400).json({ mensaje: resultado.mensaje });
    }

    res
      .status(200)
      .json({
        mensaje: "Reserva actualizada correctamente",
        reserva: resultado.reserva,
      });
  } catch (error) {
    console.error("Error al editar reserva por código:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const eliminarReservaPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    if (!codigo) {
      return res
        .status(400)
        .json({ mensaje: "Debe proporcionar un código de reserva" });
    }

    const resultado = await reservaService.eliminarReservaPorCodigo(codigo);

    if (!resultado.exito) {
      return res.status(404).json({ mensaje: resultado.mensaje });
    }

    res.status(200).json({ mensaje: "Reserva cancelada correctamente" });
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};


export const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log(fecha);
    if (!fecha) {
      return res.status(400).json({ mensaje: 'Debe enviar la fecha en formato YYYY-MM-DD' });
    }

    const horarios = await reservaService.obtenerHorariosDisponibles(fecha);

    if (horarios.length === 0) {
      return res.status(200).json({ mensaje: 'No hay horarios disponibles para esta fecha', horarios: [] });
    }

    res.status(200).json({ fecha, horarios });
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};