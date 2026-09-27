import { Router } from 'express';
import * as service from './analytics.service.js';

const router = Router();

router.get('/dashboard', (req, res) => res.json(service.getDashboardSummary()));
router.get('/trends', (req, res) => res.json({ trends: service.getTrends(Number(req.query.days) || 14) }));
router.get('/sales-history', (req, res) => res.json({ transactions: service.getSalesHistory(req.query) }));
router.get('/insights', (req, res) => res.json(service.getInsights()));

export default router;
