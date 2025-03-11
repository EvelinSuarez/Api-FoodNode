const { body, param, validationResult } = require('express-validator');
const ConceptSpent = require('../models/conceptSpent');

// Validación para asegurarnos de que el concepto de gasto exista
const validateConceptSpentExistence = async (idExpenseType) => {
    console.log(`Buscando concepto de gasto con ID: ${idExpenseType}`);
    const conceptSpent = await ConceptSpent.findByPk(idExpenseType);
    
    if (conceptSpent) {
        console.log(`Concepto de gasto encontrado: ${JSON.stringify(conceptSpent.toJSON())}`);
    } else {
        console.log('Concepto de gasto no encontrado');
    }
    
    if (!conceptSpent) {
        return Promise.reject('El concepto de gasto no existe');
    }
};

// Validación para asegurarnos de que el nombre del concepto de gasto sea único
const validateUniqueConceptSpentName = async (name) => {
    const conceptSpent = await ConceptSpent.findOne({ where: { name } });
    if (conceptSpent) {
        return Promise.reject('El concepto de gasto ya existe');
    }
};

// Validación base para el concepto de gasto
const conceptSpentBaseValidation = [
    body('name')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
        .matches(/^[a-zA-Z\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
    body('state').default(true).isBoolean().withMessage('El estado debe ser un booleano')
];

// Validación para crear un nuevo concepto de gasto
const createConceptSpentValidation = [
    ...conceptSpentBaseValidation,
    body('name').custom(validateUniqueConceptSpentName) // Verificar que el nombre del concepto de gasto sea único
];

// Validación para actualizar un concepto de gasto
const updateConceptSpentValidation = [
    param('idExpenseType')
        .isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idExpenseType').custom(validateConceptSpentExistence) // Verificar que el concepto de gasto exista
];

// Validación para eliminar un concepto de gasto
const deleteConceptSpentValidation = [
    param('idExpenseType')
        .isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idExpenseType').custom(validateConceptSpentExistence) // Verificar que el concepto de gasto exista
];

// Validación para obtener un concepto de gasto por ID
const getConceptSpentByIdValidation = [
    param('idExpenseType')
        .isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idExpenseType').custom(validateConceptSpentExistence) // Verificar que el concepto de gasto exista
];

// Validación para cambiar el estado de un concepto de gasto
const changeStateConceptSpentValidation = [
    body('state').isBoolean().withMessage('El estado debe ser un booleano'),
    param('idExpenseType')
        .isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idExpenseType').custom(validateConceptSpentExistence) // Verificar que el concepto de gasto exista
];

module.exports = {
    createConceptSpentValidation,
    updateConceptSpentValidation,
    deleteConceptSpentValidation,
    getConceptSpentByIdValidation,
    changeStateConceptSpentValidation,
};