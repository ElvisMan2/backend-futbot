import express from 'express';
import * as reservaController from '../controllers/reservaController.js';
const router = express.Router();

router.get('/', reservaController.listarReservas);
router.post('/', reservaController.crearReserva);
router.post('/disponibilidad', reservaController.verificarDisponibilidad);



export default router;
