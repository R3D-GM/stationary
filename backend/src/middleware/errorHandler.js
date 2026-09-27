import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, details: err.details } });
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR' } });
}
