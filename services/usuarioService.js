import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const getUsuarios = async () => {
  const [rows] = await pool.query('SELECT * FROM usuarios');
  return rows;
};

export const getUsuarioById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE usuarioId = ?', [id]);
  return rows[0];
};

export const createUsuario = async (usuario) => {
  const { nombres, apellido_paterno, apellido_materno, correo, contrasena } = usuario;
  const hashed = await bcrypt.hash(contrasena, 10);
  const [result] = await pool.query(
    `INSERT INTO usuarios (nombres, apellido_paterno, apellido_materno, correo, contrasena)
     VALUES (?, ?, ?, ?, ?)`,
    [nombres, apellido_paterno, apellido_materno, correo, hashed]
  );
  return { id: result.insertId, ...usuario };
};

export const updateUsuario = async (id, usuario) => {
  const { nombres, apellido_paterno, apellido_materno, correo } = usuario;
  await pool.query(
    `UPDATE usuarios SET nombres=?, apellido_paterno=?, apellido_materno=?, correo=? WHERE usuarioId=?`,
    [nombres, apellido_paterno, apellido_materno, correo, id]
  );
};

export const deleteUsuario = async (id) => {
  await pool.query('DELETE FROM usuarios WHERE usuarioId=?', [id]);
};

export const loginUsuario = async (correo, contrasena) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  const usuario = rows[0];

  if (!usuario) {
    return null; // Usuario no encontrado
  }

  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!contrasenaValida) {
    return false; // Contraseña incorrecta
  }

  // Retornamos el usuario sin la contraseña
  const { contrasena: _, ...usuarioSinPass } = usuario;
  return usuarioSinPass;
};