import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import * as service from './products.service.js';

const router = Router();

const productSchema = z.object({
  name: z.string().trim().min(1).max(100),
  categoryId: z.number().int().positive().nullable().optional(),
  unit: z.enum(['piece', 'pack', 'box', 'dozen']),
  description: z.string().trim().max(500).nullable().optional(),
  lowStockThreshold: z.number().int().min(0).max(100000),
});

router.get('/', (req, res) => res.json({ products: service.listProducts() }));

router.post('/', validate(productSchema), (req, res) => {
  res.status(201).json({ product: service.createProduct(req.body, req.user.id) });
});

router.put('/:id', validate(productSchema), (req, res) => {
  res.json({ product: service.updateProduct(Number(req.params.id), req.body, req.user.id) });
});

export default router;
