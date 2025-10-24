import express from 'express';
import usuarioRoutes from './routes/usuarioRoutes.js';
import reservaRoutes from './routes/reservaRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/reservas', reservaRoutes);

export default app;
