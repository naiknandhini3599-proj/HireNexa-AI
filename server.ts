import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes.js';
import { db } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load env variables from .env and .env.example
function loadEnvVariables() {
  const envFiles = [path.join(__dirname, '.env'), path.join(__dirname, '.env.example')];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (val && !process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (e) {
        console.warn(`[Env] Failed to read ${envFile}:`, e);
      }
    }
  }
}

loadEnvVariables();

// Connect to MongoDB Atlas if URI is provided
async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.startsWith('mongodb')) {
    try {
      mongoose.set('bufferCommands', false);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('🍃 Connected to MongoDB Atlas cluster successfully!');
    } catch (err: any) {
      console.warn('⚠️ MongoDB Atlas connection skipped or offline (using local resilient database):', err?.message || err);
    }
  }
}

async function startServer() {
  await initDatabase();
  await db.syncFromMongo();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // API Routes
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      mongoConnected: mongoose.connection.readyState === 1,
    });
  });

  if (!isProduction) {
    // In dev: mount Vite dev server as middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve built client assets
    const clientDist = path.join(__dirname, 'dist', 'client');
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HireNexa AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting HireNexa AI server:', err);
  process.exit(1);
});
