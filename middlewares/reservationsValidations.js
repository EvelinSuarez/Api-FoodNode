const { body, param } = require('express-validator');
const Reservations = require('../models/reservations'); // Ajusta ruta si es necesario
const { Op } = require('sequelize');
// Validar si la reserva existe por ID
const validateReservationsExistence = async (id) => {
    try {
        const reservations = await Reservations.findByPk(id);
        if (!reservations) {
            return Promise.reject('La reserva no existe');
        }
        return true;
    } catch (error) {
        console.error(`Error validating reservation existence for ID ${id}:`, error);
        return Promise.reject('Error al validar la existencia de la reserva');
    }
};

// Validar unicidad 
const validateUniqueReservations = async (body, { req }) => {
    const { idCustomers, dateTime } = body;

    if (!idCustomers || !dateTime) {
        throw new Error('El ID del cliente y la fecha/hora son obligatorios para validar la unicidad');
    }

    const idReservations = req.params.id || body.idReservations;

    const whereClause = {
        idCustomers,
        dateTime
    };

    if (idReservations) {
        whereClause.idReservations = { [Op.ne]: parseInt(idReservations) };
    }

    const existingReservations = await Reservations.findOne({
        where: whereClause
    });

    if (existingReservations) {
        throw new Error('Ya existe una reserva para este cliente en esta fecha y hora');
    }
};

// Verificar disponibilidad 

const checkRealTimeAvailability = async (dateTime, { req }) => {
    if (!dateTime) {
        throw new Error('La fecha y hora son obligatorias para verificar la disponibilidad');
    }

    const whereClause = { dateTime };
    const reservationId = req.params.id;

    if (reservationId) {
        whereClause.idReservations = { [Op.ne]: Number.parseInt(req.params.id) };
    }

    const existingReservations = await Reservations.findOne({ where: whereClause });

    if (existingReservations) {
        return Promise.reject("No hay disponibilidad de mesas en el horario seleccionado");
    }

    return true;
};
// Validaciones base para reservas 
const reservationsBaseValidation = [
    body('dateTime').isISO8601().withMessage('La fecha y hora deben tener un formato válido').custom(checkRealTimeAvailability),
    body('numberPeople').isInt({ min: 1 }).withMessage('El número de personas debe ser válido y mayor a cero'),
    body('matter').isLength({ min: 3, max: 100 }).withMessage('El asunto debe tener entre 3 y 100 caracteres'),
    body('timeDurationR').matches(/^\d{1,2}:\d{2}$/).withMessage('La duración del evento debe estar en formato HH:MM'), // <-- Ojo: ¿Permitía segundos antes?
    body('pass')
    .optional()
    .isArray().withMessage('Abonos debe ser un array')
    .custom((value) => {
        if (!Array.isArray(value)) {
            throw new Error('Abonos debe ser un array');
        }
  
        value.forEach((item, index) => {
            if (!item.fecha || !item.cantidad || isNaN(parseFloat(item.cantidad))) {
                throw new Error(`El abono en la posición ${index} debe tener una fecha y una cantidad válida`);
            }
        });
  
        return true;
    }).withMessage('Cada abono debe tener una fecha y una cantidad válida'),
    body('decorationAmount').isFloat({ min: 0 }).withMessage('El monto de decoración debe ser un valor numérico positivo'),
    body('remaining').isFloat({ min: 0 }).withMessage('El valor restante debe ser un valor numérico positivo'),
    body('evenType').isLength({ max: 60 }).withMessage('El tipo de evento debe tener máximo 60 caracteres'),
    body('totalPay').isFloat({ min: 0 }).withMessage('El total a pagar debe ser un valor numérico positivo'),
    body('paymentMethod').isLength({ max: 20 }).withMessage('La forma de pago debe tener máximo 20 caracteres'),
    body('status').isBoolean().withMessage('El estado debe ser un valor booleano').optional({ nullable: true }),
    body('idCustomers').isInt().withMessage('El ID del cliente debe ser un número entero'),
    // Mantenemos la validación original para UN SOLO servicio adicional opcional
    body('idAditionalServices')
    .optional()
    .isArray().withMessage('idAditionalServices debe ser un array')
    .custom((value) => value.every(Number.isInteger)).withMessage('Todos los elementos de idAditionalServices deben ser números enteros'),
];

// Validaciones para crear una reserva 
const createReservationsValidation = [
    ...reservationsBaseValidation,
    body().custom(validateUniqueReservations)
    
];

// Validación al actualizar una reserva 
// ¡¡OJO!! Revisa si el PK es 'id' o 'idReservations' en param('id')
const updateReservationsValidation = [
    ...reservationsBaseValidation,
    param('id').isInt().withMessage('El id debe ser un número entero').custom(validateReservationsExistence),
    // La forma de llamar a validateUniqueReservations aquí podría necesitar ajuste si PK es idReservations
    body().custom((value, { req }) => validateUniqueReservations(req.body, { req }))
];

// Validación al eliminar una reserva 
// ¡¡OJO!! Revisa si el PK es 'id' o 'idReservations'
const deleteReservationsValidation = [
    param('id').isInt().withMessage('El id debe ser un número entero').custom(validateReservationsExistence)
];

// Validaciones para obtener una reserva por ID 
// ¡¡OJO!! Revisa si el PK es 'id' o 'idReservations'
const getReservationsByIdValidation = [
    param('id')
        .isInt().withMessage('El id de la reserva debe ser un número entero')
        .custom(async (id) => {
            try {
                const reservation = await Reservations.findByPk(id);
                if (!reservation) {
                    return Promise.reject('La reserva no existe');
                }
                return true;
            } catch (error) {
                console.error(`Error validando existencia de reserva con ID ${id}:`, error);
                return Promise.reject('Error al validar la existencia de la reserva');
            }
        })
];
// Validaciones para cambiar el estado de una reserva 
// ¡¡OJO!! Revisa si el PK es 'idReservations' o 'id'
const changeStateValidation = [
    body('status').isBoolean().withMessage('El estado debe ser un booleano'),
    param('idReservations').isInt().withMessage('El id de la reserva debe ser un número entero').custom(validateReservationsExistence), // Usaba idReservations aquí
    // Tu validación original de actionConfirmed
    body('actionConfirmed').isBoolean().custom((value) => {
        if (!value) { throw new Error('No se puede cambiar el estado si la acción no ha sido confirmada'); }
        return true;
    })
];

// Validaciones para reprogramar una reserva 
// ¡¡OJO!! Revisa si el PK es 'idReservations' o 'id'
const reprogramReservationsValidation = [
    param('idReservations').isInt().withMessage('El id de la reserva debe ser un número entero').custom(validateReservationsExistence), // Usaba idReservations aquí
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
