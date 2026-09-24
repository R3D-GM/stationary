// Makes sure errors thrown in async route handlers reach errorHandler.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);