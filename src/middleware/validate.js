const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Los datos enviados no son válidos.',
      details: errors.array().map(({ path, msg }) => ({ field: path, message: msg }))
    });
  }
  return next();
}

module.exports = validate;
