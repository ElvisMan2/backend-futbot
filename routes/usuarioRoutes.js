import express from 'express';
import * as usuarioController from '../controllers/usuarioController.js';
const router = express.Router();

// router.get('/', usuarioController.listarUsuarios);
router.get('/', usuarioController.obtenerUsuario);
router.post('/', usuarioController.crearUsuario);
router.put('/:id', usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);
router.post('/login', usuarioController.login);


export default router;
