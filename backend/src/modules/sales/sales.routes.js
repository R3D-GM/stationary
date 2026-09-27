import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/auth.js';
import * as service from './sales.service.js';

const router = Router();

const saleSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().max(100000),
    unitPrice: z.number().min(0).optional(),
  })).min(1),
  paymentMethod: z.enum(['cash', 'account']),
  note: z.string().trim().max(300).optional(),
});

router.get('/', (req, res) => res.json({ sales: service.listSales({ limit: Number(req.query.limit) || 50 }) }));
router.post('/', validate(saleSchema), (req, res) => {
  const id = service.createSale(req.body, req.user.id);
  res.status(201).json({ id });
});
router.put('/:id/void', requireRole('owner'), (req, res) => {
  service.voidSale(Number(req.params.id), req.user.id);
  res.json({ ok: true });
});

export default router;
