import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { AppError } from './utils/AppError.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';

import authRoutes from './modules/auth/auth.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import productRoutes from './modules/products/products.routes.js';
import stockRoutes from './modules/stock/stock.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import salesRoutes from './modules/sales/sales.routes.js';
import serviceRoutes from './modules/services/services.routes.js';
import dailyRoutes from './modules/daily/daily.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import reportRoutes from './modules/reports/reports.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);

// Everything below requires a logged-in user.
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/products', authenticate, productRoutes);
app.use('/api/stock', authenticate, stockRoutes);
app.use('/api/inventory', authenticate, inventoryRoutes);
app.use('/api/sales', authenticate, salesRoutes);
app.use('/api/services', authenticate, serviceRoutes);
app.use('/api/daily', authenticate, dailyRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/reports', authenticate, reportRoutes);

app.use((req, res, next) => next(new AppError(404, 'NOT_FOUND')));
app.use(errorHandler);

export default app;
