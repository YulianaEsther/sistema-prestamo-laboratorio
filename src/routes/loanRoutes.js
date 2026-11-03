const express = require('express');
const { body, param } = require('express-validator');
const loanController = require('../controllers/loanController');
const authenticateToken = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticateToken);
router.get('/active', loanController.listActive);
router.post('/', [
  body('equipmentId').isInt({ min: 1 }).withMessage('equipmentId debe ser un entero positivo.'),
  body('borrowerName').trim().isLength({ min: 2, max: 160 }).withMessage('El prestatario debe tener entre 2 y 160 caracteres.'),
  body('loanDate').isISO8601({ strict: true, strictSeparator: true }).withMessage('loanDate debe tener formato YYYY-MM-DD.'),
  body('dueDate').isISO8601({ strict: true, strictSeparator: true }).withMessage('dueDate debe tener formato YYYY-MM-DD.'),
  body('dueDate').custom((dueDate, { req }) => {
    if (dueDate < req.body.loanDate) throw new Error('La fecha prevista no puede ser anterior a la fecha del préstamo.');
    return true;
  }),
  validate
], loanController.create);
router.patch('/:id/return', [
  param('id').isInt({ min: 1 }).withMessage('El identificador debe ser un entero positivo.'),
  validate
], loanController.returnLoan);

module.exports = router;
