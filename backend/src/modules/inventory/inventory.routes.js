import { Router } from 'express';
import * as service from './inventory.service.js';

const router = Router();

router.get('/', (req, res) => res.json({ items: service.getInventory() }));
router.get('/low-stock', (req, res) => res.json({ items: service.getLowStock() }));

export default router;
