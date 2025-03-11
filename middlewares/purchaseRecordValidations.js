const { body, param } = require('express-validator');
const PurchaseRecord = require('../models/purchaseRecord');
const Provider = require('../models/provider');

// Función para verificar si el proveedor existe
const validateProviderExistence = async (id) => {
    const provider = await Provider.findByPk(id);
    if (!provider) {
        return Promise.reject('El proveedor no existe');
    }
};

// Validación base para el registro de compra
const purchaseRecordBaseValidation = [
    body('idProvider').isInt().withMessage('El id del proveedor debe ser un número entero'),
    body('purchaseDate').isDate().withMessage('La fecha de compra debe ser una fecha válida'),
];

// Validación para crear un nuevo registro de compra
const createPurchaseRecordValidation = [
    ...purchaseRecordBaseValidation,
    body('idProvider').custom(validateProviderExistence), // Verificar que el proveedor exista
];

// Validación para actualizar un registro de compra
const updatePurchaseRecordValidation = [
    ...purchaseRecordBaseValidation,
    param('idPurchaseRecord').isInt().withMessage('El id debe ser un número entero'),
    param('idPurchaseRecord').custom(async (id) => {
        const purchaseRecord = await PurchaseRecord.findByPk(id);
        if (!purchaseRecord) {
            return Promise.reject('El registro de compra no existe');
        }
    }),
];

// Validación para eliminar un registro de compra
const deletePurchaseRecordValidation = [
    param('idPurchaseRecord').isInt().withMessage('El id debe ser un número entero'),
    param('idPurchaseRecord').custom(async (id) => {
        const purchaseRecord = await PurchaseRecord.findByPk(id);
        if (!purchaseRecord) {
            return Promise.reject('El registro de compra no existe');
        }
    }),
];

// Validación para obtener un registro de compra por id
const getPurchaseRecordByIdValidation = [
    param('idPurchaseRecord').isInt().withMessage('El id debe ser un número entero'),
    param('idPurchaseRecord').custom(async (id) => {
        const purchaseRecord = await PurchaseRecord.findByPk(id);
        if (!purchaseRecord) {
            return Promise.reject('El registro de compra no existe');
        }
    }),
];

// Validación para cambiar el estado de un registro de compra
const changeStateValidation = [
    body('status').isBoolean().withMessage('El estado debe ser un booleano'),
    param('idPurchaseRecord').isInt().withMessage('El id debe ser un número entero'),
    param('idPurchaseRecord').custom(async (id) => {
        const purchaseRecord = await PurchaseRecord.findByPk(id);
        if (!purchaseRecord) {
            return Promise.reject('El registro de compra no existe');
        }
    }),
];

module.exports = {
    createPurchaseRecordValidation,
    updatePurchaseRecordValidation,
    deletePurchaseRecordValidation,
    getPurchaseRecordByIdValidation,
    changeStateValidation,
};
