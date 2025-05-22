// middlewares/specificConceptSpentValidations.js
const { body, param, query } = require('express-validator');
const { Op } = require('sequelize');
const SpecificConceptSpent = require('../models/SpecificConceptSpent');
const ExpenseCategory = require('../models/ExpenseCategory');

// Validador para existencia de SpecificConceptSpent
const validateSpecificConceptExistence = async (idSpecificConcept, { req }) => {
    const concept = await SpecificConceptSpent.findByPk(idSpecificConcept);
    if (!concept) {
        return Promise.reject('El concepto de gasto específico no existe.');
    }
    req.specificConcept = concept;
    return true; // Importante devolver true o resolver la promesa
};

// Validador para existencia de UNA ExpenseCategory ID
const validateExpenseCategoryId = async (idExpenseCategory) => {
    if (idExpenseCategory === undefined || idExpenseCategory === null) { // Permitir opcional en update
        return true;
    }
    const parsedId = parseInt(idExpenseCategory, 10);
    if (isNaN(parsedId) || parsedId < 1) {
        return Promise.reject('El idExpenseCategory no es un entero positivo válido.');
    }
    const expenseCategory = await ExpenseCategory.findByPk(parsedId);
    if (!expenseCategory) {
        return Promise.reject(`La categoría de gasto con ID ${parsedId} no existe.`);
    }
    return true;
};

// Validación de unicidad del nombre DENTRO DE UNA CATEGORÍA para SpecificConceptSpent
const validateUniqueConceptNameInCategory = async (name, { req }) => {
    const idExpenseCategory = req.body.idExpenseCategory || (req.specificConcept && req.specificConcept.idExpenseCategory);

    if (!idExpenseCategory) {
        // Si no se proporciona idExpenseCategory en el body (para create) o no se puede determinar (para update),
        // no se puede validar la unicidad compuesta. La validación de que idExpenseCategory es obligatorio
        // debería saltar antes o el flujo no debería llegar aquí sin uno.
        // Para 'update', si idExpenseCategory no se está cambiando, se usa el existente.
        // Esta validación se vuelve más compleja si idExpenseCategory también es opcional en el update.
        // Por ahora, asumimos que para 'create' idExpenseCategory es obligatorio.
        // Y para 'update', si 'name' se provee, también se debería considerar la 'idExpenseCategory' (actual o nueva).
        return true; // Se delega a la obligatoriedad de idExpenseCategory
    }

    const queryOptions = {
        where: {
            name: name.trim(),
            idExpenseCategory: parseInt(idExpenseCategory, 10)
        }
    };

    if (req.params.idSpecificConcept) { // Si es una actualización, excluir el concepto actual
        queryOptions.where.idSpecificConcept = { [Op.ne]: req.params.idSpecificConcept };
    }

    const existingConcept = await SpecificConceptSpent.findOne(queryOptions);
    if (existingConcept) {
        return Promise.reject('Ya existe un concepto de gasto específico con este nombre dentro de la categoría seleccionada.');
    }
    return true;
};


const createSpecificConceptSpentValidation = [
    body('idExpenseCategory') // Ahora es un solo ID
        .notEmpty().withMessage('El idExpenseCategory es obligatorio.')
        .isInt({ min: 1 }).withMessage('idExpenseCategory debe ser un entero positivo.')
        .custom(validateExpenseCategoryId),
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del concepto es obligatorio.')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.')
        .custom(validateUniqueConceptNameInCategory), // Valida unicidad DENTRO de la categoría
    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage('La descripción no debe exceder los 255 caracteres.'),
    body('requiresEmployeeCalculation')
        .exists({ checkFalsy: false }).withMessage('El campo requiresEmployeeCalculation es obligatorio.')
        .isBoolean().withMessage('requiresEmployeeCalculation debe ser un valor booleano.'),
    body('isBimonthly')
        .exists({ checkFalsy: false }).withMessage('El campo isBimonthly es obligatorio.')
        .isBoolean().withMessage('isBimonthly debe ser un valor booleano.'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).')
        .customSanitizer(value => { // Asegurar que sea booleano
            if (typeof value === 'string') return value.toLowerCase() === 'true';
            return !!value;
        })
];

const updateSpecificConceptSpentValidation = [
    param('idSpecificConcept')
        .isInt({ min: 1 }).withMessage('ID de concepto específico inválido.')
        .custom(validateSpecificConceptExistence),
    body('idExpenseCategory') // También opcional en update, pero si se provee, debe ser válido
        .optional()
        .isInt({ min: 1 }).withMessage('Si se provee idExpenseCategory, debe ser un entero positivo.')
        .custom(validateExpenseCategoryId),
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío si se proporciona.')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.')
        .custom(validateUniqueConceptNameInCategory), // Valida unicidad DENTRO de la categoría (nueva o existente)
    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage('La descripción no debe exceder los 255 caracteres.'),
    body('requiresEmployeeCalculation')
        .optional()
        .isBoolean().withMessage('requiresEmployeeCalculation debe ser un valor booleano.'),
    body('isBimonthly')
        .optional()
        .isBoolean().withMessage('isBimonthly debe ser un valor booleano.'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).')
        .customSanitizer(value => {
            if (typeof value === 'string') return value.toLowerCase() === 'true';
            return !!value;
        })
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
        .exists({ checkFalsy: false }).withMessage('El campo status es requerido.')
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
        .customSanitizer(value => {
            if (typeof value === 'string') return value.toLowerCase() === 'true';
            return !!value;
        })
];

const getAllSpecificConceptSpentsQueryValidation = [
    query('expenseCategoryId')
        .optional()
        .isInt({ min: 1 }).withMessage('expenseCategoryId (query param) debe ser un entero positivo si se provee.')
        .custom(async (value) => {
            const category = await ExpenseCategory.findByPk(value);
            if (!category) return Promise.reject('La categoría de gasto especificada para el filtro no existe.');
            return true;
        }),
    query('status')
        .optional()
        .customSanitizer(value => {
            if (typeof value === 'string') {
                const lower = value.toLowerCase();
                if (lower === 'true' || lower === '1') return true;
                if (lower === 'false' || lower === '0') return false;
            }
            return value;
        })
        .isBoolean().withMessage('status (query param) debe ser un valor booleano válido si se provee.'),
    query('requiresEmployeeCalculation')
        .optional()
        .customSanitizer(value => {
            if (typeof value === 'string') {
                const lower = value.toLowerCase();
                if (lower === 'true' || lower === '1') return true;
                if (lower === 'false' || lower === '0') return false;
            }
            return value;
        })
        .isBoolean().withMessage('requiresEmployeeCalculation (query param) debe ser un valor booleano válido si se provee.'),
    query('isBimonthly')
        .optional()
        .customSanitizer(value => {
             if (typeof value === 'string') {
                const lower = value.toLowerCase();
                if (lower === 'true' || lower === '1') return true;
                if (lower === 'false' || lower === '0') return false;
            }
            return value;
        })
        .isBoolean().withMessage('isBimonthly (query param) debe ser un valor booleano válido si se provee.'),
];

module.exports = {
    createSpecificConceptSpentValidation,
    updateSpecificConceptSpentValidation,
    getSpecificConceptSpentByIdValidation,
    deleteSpecificConceptSpentValidation,
    changeStateSpecificConceptSpentValidation,
    getAllSpecificConceptSpentsQueryValidation,
};