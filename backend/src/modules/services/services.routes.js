import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import * as service from './services.service.js';

const router = Router();
const schema = z.object({
  serviceTypeId: z.number().int().positive(),
  quantity: z.number().int().positive().max(1000000),
  unitPrice: z.number().min(0),
  paymentMethod: z.enum(['cash', 'account']),
});

router.get('/types', (req, res) => res.json({ types: service.listServiceTypes() }));
router.get('/', (req, res) => res.json({ transactions: service.listServiceTransactions({ limit: Number(req.query.limit) || 50 }) }));
router.post('/', validate(schema), (req, res) => res.status(201).json({ id: service.createServiceTransaction(req.body, req.user.id) }));

export default router;
