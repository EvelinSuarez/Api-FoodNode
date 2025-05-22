const { Op } = require('sequelize');
const { body, param, validationResult } = require('express-validator');
const MonthlyOverallExpense = require('../models/monthlyOverallExpense');
const ExpenseType = require('../models/ExpenseType'); // Modelo de tipo de gasto

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

// Validación para verificar si ya existe un gasto con el mismo idExpenseType en el mismo mes
const validateUniqueExpenseTypeInMonth = async (value, { req }) => {
    const { dateOverallExp, idExpenseType } = req.body;
    
    if (!dateOverallExp || !idExpenseType) {
        return Promise.reject('La fecha y el tipo de gasto son obligatorios');
    }

    // Extraer año y mes de la fecha ingresada
    const date = new Date(dateOverallExp);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Verificar si ya existe un registro con el mismo idExpenseType en el mismo mes
    const existingExpense = await MonthlyOverallExpense.findOne({
        where: {
            idExpenseType,
            dateOverallExp: {
                [Op.between]: [startOfMonth, endOfMonth],
            },
        },
    });

    if (existingExpense) {
        return Promise.reject('Ya existe un gasto con este tipo en el mismo mes');
    }
};

// Validaciones base para el gasto mensual
const monthlyOverallExpenseBaseValidation = [
    body('idExpenseType')
        .isInt({ min: 1 }).withMessage('El id del tipo de gasto debe ser un número entero positivo')
        .custom(validateExpenseTypeExistence)
        .custom(validateUniqueExpenseTypeInMonth), // Nueva validación
    body('dateOverallExp')
        .optional()
        .isISO8601().withMessage('La fecha de gasto debe ser válida (ISO 8601)'),
    body('valueExpense')
        .isInt({ min: 1 }).withMessage('El valor del gasto debe ser un número entero positivo'),
    body('novelty_expense')
        .isString().withMessage('La novedad del gasto debe ser un texto')
        .isLength({ min: 1 }).withMessage('La novedad del gasto no puede estar vacía'),
    body('status')
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
    body('status')
        .isBoolean().withMessage('El estado debe ser un booleano'),
];

//Validaciones para los nuevos endpoints
const getTotalExpenseByMonthValidation = [
    param('year')
        .isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser un número entero entre 2000 y 2100'),
    param('month')
        .isInt({ min: 1, max: 12 }).withMessage('El mes debe ser un número entero entre 1 y 12'),
];

const getTotalExpenseByTypeAndMonthValidation = [
    param('year')
        .isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser un número entero entre 2000 y 2100'),
    param('month')
        .isInt({ min: 1, max: 12 }).withMessage('El mes debe ser un número entero entre 1 y 12'),
    param('idExpenseType')
        .isInt({ min: 1 }).withMessage('El ID del tipo de gasto debe ser un número entero positivo')
        .custom(validateExpenseTypeExistence),
];

module.exports = {
    createMonthlyOverallExpenseValidation,
    updateMonthlyOverallExpenseValidation,
    deleteMonthlyOverallExpenseValidation,
    getMonthlyOverallExpenseByIdValidation,
    changeStateValidation,
    getTotalExpenseByMonthValidation,
    getTotalExpenseByTypeAndMonthValidation,
};