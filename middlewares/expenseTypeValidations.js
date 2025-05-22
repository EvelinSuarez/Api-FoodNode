// middlewares/expenseTypeValidations.js
const { body, param } = require('express-validator');
const ExpenseType = require('../models/ExpenseType'); // Modelo renombrado

const validateExpenseTypeExistence = async (idExpenseType) => {
    const expenseType = await ExpenseType.findByPk(idExpenseType);
    if (!expenseType) {
        return Promise.reject('El tipo de gasto no existe.');
    }
};

// Nota: SequelizeUniqueConstraintError se maneja mejor en el controlador/servicio.
// La validación de unicidad aquí puede ser redundante o causar doble consulta.
// Si decides mantenerla:
const validateUniqueExpenseTypeName = async (name, { req }) => {
    const queryOptions = { where: { name } };
    if (req.params.idExpenseType) { // Si es una actualización, excluir el actual
        queryOptions.where.idExpenseType = { [require('sequelize').Op.ne]: req.params.idExpenseType };
    }
    const expenseType = await ExpenseType.findOne(queryOptions);
    if (expenseType) {
        return Promise.reject('El nombre del tipo de gasto ya existe.');
    }
};

const createExpenseTypeValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio.')
        .isLength({ min: 3, max: 250 }).withMessage('El nombre debe tener entre 3 y 250 caracteres.'),
        //.custom(validateUniqueExpenseTypeName), // Opcional aquí, mejor manejar SequelizeUniqueConstraintError
    body('description')
        .trim()
        .notEmpty().withMessage('La descripción es obligatoria.')
        .isLength({ max: 250 }).withMessage('La descripción no debe exceder los 250 caracteres.'),
    body('isBimonthly')
        .optional()
        .isBoolean().withMessage('isBimonthly debe ser un valor booleano.'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
];

const updateExpenseTypeValidation = [
    param('idExpenseType')
        .isInt({ min: 1 }).withMessage('ID inválido.')
        .custom(validateExpenseTypeExistence),
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio.')
        .isLength({ min: 3, max: 250 }).withMessage('El nombre debe tener entre 3 y 250 caracteres.'),
        //.custom(validateUniqueExpenseTypeName), // Opcional
    body('description')
        .optional()
        .trim()
        .notEmpty().withMessage('La descripción es obligatoria.')
        .isLength({ max: 250 }).withMessage('La descripción no debe exceder los 250 caracteres.'),
    body('isBimonthly')
        .optional()
        .isBoolean().withMessage('isBimonthly debe ser un valor booleano.'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
];

const getExpenseTypeByIdValidation = [
    param('idExpenseType')
        .isInt({ min: 1 }).withMessage('ID inválido.')
        .custom(validateExpenseTypeExistence)
];

const deleteExpenseTypeValidation = [
    param('idExpenseType')
        .isInt({ min: 1 }).withMessage('ID inválido.')
        .custom(validateExpenseTypeExistence)
];

const changeStateExpenseTypeValidation = [
    param('idExpenseType')
        .isInt({ min: 1 }).withMessage('ID inválido.')
        .custom(validateExpenseTypeExistence),
    body('status')
        .exists().withMessage('El campo status es requerido.')
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
];

module.exports = {
    createExpenseTypeValidation,
    updateExpenseTypeValidation,
    getExpenseTypeByIdValidation,
    deleteExpenseTypeValidation,
    changeStateExpenseTypeValidation,
};