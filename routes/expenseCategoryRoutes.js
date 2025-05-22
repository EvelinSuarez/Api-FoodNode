// routes/expenseCategoryRoutes.js
const express = require('express');
const router = express.Router();
const expenseCategoryController = require('../controllers/expenseCategoryController');
const validations = require('../middlewares/expenseCategoryValidations');

// Usar un path base como /expense-categories
router.get('/', expenseCategoryController.getAllExpenseCategories);
router.get('/:idExpenseCategory', validations.getExpenseCategoryByIdValidation, expenseCategoryController.getExpenseCategoryById);
router.post('/', validations.createExpenseCategoryValidation, expenseCategoryController.createExpenseCategory);
router.put('/:idExpenseCategory', validations.updateExpenseCategoryValidation, expenseCategoryController.updateExpenseCategory);
router.delete('/:idExpenseCategory', validations.deleteExpenseCategoryValidation, expenseCategoryController.deleteExpenseCategory);
router.patch('/:idExpenseCategory/status', validations.changeStateExpenseCategoryValidation, expenseCategoryController.changeStateExpenseCategory);

module.exports = router;