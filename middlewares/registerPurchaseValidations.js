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

// Validación para verificar si ya existe un registro con el mismo proveedor
const validateExistingPurchaseByProvider = async (idProvider, { req }) => {
    const existingPurchase = await RegisterPurchase.findOne({ where: { idProvider } });

    if (existingPurchase) {
        // Si ya existe, sumamos la cantidad en lugar de crear una nueva compra
        existingPurchase.totalAmount += req.body.totalAmount;
        await existingPurchase.save();
        return Promise.reject('Ya existe una compra con este proveedor, se ha actualizado el monto en el registro existente.');
    }
};

// Validaciones base para el registro de compra
const registerPurchaseBaseValidation = [
    body('idProvider')
        .isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número entero positivo')
        .custom(validateProviderExistence),
    body('purchaseDate')
        .isISO8601().withMessage('La fecha de compra debe ser válida (ISO 8601)'),
    body('totalAmount')
        .isInt({ min: 1 }).withMessage('El monto total debe ser un número entero positivo')
];

// Validación para crear una nueva compra (considera compras existentes con el mismo proveedor)
const createRegisterPurchaseValidation = [
    ...registerPurchaseBaseValidation,
    body('idProvider').custom(validateExistingPurchaseByProvider),
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

// Validación para cambiar el estado de una compra
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
