// middlewares/monthlyOverallExpenseValidations.js
const { Op } = require('sequelize');
const { body, param, query } = require('express-validator');
const MonthlyOverallExpense = require('../models/monthlyOverallExpense');
// ExpenseCategory ya no se necesita aquí para validar la cabecera del MonthlyOverallExpense

// Validación para verificar si el gasto mensual existe
const validateMonthlyOverallExpenseExistence = async (idOverallMonth, { req }) => {
    const expense = await MonthlyOverallExpense.findByPk(parseInt(idOverallMonth, 10));
    if (!expense) {
        const error = new Error('El registro de gasto mensual no existe.');
        error.statusCode = 404;
        return Promise.reject(error);
    }
    req.monthlyOverallExpense = expense;
    return true;
};

// validateUniqueExpenseCategoryInMonth YA NO APLICA para MonthlyOverallExpense
// porque ya no tiene idExpenseCategory.

// Validaciones base para el gasto mensual
const monthlyOverallExpenseBaseValidation = () => [
    // idExpenseCategory eliminado de aquí
    body('dateOverallExp')
        .notEmpty().withMessage('La fecha de gasto es obligatoria.')
        .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de gasto debe ser válida (YYYY-MM-DD).')
        .toDate(),
    body('valueExpense') // Este es el total de los ítems, enviado desde el frontend
        .notEmpty().withMessage('El valor del gasto es obligatorio.')
        .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage('El valor del gasto debe ser un número decimal válido (ej: 100 o 100.50).')
        .toFloat(),
    body('noveltyExpense') // Asumiendo que el frontend envía noveltyExpense (camelCase)
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('La novedad del gasto debe ser texto.')
        .trim()
        .isLength({ max: 250 }).withMessage('La novedad del gasto no debe exceder los 250 caracteres.'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
        .customSanitizer(value => { // Asegurar que sea booleano
            if (typeof value === 'string') return value.toLowerCase() === 'true';
            return !!value;
        }),
    // Validaciones para los ítems
    body('expenseItems')
        .notEmpty().withMessage('Debe haber al menos un ítem de gasto.')
        .isArray({ min: 1 }).withMessage('Debe haber al menos un ítem de gasto en el array.'),
    body('expenseItems.*.idSpecificConcept')
        .notEmpty().withMessage('El ID del concepto específico del ítem es obligatorio.')
        .isInt({ min: 1 }).withMessage('Cada ítem de gasto debe tener un idSpecificConcept válido.'),
    body('expenseItems.*.price')
        .notEmpty().withMessage('El precio del ítem es obligatorio.')
        .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage('El precio de cada ítem de gasto debe ser un decimal válido.')
        .toFloat(),
    body('expenseItems.*.baseSalary')
        .optional({ nullable: true })
        .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage('El salario base debe ser un decimal válido si se provee.')
        .toFloat(),
    body('expenseItems.*.numEmployees')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('El número de empleados debe ser un entero positivo si se provee.'),
    body('expenseItems.*.hasBonus')
        .optional()
        .isBoolean().withMessage('hasBonus debe ser booleano.'),
    body('expenseItems.*.bonusAmountValue')
        .optional({ nullable: true })
        .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage('El monto del bono debe ser un decimal válido si se provee.')
        .toFloat(),
];

const createMonthlyOverallExpenseValidation = [
    ...monthlyOverallExpenseBaseValidation(),
];

const updateMonthlyOverallExpenseValidation = [
    param('idOverallMonth')
        .isInt({ min: 1 }).withMessage('El ID del registro de gasto mensual debe ser un número entero positivo.')
        .bail()
        .custom(validateMonthlyOverallExpenseExistence),
    // Para update, solo se actualizan los campos de la cabecera.
    // Los items se manejarían por separado si se quisiera edición de items.
    // Por ahora, el update se enfoca en dateOverallExp, noveltyExpense, status.
    // valueExpense se recalcularía si los items cambian, lo cual es más complejo para un simple PUT.
    body('dateOverallExp')
        .optional()
        .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de gasto debe ser válida (YYYY-MM-DD).')
        .toDate(),
    // valueExpense no se actualiza directamente aquí, se actualiza si los items cambian.
    // Si solo se actualiza la cabecera, valueExpense no debería cambiar a menos que sea un recálculo.
    body('noveltyExpense')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('La novedad del gasto debe ser texto.')
        .trim()
        .isLength({ max: 250 }).withMessage('La novedad del gasto no debe exceder los 250 caracteres.'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
        .customSanitizer(value => {
            if (typeof value === 'string') return value.toLowerCase() === 'true';
            return !!value;
        }),
    // No se validan expenseItems en el update de la cabecera.
];

const deleteMonthlyOverallExpenseValidation = [
    param('idOverallMonth')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.')
        .bail()
        .custom(validateMonthlyOverallExpenseExistence),
];

const getMonthlyOverallExpenseByIdValidation = [
    param('idOverallMonth')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.')
        .bail()
        .custom(validateMonthlyOverallExpenseExistence),
];

const changeStateValidation = [
    param('idOverallMonth')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.')
        .bail()
        .custom(validateMonthlyOverallExpenseExistence),
    body('status')
        .exists({ checkFalsy: false }).withMessage('El campo status es requerido y no puede ser nulo.')
        .isBoolean().withMessage('El estado debe ser un valor booleano (true o false).')
        .customSanitizer(value => {
            if (typeof value === 'string') return value.toLowerCase() === 'true';
            return !!value;
        }),
];

const getAllMonthlyOverallExpensesValidation = [
    query('status').optional().isBoolean().withMessage('El filtro status debe ser booleano (true/false).').customSanitizer(value => {
        if (typeof value === 'string') return value.toLowerCase() === 'true';
        return !!value;
    }),
    // idExpenseCategory eliminado de los filtros de query para la cabecera
    query('year').optional().isInt({ min: 2000, max: new Date().getFullYear() + 10 }).withMessage('El filtro año debe ser un entero válido.').toInt(),
    query('month').optional().isInt({ min: 1, max: 12 }).withMessage('El filtro mes debe ser un entero entre 1 y 12.').toInt(),
];

const getTotalExpenseByMonthValidation = [
    param('year')
        .isInt({ min: 2000, max: new Date().getFullYear() + 10 }).withMessage(`El año debe ser un número entero entre 2000 y ${new Date().getFullYear() + 10}.`)
        .toInt(),
    param('month')
        .isInt({ min: 1, max: 12 }).withMessage('El mes debe ser un número entero entre 1 y 12.')
        .toInt(),
];

// getTotalExpenseByCategoryAndMonthValidation ya no aplica a la cabecera.
// Si se necesita esta funcionalidad, se haría sumando los ítems.

module.exports = {
    createMonthlyOverallExpenseValidation,
    updateMonthlyOverallExpenseValidation,
    deleteMonthlyOverallExpenseValidation,
    getMonthlyOverallExpenseByIdValidation,
    changeStateValidation,
    getAllMonthlyOverallExpensesValidation,
    getTotalExpenseByMonthValidation,
    // getTotalExpenseByCategoryAndMonthValidation, // Comentado/Eliminado
};