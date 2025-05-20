// middlewares/conceptSpentValidations.js (NUEVO - para conceptos específicos)
const { body, param, query } = require('express-validator');
const ConceptSpent = require('../models/ConceptSpent'); // El NUEVO modelo
const ExpenseType = require('../models/ExpenseType');   // Para validar existencia de ExpenseType

const validateConceptSpentExistence = async (idConceptSpent) => {
    const concept = await ConceptSpent.findByPk(idConceptSpent);
    if (!concept) {
        return Promise.reject('El concepto de gasto específico no existe.');
    }
};

const validateExpenseTypeGeneralExistenceForConcept = async (idExpenseType) => {
    if (!idExpenseType) return true; // Si no se provee, no se valida aquí
    const expenseType = await ExpenseType.findByPk(idExpenseType);
    if (!expenseType) {
        return Promise.reject('El tipo de gasto general (idExpenseType) asignado no existe.');
    }
};

// Opcional: Validar unicidad de nombre dentro de un idExpenseType
const validateUniqueNameInExpenseType = async (name, { req }) => {
    const idExpenseType = req.body.idExpenseType || (req.conceptToUpdate ? req.conceptToUpdate.idExpenseType : null);
    if (!idExpenseType || !name) return true; // Si falta alguno, otras validaciones lo manejarán

    const queryOptions = { where: { name, idExpenseType } };
    if (req.params.idConceptSpent) { // Si es una actualización, excluir el actual
        queryOptions.where.idConceptSpent = { [require('sequelize').Op.ne]: req.params.idConceptSpent };
    }
    const concept = await ConceptSpent.findOne(queryOptions);
    if (concept) {
        return Promise.reject('Ya existe un concepto con este nombre para el tipo de gasto general seleccionado.');
    }
};


const createConceptSpentValidation = [
    body('idExpenseType')
        .notEmpty().withMessage('idExpenseType es obligatorio.')
        .isInt({ min: 1 }).withMessage('idExpenseType debe ser un entero positivo.')
        .custom(validateExpenseTypeGeneralExistenceForConcept),
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del concepto es obligatorio.')
        .isLength({ min: 3, max: 150 }).withMessage('El nombre debe tener entre 3 y 150 caracteres.')
        .custom(validateUniqueNameInExpenseType), // Opcional
    body('requiresEmployeeCalculation')
        .notEmpty().withMessage('requiresEmployeeCalculation es obligatorio.')
        .isBoolean().withMessage('requiresEmployeeCalculation debe ser un valor booleano (true/false).'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
];

const updateConceptSpentValidation = [
    param('idConceptSpent')
        .isInt({ min: 1 }).withMessage('ID de concepto inválido.')
        .custom(async (value, { req }) => { // Adjuntar el concepto para usarlo en validaciones posteriores
            const concept = await ConceptSpent.findByPk(value);
            if (!concept) return Promise.reject('El concepto de gasto específico no existe.');
            req.conceptToUpdate = concept; // Guardar para referencia
        }),
    body('idExpenseType')
        .optional() // Permitir que no se envíe si no se quiere cambiar
        .isInt({ min: 1 }).withMessage('idExpenseType debe ser un entero positivo.')
        .custom(validateExpenseTypeGeneralExistenceForConcept),
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre del concepto es obligatorio.')
        .isLength({ min: 3, max: 150 }).withMessage('El nombre debe tener entre 3 y 150 caracteres.')
        .custom(validateUniqueNameInExpenseType), // Opcional
    body('requiresEmployeeCalculation')
        .optional()
        .isBoolean().withMessage('requiresEmployeeCalculation debe ser un valor booleano (true/false).'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
];

const getConceptSpentByIdValidation = [
    param('idConceptSpent')
        .isInt({ min: 1 }).withMessage('ID de concepto inválido.')
        .custom(validateConceptSpentExistence)
];

const deleteConceptSpentValidation = [
    param('idConceptSpent')
        .isInt({ min: 1 }).withMessage('ID de concepto inválido.')
        .custom(validateConceptSpentExistence)
];

const changeStateConceptSpentValidation = [
    param('idConceptSpent')
        .isInt({ min: 1 }).withMessage('ID de concepto inválido.')
        .custom(validateConceptSpentExistence),
    body('status')
        .exists().withMessage('El campo status es requerido.')
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
];

// Para la ruta GET /conceptSpent (filtrado opcional)
const getAllConceptSpentsValidation = [
    query('idExpenseType').optional().isInt({ min: 1 }).withMessage('idExpenseType debe ser un entero positivo si se provee.'),
    query('status').optional().isBoolean().withMessage('status debe ser booleano si se provee.'),
    query('requiresEmployeeCalculation').optional().isBoolean().withMessage('requiresEmployeeCalculation debe ser booleano si se provee.'),
];


module.exports = {
    createConceptSpentValidation,
    updateConceptSpentValidation,
    getConceptSpentByIdValidation,
    deleteConceptSpentValidation,
    changeStateConceptSpentValidation,
    getAllConceptSpentsValidation,
};