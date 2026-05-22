import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/public', publicRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/me', meRouter);
  app.use('/api/children', childrenRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/uploads', uploadsRouter);
  app.use('/api/staff', staffRouter);
  app.use('/api/donors', donorsRouter);
  app.use('/api/donations', donationsRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/reports', reportsRouter);

  app.use(errorHandler);
  return app;
}
