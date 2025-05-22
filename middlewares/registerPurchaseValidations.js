// middlewares/registerPurchaseValidations.js
const { body, param } = require('express-validator');
const { RegisterPurchase, Provider } = require('../models'); // Asume models/index.js o una configuración similar

// --- Funciones de Validación Reutilizables ---
const validateProviderExistence = async (idProviderInput) => {
    // idProviderInput ya debería ser un número debido a .isInt() previo en la cadena de validación
    if (idProviderInput === undefined || idProviderInput === null) return; // Dejar que notEmpty maneje esto
    const provider = await Provider.findByPk(idProviderInput);
    if (!provider) {
        return Promise.reject('El proveedor especificado no existe.');
    }
};

const validateRegisterPurchaseExistence = async (idPurchaseInput) => {
    // idPurchaseInput ya debería ser un número debido a .isInt() previo
    if (idPurchaseInput === undefined || idPurchaseInput === null) return;
    const purchase = await RegisterPurchase.findByPk(idPurchaseInput);
    if (!purchase) {
        return Promise.reject('La compra especificada no existe.');
    }
};

// --- Validaciones Específicas (Para las rutas) ---

const validateIdParam = [
    param('idPurchase')
        .isInt({ min: 1 }).withMessage('El ID de la compra en la ruta debe ser un número entero positivo.')
        .bail() // Detener si no es un entero válido
        .custom(validateRegisterPurchaseExistence) // Validar existencia después de confirmar que es un ID válido
];

const registerPurchaseBaseValidationRules = [
    body('idProvider')
        .notEmpty().withMessage('El ID del proveedor es obligatorio.')
        .isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número entero positivo.')
        .bail()
        .custom(validateProviderExistence),
    body('purchaseDate')
        .notEmpty().withMessage('La fecha de compra es obligatoria.')
        .isISO8601().withMessage('La fecha de compra debe tener un formato válido (YYYY-MM-DD).')
        .toDate(),
    body('category') // <--- VALIDACIÓN PARA CATEGORY
        .notEmpty().withMessage('La categoría es obligatoria.')
        .isString().withMessage('La categoría debe ser una cadena de texto.')
        .trim()
        .isLength({ min: 1, max: 255 }).withMessage('La categoría debe tener entre 1 y 255 caracteres.'),
    body('totalAmount')
        .notEmpty().withMessage('El monto total es obligatorio.')
        .isFloat({ min: 0.00 }).withMessage('El monto total debe ser un número positivo o cero.')
        .toFloat(),
    body('details')
        .isArray({ min: 1 }).withMessage('Se requiere al menos un detalle de compra.')
        .custom((details) => {
            if (!Array.isArray(details)) return false; // Redundante por isArray, pero seguro
            for (const detail of details) {
                if (
                    !detail.idInsumo || typeof detail.idInsumo !== 'number' || detail.idInsumo < 1 ||
                    detail.quantity === undefined || typeof detail.quantity !== 'number' || detail.quantity <= 0 ||
                    detail.unitPrice === undefined || typeof detail.unitPrice !== 'number' || detail.unitPrice < 0
                ) {
                    throw new Error('Cada detalle debe incluir idInsumo (número > 0), quantity (número > 0) y unitPrice (número >= 0).');
                }
            }
            return true;
        })
];

const validateCreateOrUpdatePurchase = [
    ...registerPurchaseBaseValidationRules
    // No se necesita validación de ID de compra en el body para POST
];

const validateUpdatePurchase = [
    param('idPurchase') // Validar primero el ID de la ruta
        .isInt({ min: 1 }).withMessage('El ID de la compra en la ruta debe ser un número entero positivo.')
        .bail()
        .custom(validateRegisterPurchaseExistence),
    ...registerPurchaseBaseValidationRules, // Luego, las mismas reglas para el cuerpo
];

const changeStateValidation = [
    param('idPurchase')
        .isInt({ min: 1 }).withMessage('El ID de la compra debe ser un número entero positivo.')
        .bail()
        .custom(validateRegisterPurchaseExistence),
    body('status')
       .notEmpty().withMessage('El estado es obligatorio.')
       .isString().withMessage('El estado debe ser una cadena de texto.')
       .trim()
       // Ajusta estos valores a los estados permitidos en tu aplicación
       .isIn(['PENDIENTE', 'ACTIVO', 'COMPLETADO', 'CANCELADO']).withMessage('El valor del estado no es válido.'),
];

module.exports = {
    validateIdParam,
    validateCreateOrUpdatePurchase,
    validateUpdatePurchase,
    changeStateValidation
};