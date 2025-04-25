// middlewares/registerPurchaseValidations.js
const { body, param } = require('express-validator');
const { RegisterPurchase, Provider } = require('../models'); // Asume models/index.js

// --- Funciones de Validación Reutilizables ---
// (validateProviderExistence y validateRegisterPurchaseExistence se mantienen igual)
const validateProviderExistence = async (idProvider) => {
    // ... (código existente)
    if (!idProvider) return;
    const provider = await Provider.findByPk(idProvider);
    if (!provider) {
        return Promise.reject('El proveedor especificado no existe');
    }
};

const validateRegisterPurchaseExistence = async (idPurchase) => {
    // ... (código existente)
    if (!idPurchase) return;
    const purchase = await RegisterPurchase.findByPk(idPurchase);
    if (!purchase) {
        return Promise.reject('La compra especificada no existe');
    }
};


// --- Validaciones Específicas (Para las rutas) ---

// Validación solo para el ID en el parámetro (usada en GET por ID y DELETE)
const validateIdParam = [
    param('idPurchase')
        .isInt({ min: 1 }).withMessage('El ID de la compra en la ruta debe ser un número entero positivo.')
        // Opcional: Añadir la validación de existencia si se requiere *antes* de llegar al controlador
        // .custom(validateRegisterPurchaseExistence) // Descomentar si es necesario
];

// Validación base (reutilizable) - Sin cambios
const registerPurchaseBaseValidationRules = [
    // ... (código existente para idProvider, purchaseDate, totalAmount, details)
    body('idProvider')
        .notEmpty().withMessage('El ID del proveedor es obligatorio.')
        .isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número entero positivo.')
        .custom(validateProviderExistence),
    body('purchaseDate')
        .notEmpty().withMessage('La fecha de compra es obligatoria.')
        .isISO8601().withMessage('La fecha de compra debe tener un formato válido (YYYY-MM-DD).')
        .toDate(),
    body('totalAmount')
        .notEmpty().withMessage('El monto total es obligatorio.')
        .isFloat({ min: 0 })
        .withMessage('El monto total debe ser un número positivo o cero.')
        .toFloat(),
    body('details')
        .isArray({ min: 1 }).withMessage('Se requiere al menos un detalle de compra.')
        .custom((details) => {
            if (!Array.isArray(details)) return false; // Redundante por isArray, pero seguro
            for (const detail of details) {
                // console.log("Validando Detalle Backend:", detail);
                if (
                    !detail.idInsumo || typeof detail.idInsumo !== 'number' || detail.idInsumo < 1 ||
                    detail.quantity === undefined || typeof detail.quantity !== 'number' || detail.quantity <= 0 ||
                    detail.unitPrice === undefined || typeof detail.unitPrice !== 'number' || detail.unitPrice < 0
                ) {
                    // console.error("Falló validación de detalle:", detail);
                    throw new Error('Cada detalle debe incluir idInsumo (número > 0), quantity (número > 0) y unitPrice (número >= 0).');
                }
            }
            return true;
        })
];

// Validación para CREAR o ACTUALIZAR (usada en POST)
const validateCreateOrUpdatePurchase = [
    ...registerPurchaseBaseValidationRules
    // No se necesita validación de ID aquí ya que es para POST
];

// Validación para ACTUALIZAR específicamente (usada en PUT)
const validateUpdatePurchase = [
    // Primero valida el parámetro de ruta
    param('idPurchase')
        .isInt({ min: 1 }).withMessage('El ID de la compra en la ruta debe ser un número entero positivo.')
        .custom(validateRegisterPurchaseExistence), // Importante para PUT: asegurar que existe
    // Luego aplica las validaciones base al cuerpo
    ...registerPurchaseBaseValidationRules,
];

// Validación para CAMBIAR ESTADO (usada en PATCH) - Sin cambios necesarios en la definición
const changeStateValidation = [
    param('idPurchase')
        .isInt({ min: 1 }).withMessage('El ID de la compra debe ser un número entero positivo.')
        .custom(validateRegisterPurchaseExistence),
    body('status')
       .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).')
       .toBoolean(),
];


// --- EXPORTACIONES CORREGIDAS ---
// Exporta con los nombres que se usan en registerPurchaseRoutes.js
module.exports = {
    validateIdParam,                // Para GET /:id y DELETE /:id
    validateCreateOrUpdatePurchase, // Para POST /
    validateUpdatePurchase,         // Para PUT /:id
    changeStateValidation           // Para PATCH /:id/state
    // Ya no necesitas exportar las otras variaciones si no las usas directamente
};