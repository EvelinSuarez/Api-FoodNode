const { body, param, validationResult } = require('express-validator');
const Customers = require('../models/customers');

const validateCustomersExistence = async (id) => {
    const customer = await Customers.findByPk(id);
    if (!customer) {
        return Promise.reject('El cliente no existe');
    }
};

const validateUniqueCustomersName = async (fullName) => {
    const customer = await Customers.findOne({ where: { fullName } });
    if (customer) {
        return Promise.reject('El nombre del cliente ya está registrado');
    }
};

// Validaciones base para crear y actualizar clientes
const customersBaseValidation = [
    body('fullName')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
        .custom(validateUniqueCustomersName).withMessage('El nombre del cliente ya está registrado'),
    body('distintive')
        .isInt().withMessage('El campo distintivo debe ser un número entero')
        .notEmpty().withMessage('El campo distintivo es obligatorio'),
    body('customerCategory')
        .isString().withMessage('La categoría del cliente debe ser una cadena de texto')
        .notEmpty().withMessage('La categoría del cliente es obligatoria'),
    body('cellphone')
        .isString().withMessage('El número de teléfono debe ser una cadena de texto')
        .isLength({ min: 10, max: 15 }).withMessage('El número de teléfono debe tener entre 10 y 15 caracteres')
        .optional({ nullable: true }),
    body('email')
        .isEmail().withMessage('El correo electrónico no es válido')
        .optional({ nullable: true }),
    body('address')
        .isString().withMessage('La dirección debe ser una cadena de texto')
        .optional({ nullable: true }),
    body('contractType')
        .isString().withMessage('El tipo de contrato debe ser una cadena de texto')
        .optional({ nullable: true }),
    body('status')
        .isBoolean().withMessage('El estado debe ser un valor booleano')
        .optional({ nullable: true })
];

// Validaciones para crear un cliente
const createCustomersValidation = [
    ...customersBaseValidation
];

// Validaciones para actualizar un cliente
const updateCustomersValidation = [
    ...customersBaseValidation,
    param('id')
        .isInt().withMessage('El ID debe ser un número entero')
        .custom(validateCustomersExistence)
];

// Validaciones para eliminar un cliente
const deleteCustomersValidation = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero')
        .custom(validateCustomersExistence)
];

// Validaciones para obtener un cliente por ID
const getCustomersByIdValidation = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero')
        .custom(validateCustomersExistence)
];

// Validaciones para cambiar el estado de un cliente
const changeStateValidation = [
    body('status')
        .isBoolean().withMessage('El estado debe ser un valor booleano'),
    param('id')
        .isInt().withMessage('El ID debe ser un número entero')
        .custom(validateCustomersExistence)
];

module.exports = {
    createCustomersValidation,
    updateCustomersValidation,
    deleteCustomersValidation,
    getCustomersByIdValidation,
    changeStateValidation,
};