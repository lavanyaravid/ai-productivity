const rateLimit = require('express-rate-limit');

// Strict limiter for auth endpoints (login, register, forgot-password, OTP)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints limiter — AI calls are costlier, so they get a tighter budget
exports.aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: {
    success: false,
    message: 'You have reached the AI Study Assistant limit for now. Please try again in a few minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
