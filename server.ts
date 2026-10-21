import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Health and Project Info API (No external AI credits consumed)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    project: 'ACTORSELF — Enter the Story',
    scene: 'ACTORSELF: Última luz de Kepler',
    environment: process.env.NODE_ENV || 'development',
    timestamp: Date.now()
  });
});

app.get('/api/project-info', (_req, res) => {
  res.json({
    name: 'ACTORSELF — Enter the Story',
    concept: 'Conviértete en protagonista de tus historias favoritas.',
    type: 'Plataforma de entretenimiento audiovisual interactivo con IA',
    vision: 'Prototipo funcional para hackatón de Amazon (Integración conceptual con Prime Video & Fire TV)',
    status: 'Fase 1: Motor local Canvas/MediaRecorder activo sin consumo de créditos de pago.'
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 ACTORSELF Server activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
