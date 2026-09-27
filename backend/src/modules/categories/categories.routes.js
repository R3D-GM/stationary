import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../db/connection.js';
import { validate } from '../../middleware/validate.js';
import { AppError } from '../../utils/AppError.js';
import { logAudit } from '../../utils/audit.js';

const router = Router();

const schema = z.object({
  nameAm: z.string().trim().min(1).max(60),
  nameEn: z.string().trim().max(60).optional(),
});

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT id, name_am, name_en FROM categories ORDER BY name_am').all();
  res.json({ categories });
});

router.post('/', validate(schema), (req, res) => {
  const { nameAm, nameEn } = req.body;
  const exists = db.prepare('SELECT id FROM categories WHERE name_am = ?').get(nameAm);
  if (exists) throw new AppError(409, 'CATEGORY_EXISTS');

  const info = db
    .prepare('INSERT INTO categories (name_am, name_en) VALUES (?, ?)')
    .run(nameAm, nameEn || null);
  logAudit({ userId: req.user.id, action: 'CREATE', entity: 'category', entityId: info.lastInsertRowid });
  res.status(201).json({ id: info.lastInsertRowid });
});

export default router;
