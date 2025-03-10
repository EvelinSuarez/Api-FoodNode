const { body, param } = require('express-validator');
const Reservations = require('../models/reservations');
const { Op } = require('sequelize');

// Validar si la reserva existe por ID
const validateReservationsExistence = async (id) => {
    const reservations = await Reservations.findByPk(id);
    if (!reservations) {
        return Promise.reject('La reserva no existe');
    }
};

// Validar si ya existe una reserva con la misma fecha, hora y cliente
const validateUniqueReservations = async ({ idCustomers, dateTime, idReservations }) => {
    const existingReservations = await Reservations.findOne({
        where: {
            idCustomers,
            dateTime,
            idReservations: { [Op.ne]: idReservations } // Ignorar la reserva actual
        }
    });

    if (existingReservations) {
        return Promise.reject('Ya existe una reserva para este cliente en esta fecha y hora');
    }
};

// Verificar disponibilidad de mesas
const checkRealTimeAvailability = async (dateTime, { req }) => {
    const existingReservations = await Reservations.findOne({
        where: {
            dateTime,
            idReservations: { [Op.ne]: req.params.id } // Ignorar la reserva que se está editando
        }
    });

    if (existingReservations) {
        return Promise.reject('No hay disponibilidad de mesas en el horario seleccionado');
    }
};

// Validaciones base para reservas (ajustadas a los campos del modelo)
const reservationsBaseValidation = [
    body('dateTime').isISO8601().withMessage('La fecha y hora deben tener un formato válido').custom(checkRealTimeAvailability),
    body('numberPeople').isInt({ min: 1 }).withMessage('El número de personas debe ser válido y mayor a cero'),
    body('matter').isLength({ min: 3, max: 100 }).withMessage('El asunto debe tener entre 3 y 100 caracteres'),
    body('timeDurationR').matches(/^\d{1,2}:\d{2}$/).withMessage('La duración del evento debe estar en formato HH:MM'),
    body('pass').isFloat({ min: 0 }).withMessage('El abono debe ser un valor numérico positivo'),
    body('decorationAmount').isFloat({ min: 0 }).withMessage('El monto de decoración debe ser un valor numérico positivo'),
    body('remaining').isFloat({ min: 0 }).withMessage('El valor restante debe ser un valor numérico positivo'),
    body('evenType').isLength({ max: 60 }).withMessage('El tipo de evento debe tener máximo 60 caracteres'),
    body('totalPay').isFloat({ min: 0 }).withMessage('El total a pagar debe ser un valor numérico positivo'),
    body('paymentMethod').isLength({ max: 20 }).withMessage('La forma de pago debe tener máximo 20 caracteres'),
    body('status').isBoolean().withMessage('El estado debe ser un valor booleano').optional({ nullable: true }),
    body('idCustomers').isInt().withMessage('El ID del cliente debe ser un número entero'),
    body('idAditionalServices').isInt().optional().withMessage('El ID de servicios adicionales debe ser un número entero')
];

// Validaciones para crear una reserva
const createReservationsValidation = [
    ...reservationsBaseValidation,
    body().custom(validateUniqueReservations)
];

// Validación al actualizar una reserva
const updateReservationsValidation = [
    ...reservationsBaseValidation,
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(validateReservationsExistence),
    body().custom((body, { req }) => validateUniqueReservations({ ...body, idReservations: req.params.id }))
];

// Validación al eliminar una reserva
const deleteReservationsValidation = [
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(validateReservationsExistence)
];

// Validaciones para obtener una reserva por ID
const getReservationsByIdValidation = [
    param('id').isInt().withMessage('El id de la reserva debe ser un número entero'),
    param('id').custom(validateReservationsExistence)
];

// Validaciones para cambiar el estado de una reserva
const changeStateValidation = [
    body('status').isBoolean().withMessage('El estado debe ser un booleano'),
    param('idReservations').isInt().withMessage('El id de la reserva debe ser un número entero'),
    param('idReservations').custom(validateReservationsExistence),
    body('actionConfirmed').isBoolean().custom((value) => {
        if (!value) {
            throw new Error('No se puede cambiar el estado si la acción no ha sido confirmada');
        }
        return true;
    })
];

// Validaciones para reprogramar una reserva
const reprogramReservationsValidation = [
    param('idReservations').isInt().withMessage('El id de la reserva debe ser un número entero'),
    param('idReservations').custom(validateReservationsExistence),
    body('dateTime').isISO8601().withMessage('La fecha y hora deben tener un formato válido').custom(checkRealTimeAvailability)
];

module.exports = {
    createReservationsValidation,
    updateReservationsValidation,
    deleteReservationsValidation,
    getReservationsByIdValidation,
    changeStateValidation,
    reprogramReservationsValidation
};
