import * as usuarioService from '../services/usuarioService.js';

export const listarUsuarios = async (req, res) => {
  const usuarios = await usuarioService.getUsuarios();
  res.json(usuarios);
};

export const obtenerUsuario = async (req, res) => {
  const { id } = req.query
  const usuario = await usuarioService.getUsuarioById(id);
  usuario ? res.json(usuario) : res.status(404).json({ message: 'Usuario no encontrado' });
};

export const crearUsuario = async (req, res) => {
  const nuevoUsuario = await usuarioService.createUsuario(req.body);
  res.status(201).json(nuevoUsuario);
};

export const actualizarUsuario = async (req, res) => {
  await usuarioService.updateUsuario(req.params.id, req.body);
  res.json({ message: 'Usuario actualizado' });
};

export const eliminarUsuario = async (req, res) => {
  await usuarioService.deleteUsuario(req.params.id);
  res.json({ message: 'Usuario eliminado' });
};

export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }
    console.log("Intentando login con:", correo, contrasena);
    const usuario = await usuarioService.loginUsuario(correo, contrasena);

    if (usuario === null) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (usuario === false) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      usuario
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};