const { body, param, validationResult } = require('express-validator');
const Provider = require('../models/provider');

const validateProviderExistence = async (idProvider) => {
    console.log(`Buscando proveedor con ID: ${idProvider}`);
    const provider = await Provider.findByPk(idProvider);
    
    if (provider) {
        console.log(`Proveedor encontrado: ${JSON.stringify(provider.toJSON())}`);
    } else {
        console.log('Proveedor no encontrado');
    }
    
    if (!provider) {
        return Promise.reject('El proveedor no existe');
    }
}


const validateUniqueProviderNit = async (document) => {
    const provider = await Provider.findOne({ where: { document } });
    if (provider) {
        return Promise.reject('El NIT del proveedor ya existe');
    }
}

const providerBaseValidation = [
    body('document')
        .isLength({ min: 3 }).withMessage('El NIT debe tener al menos 3 caracteres')
        .matches(/^\d+$/).withMessage('El NIT debe ser numérico'),
    body('documentType')
        .isLength({ min: 3 }).withMessage('El tipo de documento debe tener al menos 3 caracteres'),
    body('cellPhone')
        .matches(/^(\+?\d{1,4}[-.\s]?)?(\(?\d{2,3}\)?[-.\s]?)?\d{4}[-.\s]?\d{4}$/)  // Permitirá guiones, puntos y espacios
        .withMessage('El celular debe ser un número válido con entre 9 y 15 caracteres, incluyendo guiones, puntos o espacios'),
    body('company')
        .isLength({ min: 3 }).withMessage('El nombre de la empresa debe tener al menos 3 caracteres')
        .matches(/^[a-zA-Z0-9\s\.\-]+$/).withMessage('El nombre de la empresa solo puede contener letras, números, guiones y puntos'),
    body('state').default(true).isBoolean().withMessage('El estado debe ser un booleano')
];

// Validación para crear un proveedor
const createProviderValidation = [
    ...providerBaseValidation,
    body('document').custom(validateUniqueProviderNit) // Validación para evitar NIT duplicado
];

// Validación para actualizar un proveedor
const updateProviderValidation = [
    param('idProvider')
        .isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idProvider').custom(validateProviderExistence), // Verificar si el proveedor existe
    // Agregar aquí las validaciones para los otros campos del cuerpo si es necesario
];

// Validación para eliminar un proveedor
const deleteProviderValidation = [
    param('idProvider').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idProvider').custom(validateProviderExistence) // Verificar si el proveedor existe
];

// Validación para obtener un proveedor por su ID
const getProviderByIdValidation = [
    param('idProvider').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idProvider').custom(validateProviderExistence) // Verificar si el proveedor existe
];

// Validación para cambiar el estado de un proveedor
const changeStateValidation = [
    body('state').isBoolean().withMessage('El estado debe ser un booleano'),
    param('idProvider').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idProvider').custom(validateProviderExistence) // Verificar si el proveedor existe
];

module.exports = {
    createProviderValidation,
    updateProviderValidation,
    deleteProviderValidation,
    getProviderByIdValidation,
    changeStateValidation,
};
