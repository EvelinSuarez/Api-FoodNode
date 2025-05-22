// middlewares/expenseCategoryValidations.js
const { body, param } = require('express-validator');
const ExpenseCategory = require('../models/ExpenseCategory'); // Usar el modelo correcto
const { Op } = require('sequelize'); // Para consultas

const validateExpenseCategoryExistence = async (idExpenseCategory, { req }) => {
    const expenseCategory = await ExpenseCategory.findByPk(idExpenseCategory);
    if (!expenseCategory) {
        return Promise.reject('La categoría de gasto no existe.');
    }
    req.expenseCategory = expenseCategory; // Adjuntar para uso posterior si es necesario
};

// Validación de unicidad del nombre (mejorada)
const validateUniqueExpenseCategoryName = async (name, { req }) => {
    const queryOptions = { where: { name: name.trim() } };
    if (req.params.idExpenseCategory) { // Si es una actualización, excluir el actual
        queryOptions.where.idExpenseCategory = { [Op.ne]: req.params.idExpenseCategory };
    }
    const existingCategory = await ExpenseCategory.findOne(queryOptions);
    if (existingCategory) {
        return Promise.reject('El nombre de la categoría de gasto ya existe.');
    }
};

const createExpenseCategoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio.')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.')
        .custom(validateUniqueExpenseCategoryName), // Validar unicidad
    body('description')
        .optional({ nullable: true, checkFalsy: true }) // Hacerla opcional
        .trim()
        .isLength({ max: 250 }).withMessage('La descripción no debe exceder los 250 caracteres.'),
    // isBimonthly: ELIMINADO DE AQUÍ
    body('status')
        .optional() // El status usualmente tiene un default (true)
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
];

const updateExpenseCategoryValidation = [
    param('idExpenseCategory')
        .isInt({ min: 1 }).withMessage('ID de categoría inválido.')
        .custom(validateExpenseCategoryExistence),
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío si se proporciona.')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.')
        .custom(validateUniqueExpenseCategoryName),
    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 250 }).withMessage('La descripción no debe exceder los 250 caracteres.'),
    // isBimonthly: ELIMINADO DE AQUÍ
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
];

const getExpenseCategoryByIdValidation = [
    param('idExpenseCategory')
        .isInt({ min: 1 }).withMessage('ID de categoría inválido.')
        .custom(validateExpenseCategoryExistence)
];

const deleteExpenseCategoryValidation = [
    param('idExpenseCategory')
        .isInt({ min: 1 }).withMessage('ID de categoría inválido.')
        .custom(validateExpenseCategoryExistence) // Valida que exista antes de intentar borrar
];

const changeStateExpenseCategoryValidation = [
    param('idExpenseCategory')
        .isInt({ min: 1 }).withMessage('ID de categoría inválido.')
        .custom(validateExpenseCategoryExistence),
    body('status')
        .exists({ checkFalsy: false }).withMessage('El campo status es requerido y no puede ser nulo.') // checkFalsy para permitir 'false'
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).')
];

module.exports = {
    createExpenseCategoryValidation,
    updateExpenseCategoryValidation,
    getExpenseCategoryByIdValidation,
    deleteExpenseCategoryValidation,
    changeStateExpenseCategoryValidation,
};