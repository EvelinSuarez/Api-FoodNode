const { body, param } = require('express-validator');
// Asegúrate de que los nombres de los modelos coincidan con los exportados en models/index.js
const { RegisterPurchase, Provider, Supply } = require('../models'); // CAMBIADO: Supplier a Supply

// Importar las categorías permitidas desde el modelo para mantener consistencia
const ALLOWED_PURCHASE_CATEGORIES = RegisterPurchase.ALLOWED_CATEGORIES;

// --- Funciones de Validación Reutilizables ---
const validateProviderExistence = async (idProviderInput) => {
    if (idProviderInput === undefined || idProviderInput === null) return; // Permite campos opcionales
    const provider = await Provider.findByPk(idProviderInput);
    if (!provider) {
        return Promise.reject('El proveedor especificado no existe.');
    }
    if (!provider.status) {
        return Promise.reject(`El proveedor ID ${idProviderInput} no está activo.`);
    }
};

const validateRegisterPurchaseExistence = async (idPurchaseInput) => {
    if (idPurchaseInput === undefined || idPurchaseInput === null) return; // Permite campos opcionales
    const purchase = await RegisterPurchase.findByPk(idPurchaseInput);
    if (!purchase) {
        return Promise.reject('La compra especificada no existe.');
    }
};

// CAMBIADO: Nombre de función y modelo usado
const validateSupplyExistence = async (idSupplyInput) => {
    if (idSupplyInput === undefined || idSupplyInput === null) return; // Permite campos opcionales
    const supply = await Supply.findByPk(idSupplyInput); // CAMBIADO: Modelo a Supply
    if (!supply) {
        return Promise.reject(`El insumo con ID ${idSupplyInput} no existe.`); // CAMBIADO: Mensaje
    }
    if (!supply.status) { // Es bueno verificar el estado del insumo también
        return Promise.reject(`El insumo con ID ${idSupplyInput} no está activo.`);
    }
};


// --- Validaciones Específicas (Para las rutas) ---
const validateIdParam = [
    param('idPurchase')
        .exists({ checkFalsy: true }).withMessage('El ID de la compra en la ruta es requerido.') // Más explícito
        .isInt({ min: 1 }).withMessage('El ID de la compra en la ruta debe ser un número entero positivo.')
        .bail() // Detiene la validación si falla aquí
        .custom(validateRegisterPurchaseExistence)
];

const registerPurchaseBaseValidationRules = [
    body('idProvider')
        .notEmpty().withMessage('El ID del proveedor es obligatorio.')
        .isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número entero positivo.')
        .bail()
        .custom(validateProviderExistence),
    body('purchaseDate')
        .notEmpty().withMessage('La fecha de compra es obligatoria.')
        .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de compra debe tener formato YYYY-MM-DD.')
        .toDate(), // Convierte a objeto Date para validaciones posteriores si es necesario
    body('category')
        .notEmpty().withMessage('La categoría es obligatoria.')
        .trim()
        .isIn(ALLOWED_PURCHASE_CATEGORIES).withMessage(`La categoría debe ser una de las siguientes: ${ALLOWED_PURCHASE_CATEGORIES.join(', ')}.`),
    body('invoiceNumber')
        .optional({ checkFalsy: true }) // Permite string vacío, null, undefined
        .isString().withMessage('El número de factura debe ser una cadena de texto.')
        .trim()
        .isLength({ max: 50 }).withMessage('El número de factura no puede exceder los 50 caracteres.'),
    body('receptionDate')
        .optional({ checkFalsy: true })
        .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de recepción debe tener formato YYYY-MM-DD.')
        .toDate()
        .custom((value, { req }) => {
            if (value && req.body.purchaseDate) { // Asegurarse que purchaseDate exista para comparar
                const purchaseDateObj = (req.body.purchaseDate instanceof Date) ? req.body.purchaseDate : new Date(req.body.purchaseDate);
                if (new Date(value) < purchaseDateObj) {
                    throw new Error('La fecha de recepción no puede ser anterior a la fecha de compra.');
                }
            }
            return true;
        }),
    body('observations')
        .optional({ checkFalsy: true })
        .isString().withMessage('Las observaciones deben ser una cadena de texto.')
        .trim()
        .isLength({ max: 1000 }).withMessage('Las observaciones no pueden exceder los 1000 caracteres.'), // Ejemplo de límite
    // Los montos (subtotalAmount, totalAmount) se calcularán en el backend por los hooks.
];

const createPurchaseWithDetailsValidationRules = [
    ...registerPurchaseBaseValidationRules,
    body('details')
        .notEmpty().withMessage('Se requiere al menos un detalle de compra.')
        .isArray({ min: 1 }).withMessage('Los detalles deben ser un arreglo con al menos un ítem.')
        .bail() // Detener si 'details' no es un array válido
        .custom((detailsArray, { req }) => { // Validar cada objeto dentro del array 'details'
            if (!Array.isArray(detailsArray)) { // Doble verificación por si acaso
                throw new Error('Los detalles deben ser un arreglo.');
            }
            for (const detail of detailsArray) {
                // Validación de idSupply
                if (detail.idSupply === undefined || detail.idSupply === null || String(detail.idSupply).trim() === '') {
                    throw new Error('Cada detalle debe incluir un idSupply.');
                }
                const idSupplyNum = Number(detail.idSupply);
                if (isNaN(idSupplyNum) || idSupplyNum < 1 || !Number.isInteger(idSupplyNum)) {
                    throw new Error('Cada idSupply en los detalles debe ser un número entero positivo.');
                }

                // Validación de quantity
                if (detail.quantity === undefined || detail.quantity === null || String(detail.quantity).trim() === '') {
                    throw new Error('Cada detalle debe incluir una quantity.');
                }
                const quantityNum = Number(detail.quantity);
                if (isNaN(quantityNum) || quantityNum <= 0) {
                    // Considera si permites decimales aquí (isFloat) o solo enteros (isInt)
                    throw new Error('Cada quantity en los detalles debe ser un número positivo.');
                }

                // Validación de unitPrice
                if (detail.unitPrice === undefined || detail.unitPrice === null || String(detail.unitPrice).trim() === '') {
                    throw new Error('Cada detalle debe incluir un unitPrice.');
                }
                const unitPriceNum = Number(detail.unitPrice);
                if (isNaN(unitPriceNum) || unitPriceNum < 0) {
                    throw new Error('Cada unitPrice en los detalles debe ser un número no negativo.');
                }
            }
            return true; // Si todas las validaciones dentro del bucle pasan
        }),
    // Validación de existencia de cada idSupply (Opcional aquí, mejor en el servicio/controlador)
    // Si decides hacerlo aquí, necesitarías hacerlo async y llamar a validateSupplyExistence.
    // Ejemplo (si se decide validar existencia aquí):
    /*
    body('details.*.idSupply')
        .custom(async (idSupplyValue) => {
            // Esta validación individual se ejecutaría por cada idSupply en el array
            // validateSupplyExistence ya maneja undefined/null, pero el custom anterior ya lo valida.
            return validateSupplyExistence(idSupplyValue);
        }),
    */
];


const updatePurchaseHeaderValidationRules = [
    // Para campos opcionales, solo validamos si están presentes
    body('idProvider')
        .optional() // Ya no se usa { checkFalsy: true } con las versiones más nuevas, .optional() es suficiente
        .isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número entero positivo.')
        .bail()
        .custom(validateProviderExistence),
    body('purchaseDate')
        .optional()
        .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de compra debe tener formato YYYY-MM-DD.')
        .toDate(),
    body('category')
        .optional()
        .trim()
        .isIn(ALLOWED_PURCHASE_CATEGORIES).withMessage(`La categoría debe ser una de las siguientes: ${ALLOWED_PURCHASE_CATEGORIES.join(', ')}.`),
    body('invoiceNumber')
        .optional({ nullable: true, checkFalsy: true }) // Permitir explícitamente null o string vacío
        .isString().withMessage('El número de factura debe ser una cadena.')
        .trim()
        .isLength({ max: 50 }).withMessage('El número de factura no puede exceder los 50 caracteres.'),
    body('receptionDate')
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de recepción debe tener formato YYYY-MM-DD.')
        .toDate()
        .custom(async (value, { req }) => { // Hacer async si necesitas consultar la compra original
            if (value) { // Solo validar si receptionDate se está proporcionando
                let purchaseDateToCompare;
                if (req.body.purchaseDate) {
                    purchaseDateToCompare = (req.body.purchaseDate instanceof Date) ? req.body.purchaseDate : new Date(req.body.purchaseDate);
                } else if (req.params && req.params.idPurchase) {
                    // Si purchaseDate no está en el body, obtenerla de la compra existente
                    const existingPurchase = await RegisterPurchase.findByPk(req.params.idPurchase, { attributes: ['purchaseDate'] });
                    if (existingPurchase && existingPurchase.purchaseDate) {
                        purchaseDateToCompare = new Date(existingPurchase.purchaseDate);
                    }
                }

                if (purchaseDateToCompare && new Date(value) < purchaseDateToCompare) {
                    throw new Error('La fecha de recepción no puede ser anterior a la fecha de compra.');
                }
            }
            return true;
        }),
    body('observations')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Las observaciones deben ser una cadena.')
        .trim()
        .isLength({ max: 1000 }).withMessage('Las observaciones no pueden exceder los 1000 caracteres.'),
    body('status')
        .optional()
        .isString().withMessage('El estado debe ser una cadena de texto.')
        .trim()
        .toUpperCase() // Convertir a mayúsculas para consistencia con ENUMs/valores definidos
        .isIn(['PENDIENTE', 'RECIBIDA_PARCIAL', 'RECIBIDA_COMPLETA', 'PAGADA', 'CANCELADA']).withMessage('El valor del estado no es válido.'),
    body('paymentStatus')
        .optional()
        .isString().withMessage('El estado de pago debe ser una cadena de texto.')
        .trim()
        .toUpperCase()
        .isIn(['NO_PAGADA', 'PAGADA_PARCIAL', 'PAGADA']).withMessage('El valor del estado de pago no es válido.'),
    // Asegurarse de que no se envíen campos no permitidos o que los detalles no se puedan actualizar por esta ruta
    body('details').not().exists().withMessage('Los detalles de la compra no se pueden modificar a través de esta ruta.'),
];

const changeStateValidationRules = [ // Renombrado para claridad
    // validateIdParam ya cubre esto, pero si se usa solo:
    param('idPurchase')
        .exists({ checkFalsy: true }).withMessage('El ID de la compra en la ruta es requerido.')
        .isInt({ min: 1 }).withMessage('El ID de la compra debe ser un número entero positivo.')
        .bail()
        .custom(validateRegisterPurchaseExistence),
    body('status')
       .optional()
       .isString().withMessage('El estado debe ser una cadena de texto.')
       .trim()
       .toUpperCase()
       .isIn(['PENDIENTE', 'RECIBIDA_PARCIAL', 'RECIBIDA_COMPLETA', 'PAGADA', 'CANCELADA']).withMessage('El valor del estado no es válido.'),
    body('paymentStatus')
       .optional()
       .isString().withMessage('El estado de pago debe ser una cadena de texto.')
       .trim()
       .toUpperCase()
       .isIn(['NO_PAGADA', 'PAGADA_PARCIAL', 'PAGADA']).withMessage('El valor del estado de pago no es válido.'),
    body().custom((value, { req }) => {
        if (req.body.status === undefined && req.body.paymentStatus === undefined) {
            throw new Error('Debe proporcionar al menos un nuevo estado (status o paymentStatus) para actualizar.');
        }
        return true;
    })
];

module.exports = {
    validateIdParam,
    createPurchaseWithDetailsValidationRules,
    updatePurchaseHeaderValidationRules,
    changeStateValidationRules, // Renombrado
    // No es necesario exportar ALLOWED_PURCHASE_CATEGORIES si solo se usa internamente
};