// middlewares/specificConceptSpentValidations.js
const { body, param, query } = require('express-validator');
const SpecificConceptSpent = require('../models/SpecificConceptSpent');
const ExpenseType = require('../models/ExpenseType');

const validateSpecificConceptExistence = async (idSpecificConcept) => {
    const concept = await SpecificConceptSpent.findByPk(idSpecificConcept);
    if (!concept) {
        return Promise.reject('El concepto de gasto específico no existe.');
    }
};

const validateExpenseTypeGeneralExistence = async (idExpenseType) => {
    if (!idExpenseType) return true;
    const expenseType = await ExpenseType.findByPk(idExpenseType);
    if (!expenseType) {
        return Promise.reject('El tipo de gasto general (idExpenseType) referenciado no existe.');
    }
};

const validateUniqueNameWithinExpenseType = async (name, { req }) => {
    let idExpenseTypeToValidate;
    if (req.body.idExpenseType) {
        idExpenseTypeToValidate = req.body.idExpenseType;
    } else if (req.specificConceptToUpdate) { // Se adjunta en la validación del param para update
        idExpenseTypeToValidate = req.specificConceptToUpdate.idExpenseType;
    }

    if (!idExpenseTypeToValidate || !name) return true;

    const queryOptions = {
        where: {
            name: name.trim(),
            idExpenseType: idExpenseTypeToValidate
        }
    };
    if (req.params.idSpecificConcept) {
        queryOptions.where.idSpecificConcept = { [require('sequelize').Op.ne]: req.params.idSpecificConcept };
    }
    const existingConcept = await SpecificConceptSpent.findOne(queryOptions);
    if (existingConcept) {
        return Promise.reject('Ya existe un concepto de gasto con este nombre para el tipo de gasto general seleccionado.');
    }
};

const createSpecificConceptSpentValidation = [
    body('idExpenseType')
        .notEmpty().withMessage('El ID del tipo de gasto general (idExpenseType) es obligatorio.')
        .isInt({ min: 1 }).withMessage('idExpenseType debe ser un entero positivo.')
        .custom(validateExpenseTypeGeneralExistence),
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del concepto es obligatorio.')
        .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres.')
        .custom(validateUniqueNameWithinExpenseType),
    body('requiresEmployeeCalculation')
        .exists({ checkFalsy: false }).withMessage('El campo requiresEmployeeCalculation es obligatorio (true/false).')
        .isBoolean().withMessage('requiresEmployeeCalculation debe ser un valor booleano.'),
    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('La descripción debe ser texto.')
        .isLength({ max: 255 }).withMessage('La descripción no debe exceder los 255 caracteres.'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
];

const updateSpecificConceptSpentValidation = [
    param('idSpecificConcept')
        .isInt({ min: 1 }).withMessage('ID de concepto específico inválido.')
        .custom(async (value, { req }) => {
            const concept = await SpecificConceptSpent.findByPk(value);
            if (!concept) return Promise.reject('El concepto de gasto específico no existe.');
            req.specificConceptToUpdate = concept; // Adjuntar para usar en otras validaciones
        }),
    body('idExpenseType')
        .optional()
        .isInt({ min: 1 }).withMessage('idExpenseType debe ser un entero positivo.')
        .custom(validateExpenseTypeGeneralExistence),
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío si se actualiza.')
        .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres.')
        .custom(validateUniqueNameWithinExpenseType),
    body('requiresEmployeeCalculation')
        .optional()
        .isBoolean().withMessage('requiresEmployeeCalculation debe ser un valor booleano.'),
    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('La descripción debe ser texto.')
        .isLength({ max: 255 }).withMessage('La descripción no debe exceder los 255 caracteres.'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
];

const getSpecificConceptSpentByIdValidation = [
    param('idSpecificConcept')
        .isInt({ min: 1 }).withMessage('ID de concepto específico inválido.')
        .custom(validateSpecificConceptExistence)
];

const deleteSpecificConceptSpentValidation = [
    param('idSpecificConcept')
        .isInt({ min: 1 }).withMessage('ID de concepto específico inválido.')
        .custom(validateSpecificConceptExistence)
];

const changeStateSpecificConceptSpentValidation = [
    param('idSpecificConcept')
        .isInt({ min: 1 }).withMessage('ID de concepto específico inválido.')
        .custom(validateSpecificConceptExistence),
    body('status')
        .exists().withMessage('El campo status es requerido.')
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).')
];

const getAllSpecificConceptSpentsQueryValidation = [
    query('idExpenseType')
        .optional()
        .isInt({ min: 1 }).withMessage('idExpenseType (query param) debe ser un entero positivo si se provee.')
        .custom(validateExpenseTypeGeneralExistence), // Validar que el tipo general exista si se filtra por él
    query('status')
        .optional()
        .isBoolean().withMessage('status (query param) debe ser booleano (true/false) si se provee.')
        .toBoolean(),
    query('requiresEmployeeCalculation')
        .optional()
        .isBoolean().withMessage('requiresEmployeeCalculation (query param) debe ser booleano si se provee.')
        .toBoolean(),
];

module.exports = {
    createSpecificConceptSpentValidation,
    updateSpecificConceptSpentValidation,
    getSpecificConceptSpentByIdValidation,
    deleteSpecificConceptSpentValidation,
    changeStateSpecificConceptSpentValidation,
    getAllSpecificConceptSpentsQueryValidation,
};