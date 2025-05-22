// routes/expenseTypeRoutes.js
const express = require('express');
const router = express.Router();
const expenseTypeController = require('../controllers/expenseTypeController'); // Renombrado
const validations = require('../middlewares/expenseTypeValidations'); // Renombrado

router.get('/', expenseTypeController.getAllExpenseTypes);
router.get('/:idExpenseType', validations.getExpenseTypeByIdValidation, expenseTypeController.getExpenseTypeById);
router.post('/', validations.createExpenseTypeValidation, expenseTypeController.createExpenseType);
router.put('/:idExpenseType', validations.updateExpenseTypeValidation, expenseTypeController.updateExpenseType);
router.delete('/:idExpenseType', validations.deleteExpenseTypeValidation, expenseTypeController.deleteExpenseType);
router.patch('/:idExpenseType/status', validations.changeStateExpenseTypeValidation, expenseTypeController.changeStateExpenseType); // Ruta más RESTful

module.exports = router;