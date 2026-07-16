const ApiError = require('../utils/ApiError');
const validator = require('validator');

// Generic field validator middleware factory
// rules example: { email: { required: true, isEmail: true }, password: { required: true, minLength: 6 } }
const validate = (rules) => (req, res, next) => {
  const errors = [];

  for (const field in rules) {
    const rule = rules[field];
    const value = req.body[field];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      if (rule.isEmail && !validator.isEmail(String(value))) {
        errors.push(`${field} must be a valid email`);
      }
      if (rule.minLength && String(value).length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && String(value).length > rule.maxLength) {
        errors.push(`${field} must not exceed ${rule.maxLength} characters`);
      }
      if (rule.isNumeric && isNaN(Number(value))) {
        errors.push(`${field} must be a number`);
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new ApiError(errors.join('. '), 400);
  }

  next();
};

module.exports = validate;
