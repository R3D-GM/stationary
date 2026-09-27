import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './auth.service.js';

const router = Router();

const setupSchema = z.object({
  username: z.string().trim().min(3).max(30),
  password: z.string().min(6).max(100),
  fullName: z.string().trim().min(2).max(100),
});
const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

router.get('/status', (req, res) => res.json({ needsSetup: service.needsSetup() }));

router.post('/setup', validate(setupSchema), asyncHandler(async (req, res) => {
  res.status(201).json({ user: await service.createOwner(req.body) });
}));

router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  res.json(await service.login(req.body));
}));

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

router.get('/users', authenticate, requireRole('owner'), (req, res) => {
  res.json({ users: service.listUsers() });
});

router.post('/users', authenticate, requireRole('owner'), validate(setupSchema), asyncHandler(async (req, res) => {
  res.status(201).json({ user: await service.createStaff(req.body, req.user.id) });
}));

export default router;
