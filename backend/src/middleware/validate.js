import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', result.error.issues));
  }
  req.body = result.data;
  next();
};
