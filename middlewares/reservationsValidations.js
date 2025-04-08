// middlewares/reservationsValidations.js

const { body, param } = require('express-validator');
const Reservations = require('../models/reservations'); // Ajusta ruta si es necesario
const { Op } = require('sequelize');
// const Customers = require('../models/customers'); // Necesario para validar existencia de cliente
// const AditionalServices = require('../models/aditionalServices'); // Necesario para validar existencia de servicios

// --- Funciones Helper (validateReservationsExistence, etc. SIN CAMBIOS) ---
const validateReservationsExistence = async (id) => { /* ... código anterior ... */ };
const validateUniqueReservations = async (value, { req }) => { /* ... código anterior ... */ };
const checkRealTimeAvailability = async (dateTime, { req }) => { /* ... código anterior ... */ };

// --- VALIDACIONES BASE PARA RESERVAS (AJUSTADAS) ---
const reservationsBaseValidation = [
    body('dateTime').trim().notEmpty().withMessage('Fecha/hora obligatoria').isISO8601().withMessage('Formato fecha/hora inválido')/*.custom(checkRealTimeAvailability)*/,
    body('numberPeople').isInt({ min: 1 }).withMessage('Nro. Personas > 0'),
    body('matter').trim().notEmpty().withMessage('Asunto obligatorio').isLength({ min: 3, max: 100 }).withMessage('Asunto 3-100 caracteres'),
    body('timeDurationR').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Duración HH:MM[:SS]'),
    body('pass').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('"Pass" numérico positivo'),
    body('decorationAmount').isFloat({ min: 0 }).withMessage('Monto Decoración >= 0'),
    body('remaining').isFloat({ min: 0 }).withMessage('Restante >= 0'),
    body('evenType').trim().notEmpty().withMessage('Tipo evento obligatorio').isLength({ max: 60 }).withMessage('Tipo evento máx 60'),
    body('totalPay').isFloat({ gt: 0 }).withMessage('Total Pagar > 0'),
    body('paymentMethod').trim().notEmpty().withMessage('Forma pago obligatoria').isLength({ max: 20 }).withMessage('Forma pago máx 20'),

    // --- CAMBIO: Validar customerId ---
    body('idCustomers') // <-- MANTENER 'idCustomers' si ese es el campo que espera/usa el backend en create/update
        .exists({checkFalsy: true}).withMessage('ID Cliente obligatorio')
        .isInt({ gt: 0 }).withMessage('ID Cliente inválido')
        // Descomentar si quieres validar existencia del cliente en BD
        // .custom(async (value) => { const customer = await Customers.findByPk(value); if (!customer) throw new Error('Cliente no encontrado'); })
    ,

    // --- CAMBIO: Validar serviceIds ---
    body('serviceIds')
        .optional()
        .isArray().withMessage('Servicios deben ser un array')
        // Asegurar que cada elemento sea entero positivo
        .custom((value) => {
             if (!Array.isArray(value)) return true; // Pasa si no es array (ya falló antes) o es opcional y no vino
             return value.every(id => Number.isInteger(id) && id > 0);
         }).withMessage('Cada ID de servicio debe ser un número entero positivo'),
         // Descomentar validación custom de existencia si la necesitas
         // .custom(async (ids) => { if (!ids || ids.length === 0) return; const count = await AditionalServices.count({ where: { idAditionalServices: { [Op.in]: ids } } }); if (count !== ids.length) throw new Error('Uno o más IDs de servicio no son válidos'); })

    // --- CAMBIO: Validar abonos ---
    body('abonos')
        .isArray({ min: 1 }).withMessage('Se requiere al menos un abono'),
    body('abonos.*.fecha')
        .notEmpty().withMessage('Fecha abono obligatoria')
        .isDate({ format: 'YYYY-MM-DD' }).withMessage('Formato fecha abono YYYY-MM-DD'),
    body('abonos.*.cantidad')
        .notEmpty().withMessage('Cantidad abono obligatoria')
        .isFloat({ gt: 0 }).withMessage('Cantidad abono > 0'),

    // --- CAMBIO: Añadir validación opcional para observaciones ---
    body('observaciones')
        .optional() // Hacerla opcional
        .isString().withMessage('Observaciones deben ser texto')
        .isLength({ max: 500 }).withMessage('Observaciones máx 500 caracteres') // Ajusta el límite
];

// --- VALIDACIONES ESPECÍFICAS POR RUTA ---
const createReservationsValidation = [ ...reservationsBaseValidation /* ... */ ];
const updateReservationsValidation = [ param('id').isInt({ gt: 0 }).custom(validateReservationsExistence), ...reservationsBaseValidation /* ... */ ];
const deleteReservationsValidation = [ param('id').isInt({ gt: 0 }).custom(validateReservationsExistence) ];
const getReservationsByIdValidation = [ param('id').isInt({ gt: 0 }).custom(validateReservationsExistence) ];
const changeStateValidation = [ /* ... */ ]; // Sin cambios aquí
const reprogramReservationsValidation = [ /* ... */ ]; // Sin cambios aquí

// --- EXPORTACIONES ---
module.exports = {
    createReservationsValidation, updateReservationsValidation, deleteReservationsValidation,
    getReservationsByIdValidation, changeStateValidation, reprogramReservationsValidation,
};