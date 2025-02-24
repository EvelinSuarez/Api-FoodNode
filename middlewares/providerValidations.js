const { body, param, validationResult } = require('express-validator');
const Provider = require('../models/provider');

const validateProviderExistence = async (id) => {
    const provider = await Provider.findByPk(id);
    if (!provider) {
        return Promise.reject('El proveedor no existe');
    }
}

const validateUniqueProviderName = async (company) => {
    const provider = await Provider.findOne({ where: { company } });
    if (provider) {
        return Promise.reject('El proveedor ya existe');
    }
}

const providerBaseValidation = [
    body('company').isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    body('state').default(true).isBoolean().withMessage('El estado debe ser un booleano')
];

const createProviderValidation = [
    ...providerBaseValidation,
    body('company').custom(validateUniqueProviderName)
];

const updateProviderValidation = [
    ...providerBaseValidation,
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(validateProviderExistence)
];

const deleteProviderValidation = [
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(validateProviderExistence)
];

const getProviderByIdValidation = [
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(validateProviderExistence)
];

const changeStateValidation = [
    body('state').isBoolean().withMessage('El estado debe ser un booleano'),
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(validateProviderExistence)
];

module.exports = {
    createProviderValidation,
    updateProviderValidation,
    deleteProviderValidation,
    getProviderByIdValidation,
    changeStateValidation,
}; 
