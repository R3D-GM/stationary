import { Router } from 'express';
import { AppError } from '../../utils/AppError.js';
import { getDailyRecord } from './daily.service.js';

const router = Router();

router.get('/', (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError(400, 'DATE_REQUIRED');
  res.json(getDailyRecord(date));
});

export default router;
