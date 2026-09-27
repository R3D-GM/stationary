import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import * as service from './stock.service.js';

const router = Router();

const purchaseSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(1000000),
  unitCost: z.number().min(0).max(10000000),
  sellingPrice: z.number().min(0).max(10000000),
  supplier: z.string().trim().max(100).optional(),
  purchasedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.get('/purchases', (req, res) => res.json({ purchases: service.listPurchases() }));

router.post('/purchases', validate(purchaseSchema), (req, res) => {
  const id = service.addStock(req.body, req.user.id);
  res.status(201).json({ id });
});

export default router;
