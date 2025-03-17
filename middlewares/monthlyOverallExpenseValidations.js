const { body, param } = require('express-validator');
const MonthlyOverallExpense = require('../models/monthlyOverallExpense');
const ExpenseType = require('../models/conceptSpent'); // Modelo de tipo de gasto

// Validación para verificar si el tipo de gasto existe
const validateExpenseTypeExistence = async (idExpenseType) => {
    const expenseType = await ExpenseType.findByPk(idExpenseType);
    if (!expenseType) {
        return Promise.reject('El tipo de gasto no existe');
    }
};

// Validación para verificar si el gasto mensual existe
const validateMonthlyOverallExpenseExistence = async (idOverallMonth) => {
    const expense = await MonthlyOverallExpense.findByPk(idOverallMonth);
    if (!expense) {
        return Promise.reject('El registro de gasto mensual no existe');
    }
};

// Validaciones base para el gasto mensual
const monthlyOverallExpenseBaseValidation = [
    body('idExpenseType')
        .isInt({ min: 1 }).withMessage('El id del tipo de gasto debe ser un número entero positivo')
        .custom(validateExpenseTypeExistence), // Verifica si existe el tipo de gasto
    body('dateOverallExp')
        .optional()
        .isISO8601().withMessage('La fecha de gasto debe ser válida (ISO 8601)'),
    body('valueExpense')
        .isInt({ min: 1 }).withMessage('El valor del gasto debe ser un número entero positivo'),
    body('novelty_expense')
        .isString().withMessage('La novedad del gasto debe ser un texto')
        .isLength({ min: 1 }).withMessage('La novedad del gasto no puede estar vacía'),
    body('state')
        .isBoolean().withMessage('El estado debe ser un booleano'),
];

// Validación para crear un nuevo gasto mensual
const createMonthlyOverallExpenseValidation = [
    ...monthlyOverallExpenseBaseValidation,
];

// Validación para actualizar un gasto mensual
const updateMonthlyOverallExpenseValidation = [
    param('idOverallMonth')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateMonthlyOverallExpenseExistence),
    ...monthlyOverallExpenseBaseValidation,
];

// Validación para eliminar un gasto mensual
const deleteMonthlyOverallExpenseValidation = [
    param('idOverallMonth')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateMonthlyOverallExpenseExistence),
];

// Validación para obtener un gasto mensual por ID
const getMonthlyOverallExpenseByIdValidation = [
    param('idOverallMonth')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateMonthlyOverallExpenseExistence),
];

// Validación para cambiar el estado de un gasto mensual
const changeStateValidation = [
    param('idOverallMonth')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateMonthlyOverallExpenseExistence),
    body('state')
        .isBoolean().withMessage('El estado debe ser un booleano'),
];

module.exports = {
    createMonthlyOverallExpenseValidation,
    updateMonthlyOverallExpenseValidation,
    deleteMonthlyOverallExpenseValidation,
    getMonthlyOverallExpenseByIdValidation,
    changeStateValidation,
};
