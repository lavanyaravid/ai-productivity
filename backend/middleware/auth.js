const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// Protect routes - verifies JWT from Authorization header or cookie
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError('Not authorized to access this route. Please login.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError('User belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    throw new ApiError('Not authorized. Invalid or expired token.', 401);
  }
});

// Restrict to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(`Role '${req.user.role}' is not authorized to access this route.`, 403);
    }
    next();
  };
};
