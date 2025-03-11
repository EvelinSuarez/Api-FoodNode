const { body, param } = require('express-validator');
const RegisterPurchase = require('../models/registerPurchase');
const Provider = require('../models/provider');

// Validación para verificar si el proveedor existe
const validateProviderExistence = async (idProvider) => {
    const provider = await Provider.findByPk(idProvider);
    if (!provider) {
        return Promise.reject('El proveedor no existe');
    }
};

// Validación para verificar si la compra existe
const validateRegisterPurchaseExistence = async (idPurchase) => {
    const purchase = await RegisterPurchase.findByPk(idPurchase);
    if (!purchase) {
        return Promise.reject('La compra no existe');
    }
};

// Validaciones base para el registro de compra
const registerPurchaseBaseValidation = [
    body('idProvider')
        .isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número entero positivo')
        .custom(validateProviderExistence), // Verifica si existe el proveedor
    body('purchaseDate')
        .isISO8601().withMessage('La fecha de compra debe ser válida (ISO 8601)'),
    body('totalAmount')
        .isInt({ min: 1 }).withMessage('El monto total debe ser un número entero positivo')
];

// Validación para crear una nueva compra
const createRegisterPurchaseValidation = [
    ...registerPurchaseBaseValidation,
];

// Validación para actualizar una compra
const updateRegisterPurchaseValidation = [
    param('idPurchase')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateRegisterPurchaseExistence),
    ...registerPurchaseBaseValidation,
];

// Validación para eliminar una compra
const deleteRegisterPurchaseValidation = [
    param('idPurchase')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateRegisterPurchaseExistence),
];

// Validación para obtener una compra por ID
const getRegisterPurchaseByIdValidation = [
    param('idPurchase')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateRegisterPurchaseExistence),
];

const changeStateValidation = [
    param('idPurchase')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateRegisterPurchaseExistence),
    body('status')
        .isBoolean().withMessage('El estado debe ser un booleano'),
];

module.exports = {
    createRegisterPurchaseValidation,
    updateRegisterPurchaseValidation,
    deleteRegisterPurchaseValidation,
    getRegisterPurchaseByIdValidation,
    changeStateValidation
};
