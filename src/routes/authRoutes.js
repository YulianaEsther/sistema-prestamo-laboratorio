const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = express.Router();
const emailRule = body('email').trim().isEmail().withMessage('Debe ser un correo válido.').normalizeEmail();

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('El nombre debe tener entre 2 y 120 caracteres.'),
  emailRule,
  body('password').isLength({ min: 8, max: 72 }).withMessage('La contraseña debe tener entre 8 y 72 caracteres.'),
  validate
], authController.register);

router.post('/login', [
  emailRule,
  body('password').isString().notEmpty().withMessage('La contraseña es obligatoria.'),
  validate
], authController.login);

module.exports = router;
