const { body, param, validationResult } = require('express-validator');
const Provider = require('../models/provider');

// Validar existencia de proveedor por ID
const validateProviderExistence = async (idProvider) => {
    const provider = await Provider.findByPk(idProvider);
    if (!provider) {
        return Promise.reject('El proveedor no existe');
    }
};

// Validar unicidad del NIT
const validateUniqueProviderNit = async (document) => {
    const provider = await Provider.findOne({ where: { document } });
    if (provider) {
        return Promise.reject('El NIT del proveedor ya existe');
    }
};

// Validaciones base para creación y actualización
const providerBaseValidation = [
    body('document')
        .isLength({ min: 2, max: 11 }).withMessage('El NIT debe tener entre 2 y 11 caracteres')
        .matches(/^\d+$/).withMessage('El NIT debe contener solo números'),
    body('documentType')
        .isLength({ min: 2, max: 30 }).withMessage('El tipo de documento debe tener entre 2 y 30 caracteres'),
    body('cellPhone')
        .matches(/^(\+?\d{1,4}[-.\s]?)?(\(?\d{2,3}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}$/)
        .withMessage('El celular debe tener entre 9 y 15 dígitos en un formato válido'),
    body('company')
        .isLength({ min: 3, max: 50 }).withMessage('El nombre de la empresa debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9\s\.\-]+$/).withMessage('El nombre de la empresa solo puede contener letras, números, espacios, puntos y guiones'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano')
];

// Validación para crear un proveedor
const createProviderValidation = [
    ...providerBaseValidation,
    body('document').custom(validateUniqueProviderNit)
];

// Validación para actualizar un proveedor
const updateProviderValidation = [
    param('idProvider')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    param('idProvider').custom(validateProviderExistence),
    ...providerBaseValidation
];

// Validación para eliminar un proveedor
const deleteProviderValidation = [
    param('idProvider')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    param('idProvider').custom(validateProviderExistence)
];

// Validación para obtener proveedor por ID
const getProviderByIdValidation = [
    param('idProvider')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    param('idProvider').custom(validateProviderExistence)
];

// Validación para cambiar el estado
const changeStateValidation = [
    param('idProvider')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateProviderExistence),
    body('status')
        .isBoolean().withMessage('El estado debe ser un valor booleano')
];

module.exports = {
    createProviderValidation,
    updateProviderValidation,
    deleteProviderValidation,
    getProviderByIdValidation,
    changeStateValidation,
};
