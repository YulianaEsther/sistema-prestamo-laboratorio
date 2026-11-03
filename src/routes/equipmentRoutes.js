const express = require('express');
const { body, param } = require('express-validator');
const equipmentController = require('../controllers/equipmentController');
const loanController = require('../controllers/loanController');
const authenticateToken = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
const idRule = param('id').isInt({ min: 1 }).withMessage('El identificador debe ser un entero positivo.');
const fields = [
  body('code').trim().isLength({ min: 1, max: 60 }).withMessage('El código es obligatorio (máximo 60 caracteres).'),
  body('name').trim().isLength({ min: 1, max: 160 }).withMessage('El nombre es obligatorio (máximo 160 caracteres).'),
  body('category').trim().isLength({ min: 1, max: 100 }).withMessage('La categoría es obligatoria (máximo 100 caracteres).'),
  body('condition').optional().isIn(['operativo', 'mantenimiento', 'danado']).withMessage('La condición debe ser operativo, mantenimiento o danado.')
];

router.use(authenticateToken);
router.get('/', equipmentController.list);
router.post('/', fields, validate, equipmentController.create);
router.get('/:id/history', idRule, validate, equipmentController.history);
router.get('/:id', idRule, validate, equipmentController.getById);
router.put('/:id', [
  idRule,
  body('code').trim().isLength({ min: 1, max: 60 }).withMessage('El código es obligatorio (máximo 60 caracteres).'),
  body('name').trim().isLength({ min: 1, max: 160 }).withMessage('El nombre es obligatorio (máximo 160 caracteres).'),
  body('category').trim().isLength({ min: 1, max: 100 }).withMessage('La categoría es obligatoria (máximo 100 caracteres).'),
  body('condition').isIn(['operativo', 'mantenimiento', 'danado']).withMessage('La condición debe ser operativo, mantenimiento o danado.'),
  validate
], equipmentController.update);
router.patch('/:id', [
  idRule,
  body().custom((_, { req }) => {
    if (Object.keys(req.body).length === 0) throw new Error('Debe enviar al menos un campo para actualizar.');
    return true;
  }),
  body('code').optional().trim().isLength({ min: 1, max: 60 }).withMessage('El código no puede estar vacío y admite hasta 60 caracteres.'),
  body('name').optional().trim().isLength({ min: 1, max: 160 }).withMessage('El nombre no puede estar vacío y admite hasta 160 caracteres.'),
  body('category').optional().trim().isLength({ min: 1, max: 100 }).withMessage('La categoría no puede estar vacía y admite hasta 100 caracteres.'),
  body('condition').optional().isIn(['operativo', 'mantenimiento', 'danado']).withMessage('La condición debe ser operativo, mantenimiento o danado.'),
  validate
], equipmentController.update);
router.delete('/:id', idRule, validate, equipmentController.remove);

module.exports = router;
