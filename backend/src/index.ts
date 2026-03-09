// index.ts
// Punto de entrada del servidor Express de AURA AI Backend.
// Inicia el servidor, configura CORS y registra las rutas.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// ── Middleware ────────────────────────────────────────────────────────────────

// CORS: permite peticiones desde el frontend de AURA (incluso en red local)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parseo JSON
app.use(express.json({ limit: '10kb' }));

// ── Rutas ─────────────────────────────────────────────────────────────────────

// Health check — útil para verificar que el servidor está arriba
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'AURA AI Backend', timestamp: new Date().toISOString() });
});

// API del asistente IA
app.use('/api/chat', chatRouter);

// 404 para rutas no definidas
app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
});

// ── Inicio del servidor ───────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ AURA AI Backend corriendo en http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   Chat API:     POST http://localhost:${PORT}/api/chat`);
    console.log(`   CORS habilitado para: LAN y ${FRONTEND_URL}`);
});

export default app;
