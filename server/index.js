import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { connectDB } from './config/db.js';
import { seedAll } from './seed/index.js';
import { startScheduler } from './utils/scheduler.js';
import { UPLOAD_DIR } from './utils/upload.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import taxonomyRoutes from './routes/taxonomy.js';
import mediaRoutes from './routes/media.js';
import seoRoutes from './routes/seo.js';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-only-secret-change-me';
  console.warn('[warn] JWT_SECRET not set: using an insecure development secret');
}

const app = express();
app.set('trust proxy', 1); // devtunnels / reverse proxies

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(compression());
// Reflect any origin: the Vite proxy / devtunnel makes requests same-origin anyway.
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/taxonomy', taxonomyRoutes);
app.use('/api/media', mediaRoutes);
app.use('/', seoRoutes); // /sitemap.xml, /robots.txt
app.use('/api', notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    await seedAll();
    startScheduler();
  } catch (err) {
    // Keep the API process alive so the client's fallback data still renders.
    console.error('[db] unavailable, API running without database:', err.message);
  }
  app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));
}

start();
