const express = require('express');
const router = express.Router();
const monthlyOverallExpenseController = require('../controllers/monthlyOverallExpenseController');
const monthlyOverallExpenseValidations = require('../middlewares/monthlyOverallExpenseValidations');

router.get('/', monthlyOverallExpenseController.getAllMonthlyOverallExpenses);
router.get('/:id', monthlyOverallExpenseValidations.getMonthlyOverallExpenseByIdValidation, monthlyOverallExpenseController.getMonthlyOverallExpenseById);
router.post('/', monthlyOverallExpenseValidations.createMonthlyOverallExpenseValidation, monthlyOverallExpenseController.createMonthlyOverallExpense);
router.put('/:id', monthlyOverallExpenseValidations.updateMonthlyOverallExpenseValidation, monthlyOverallExpenseController.updateMonthlyOverallExpense);
router.delete('/:id', monthlyOverallExpenseValidations.deleteMonthlyOverallExpenseValidation, monthlyOverallExpenseController.deleteMonthlyOverallExpense);
router.patch('/:id', monthlyOverallExpenseValidations.changeStateValidation, monthlyOverallExpenseController.changeStateMonthlyOverallExpense);

//Nuevas rutas
router.get('/total/:year/:month', monthlyOverallExpenseController.getTotalExpenseByMonth);
router.get('/total/:year/:month/:idExpenseType', monthlyOverallExpenseController.getTotalExpenseByTypeAndMonth);


module.exports = router;