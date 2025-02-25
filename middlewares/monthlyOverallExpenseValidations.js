const { body, param } = require('express-validator');
const MonthlyOverallExpense = require('../models/monthlyOverallExpense');
const ExpenseType = require('../models/conceptSpent');  // Asumimos que tienes un modelo para ExpenseType

// Función para verificar si el tipo de gasto existe
const validateExpenseTypeExistence = async (id) => {
    const expenseType = await ExpenseType.findByPk(id);
    if (!expenseType) {
        return Promise.reject('El tipo de gasto no existe');
    }
};

// Validación base para el registro de gasto mensual
const monthlyOverallExpenseBaseValidation = [
    body('idExpenseType').isInt().withMessage('El id del tipo de gasto debe ser un número entero'),
    body('dateOverallExp').isDate().withMessage('La fecha de gasto debe ser una fecha válida'),
    body('valueExpense').isInt().withMessage('El valor del gasto debe ser un número entero'),
    body('novelty_expense').isLength({ min: 1 }).withMessage('La novedad del gasto no puede estar vacía'),
    body('state').isBoolean().withMessage('El estado debe ser un booleano'),
];

// Validación para crear un nuevo registro de gasto mensual
const createMonthlyOverallExpenseValidation = [
    ...monthlyOverallExpenseBaseValidation,
    body('idExpenseType').custom(validateExpenseTypeExistence), // Verificar que el tipo de gasto exista
];

// Validación para actualizar un registro de gasto mensual
const updateMonthlyOverallExpenseValidation = [
    ...monthlyOverallExpenseBaseValidation,
    param('idOverallMonth').isInt().withMessage('El id debe ser un número entero'),
    param('idOverallMonth').custom(async (id) => {
        const monthlyOverallExpense = await MonthlyOverallExpense.findByPk(id);
        if (!monthlyOverallExpense) {
            return Promise.reject('El registro de gasto mensual no existe');
        }
    }),
];

// Validación para eliminar un registro de gasto mensual
const deleteMonthlyOverallExpenseValidation = [
    param('idOverallMonth').isInt().withMessage('El id debe ser un número entero'),
    param('idOverallMonth').custom(async (id) => {
        const monthlyOverallExpense = await MonthlyOverallExpense.findByPk(id);
        if (!monthlyOverallExpense) {
            return Promise.reject('El registro de gasto mensual no existe');
        }
    }),
];

// Validación para obtener un registro de gasto mensual por id
const getMonthlyOverallExpenseByIdValidation = [
    param('idOverallMonth').isInt().withMessage('El id debe ser un número entero'),
    param('idOverallMonth').custom(async (id) => {
        const monthlyOverallExpense = await MonthlyOverallExpense.findByPk(id);
        if (!monthlyOverallExpense) {
            return Promise.reject('El registro de gasto mensual no existe');
        }
    }),
];

// Validación para cambiar el estado de un registro de gasto mensual
const changeStateValidation = [
    body('state').isBoolean().withMessage('El estado debe ser un booleano'),
    param('idOverallMonth').isInt().withMessage('El id debe ser un número entero'),
    param('idOverallMonth').custom(async (id) => {
        const monthlyOverallExpense = await MonthlyOverallExpense.findByPk(id);
        if (!monthlyOverallExpense) {
            return Promise.reject('El registro de gasto mensual no existe');
        }
    }),
];

module.exports = {
    createMonthlyOverallExpenseValidation,
    updateMonthlyOverallExpenseValidation,
    deleteMonthlyOverallExpenseValidation,
    getMonthlyOverallExpenseByIdValidation,
    changeStateValidation,
};
