// Wraps async route handlers so we don't need try/catch everywhere.
// Any rejected promise is forwarded to Express's error-handling middleware.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
