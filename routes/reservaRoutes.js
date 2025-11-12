import express from 'express';
import * as reservaController from '../controllers/reservaController.js';
const router = express.Router();

router.get('/fecha/:fecha', reservaController.listarReservas);
router.get('/cliente/:id', reservaController.listarReservasById);
router.get('/codigo/:codigo', reservaController.obtenerReservaPorCodigo);
router.post('/', reservaController.crearReserva);
router.post('/disponibilidad', reservaController.verificarDisponibilidad);
router.put('/codigo/:codigo', reservaController.editarReservaPorCodigo);
router.delete('/codigo/:codigo', reservaController.eliminarReservaPorCodigo);
router.get('/listar/disponibles', reservaController.obtenerHorariosDisponibles);



export default router;
