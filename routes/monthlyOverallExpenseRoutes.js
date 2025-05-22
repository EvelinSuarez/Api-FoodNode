// routes/monthlyOverallExpenseRoutes.js
const express = require('express');
const router = express.Router();
const monthlyOverallExpenseController = require('../controllers/monthlyOverallExpenseController');
const validations = require('../middlewares/monthlyOverallExpenseValidations'); // Nombre de archivo actualizado

// CRUD Básico
router.get('/', monthlyOverallExpenseController.getAllMonthlyOverallExpenses);
router.post('/', validations.createMonthlyOverallExpenseValidation, monthlyOverallExpenseController.createMonthlyOverallExpense);

// Rutas con :idOverallMonth (param consistente)
router.get('/:idOverallMonth', validations.getMonthlyOverallExpenseByIdValidation, monthlyOverallExpenseController.getMonthlyOverallExpenseById);
router.put('/:idOverallMonth', validations.updateMonthlyOverallExpenseValidation, monthlyOverallExpenseController.updateMonthlyOverallExpense);
router.delete('/:idOverallMonth', validations.deleteMonthlyOverallExpenseValidation, monthlyOverallExpenseController.deleteMonthlyOverallExpense);
router.patch('/:idOverallMonth/status', validations.changeStateValidation, monthlyOverallExpenseController.changeStateMonthlyOverallExpense);

// Nuevas rutas para totales
router.get('/total/by-month/:year/:month', validations.getTotalExpenseByMonthValidation, monthlyOverallExpenseController.getTotalExpenseByMonth);

module.exports = router;