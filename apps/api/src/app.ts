import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.routes.js';
import { publicRouter } from './routes/public.routes.js';
import { meRouter } from './routes/me.routes.js';
import { childrenRouter } from './routes/children.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { uploadsRouter } from './routes/uploads.routes.js';
import { staffRouter } from './routes/staff.routes.js';
import { donorsRouter } from './routes/donors.routes.js';
import { donationsRouter } from './routes/donations.routes.js';
import { inventoryRouter } from './routes/inventory.routes.js';
import { reportsRouter } from './routes/reports.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { getCorsOrigins, isProduction } from './env.js';
import { prisma } from './lib/prisma.js';

export function createApp() {
  const app = express();

  if (isProduction()) {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin: getCorsOrigins(),
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction() ? 30 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Try again later.' },
  });

  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return res.json({ ok: true, db: 'up' });
    } catch {
      return res.status(503).json({ ok: false, db: 'down' });
    }
  });

  app.use('/api/public', publicRouter);
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/me', meRouter);
  app.use('/api/children', childrenRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/uploads', uploadsRouter);
  app.use('/api/staff', staffRouter);
  app.use('/api/donors', donorsRouter);
  app.use('/api/donations', donationsRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/reports', reportsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
