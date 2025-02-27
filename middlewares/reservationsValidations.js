const { body, param } = require('express-validator');
const Reservations = require('../models/reservations');

const validateReservationsExistence = async (id) => {
    const reservations = await Reservations.findByPk(id);
    if (!reservations) {
        return Promise.reject('La reserva no existe');
    }
};

const validateUniqueReservationsName = async (name) => {
    const reservations = await Reservations.findOne({ where: { name } });
    if (reservations) {
        return Promise.reject('La reserva ya existe');
    }
};

const reservationsBaseValidation = [
    body('name').isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    body('quantity').isInt({ min: 0 }).withMessage('La cantidad debe ser al menos 0'),
    body('price').isFloat({ min: 0 }).withMessage('El precio debe ser al menos 0'),
    body('state').default(true).isBoolean().withMessage('El estado debe ser un booleano'),
    body('categoryId').isInt().withMessage('La categoría debe ser un número entero'),
];

const createReservationsValidation = [
    ...reservationsBaseValidation,
    body('name').custom(validateUniqueReservationsName)
];

const updateReservationsValidation = [
    ...reservationsBaseValidation,
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(validateReservationsExistence)
];

const deleteReservationsValidation = [
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(validateReservationsExistence)
];

const getReservationsByIdValidation = [
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(validateReservationsExistence)
];

const changeStateValidation = [
    body('state').isBoolean().withMessage('El estado debe ser un booleano'),
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(validateReservationsExistence)
];

module.exports = {
    createReservationsValidation,
    updateReservationsValidation,
    deleteReservationsValidation,
    getReservationsByIdValidation,
    changeStateValidation,
};