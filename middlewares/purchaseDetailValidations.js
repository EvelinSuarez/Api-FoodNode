const { body, param } = require('express-validator');
const PurchaseDetail = require('../models/purchaseDetail');
const RegisterPurchase = require('../models/registerPurchase'); 
const Supply = require('../models/supply'); 

// Validación para verificar si la compra existe
const validateRegisterPurchaseExistence = async (idPurchase) => {
    const registerPurchase = await RegisterPurchase.findByPk(idPurchase);
    if (!registerPurchase) {
        return Promise.reject('El registro de la compra no existe');
    }
};

// Validación para verificar si el insumo existe
const validateSupplyExistence = async (idSupplier) => {
    const supply = await Supply.findByPk(idSupplier);
    if (!supply) {
        return Promise.reject('El insumo no existe');
    }
};

// Validación para verificar si el detalle de compra existe
const validatePurchaseDetailExistence = async (idDetail) => {
    const detailPurchase = await PurchaseDetail.findByPk(idDetail);
    if (!detailPurchase) {
        return Promise.reject('El detalle de la compra - insumo no existe');
    }
};

// Validaciones base para el detalle de compra
const purchaseDetailBaseValidation = [
    body('idPurchase')
        .isInt({ min: 1 }).withMessage('El id de la compra debe ser un número entero positivo')
        .custom(validateRegisterPurchaseExistence),
    body('idSupplier')
        .isInt({ min: 1 }).withMessage('El id del insumo debe ser un número entero positivo')
        .custom(validateSupplyExistence),
    body('quantity')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo'),
    body('unitPrice')
        .isFloat({ min: 0.01 }).withMessage('El precio unitario debe ser un número decimal positivo mayor a 0'),
    body('subtotal')
        .isFloat({ min: 0.01 }).withMessage('El subtotal debe ser un número decimal positivo mayor a 0'),
    body('status')
        .isBoolean().withMessage('El estado debe ser un booleano'),
];

// Validación para crear un nuevo detalle de compra
const createPurchaseDetailValidation = [...purchaseDetailBaseValidation];

// Validación para actualizar un detalle de compra
const updatePurchaseDetailValidation = [
    param('idDetail')
        .isInt({ min: 1 }).withMessage('El ID del detalle debe ser un número entero positivo')
        .custom(validatePurchaseDetailExistence),
    ...purchaseDetailBaseValidation,
];

// Validación para eliminar un detalle de compra
const deletePurchaseDetailValidation = [
    param('idDetail')
        .isInt({ min: 1 }).withMessage('El ID del detalle debe ser un número entero positivo')
        .custom(validatePurchaseDetailExistence),
];

// Validación para obtener un detalle de compra por ID
const getPurchaseDetailByIdValidation = [
    param('idDetail')
        .isInt({ min: 1 }).withMessage('El ID del detalle debe ser un número entero positivo')
        .custom(validatePurchaseDetailExistence),
];

// Validación para cambiar el estado de un detalle de compra
const changeStateValidation = [
    param('idDetail')
        .isInt({ min: 1 }).withMessage('El ID del detalle debe ser un número entero positivo')
        .custom(validatePurchaseDetailExistence),
    body('status')
        .isBoolean().withMessage('El estado debe ser un booleano'),
];

module.exports = {
    createPurchaseDetailValidation,
    updatePurchaseDetailValidation,
    deletePurchaseDetailValidation,
    getPurchaseDetailByIdValidation,
    changeStateValidation,
};
