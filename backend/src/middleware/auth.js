import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db } from '../db/connection.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError(401, 'UNAUTHORIZED'));

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = db
      .prepare('SELECT id, username, full_name, role FROM users WHERE id = ? AND is_active = 1')
      .get(payload.sub);
    if (!user) return next(new AppError(401, 'UNAUTHORIZED'));
    req.user = user;
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED'));
  }
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(new AppError(403, 'FORBIDDEN'));