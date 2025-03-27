const { body, param, validationResult } = require('express-validator');
const Customers = require('../models/customers');

// Validar si el cliente existe
const validateCustomersExistence = async (id) => {
    const customers = await Customers.findByPk(id);
    if (!customers) {
        return Promise.reject('El cliente no existe');
    }
};


// Validar unicidad del numero de celular del cliente (excluyendo el ID actual en actualizaciones)
const validateUniqueCustomersCellphone = async (cellphone, { req }) => {
    const customers = await Customers.findOne({ where: { cellphone } });
    if (customers && customers.idCustomers !== parseInt(req.params.id)) {
        return Promise.reject('El numero de celular del cliente ya está registrado');
    }
};

// Validaciones base para crear y actualizar clientes
const customersBaseValidation = [
    body('fullName')
        .isLength({ min: 5 }).withMessage('El nombre debe tener al menos 5 caracteres'), 
    body('distintive')
        .isString().withMessage('El campo distintivo debe ser una cadena de texto')
        .notEmpty().withMessage('El campo distintivo es obligatorio'),
    body('customerCategory')
        .isString().withMessage('La categoría del cliente debe ser una cadena de texto')
        .notEmpty().withMessage('La categoría del cliente es obligatoria'),
    body('cellphone')
        .isString().withMessage('El número de teléfono debe ser entero')
        .isLength({ min: 10, max: 15 }).withMessage('El número de teléfono debe tener entre 10 y 15 caracteres')
        .custom(validateUniqueCustomersCellphone).withMessage('El numero de telefono del cliente ya está registrado'),
    body('email')
        .isEmail().withMessage('El correo electrónico no es válido')
        .optional({ nullable: true }),
    body('address')
        .isString().withMessage('La dirección debe ser una cadena de texto')
        .optional({ nullable: true }),
    body('status')
        .isBoolean().withMessage('El estado debe ser un valor booleano')
        .optional({ nullable: true }),
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

// Validaciones para buscar clientes
const searchCustomersValidation = [
    body('searchTerm')
        .isString().withMessage('El término de búsqueda debe ser una cadena de texto')
        .isLength({ max: 90 }).withMessage('El término de búsqueda no puede exceder los 90 caracteres')
        .notEmpty().withMessage('El término de búsqueda es obligatorio') // Asegura que no esté vacío
];


module.exports = {
    createCustomersValidation,
    updateCustomersValidation,
    deleteCustomersValidation,
    getCustomersByIdValidation,
    changeStateValidation,
    searchCustomersValidation, //validación para búsqueda
};