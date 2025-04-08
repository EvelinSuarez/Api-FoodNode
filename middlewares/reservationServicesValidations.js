const { body, param } = require('express-validator');
const Reservations = require('../models/reservations');
const AditionalServices = require('../models/aditionalServices');

// Validar si la reserva existe
const validateReservationExistence = async (idReservations) => {
    const reservation = await Reservations.findByPk(idReservations);
    if (!reservation) {
        return Promise.reject('La reserva no existe');
    }
};

// Validar si el servicio adicional existe
const validateServiceExistence = async (idAditionalServices) => {
    const aditionalServices = await AditionalServices.findByPk(idAditionalServices);
    if (!aditionalServices) {
        return Promise.reject('El servicio adicional no existe');
    }
};

// Validaciones para agregar un servicio a una reserva
const addServiceToReservationValidation = [
    body('idReservations')
        .isInt().withMessage('El ID de la reserva debe ser un número entero')
        .custom(validateReservationExistence),
    body('idAditionalServices')
        .isInt().withMessage('El ID del servicio debe ser un número entero')
        .custom(validateServiceExistence)
];

// Validaciones para obtener servicios de una reserva específica
const getServicesByReservationValidation = [
    param('idReservations')
        .isInt().withMessage('El ID de la reserva debe ser un número entero')
        .custom(validateReservationExistence)
];

// Validaciones para eliminar un servicio de una reserva
const removeServiceFromReservationValidation = [
    param('idReservations')
        .isInt().withMessage('El ID de la reserva debe ser un número entero')
        .custom(validateReservationExistence),
    param('idAditionalServices')
        .isInt().withMessage('El ID del servicio debe ser un número entero')
        .custom(validateServiceExistence)
];

module.exports = {
    addServiceToReservationValidation,
    getServicesByReservationValidation,
    removeServiceFromReservationValidation
};
