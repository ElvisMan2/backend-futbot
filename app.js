import express from 'express';
import cors from 'cors';
import usuarioRoutes from './routes/usuarioRoutes.js';
import reservaRoutes from './routes/reservaRoutes.js';

const app = express();

// Permitir CORS desde cualquier origen
app.use(cors());

// Para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/reservas', reservaRoutes);

export default app;
