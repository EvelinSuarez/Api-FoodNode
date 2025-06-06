const { body, param, validationResult } = require('express-validator');
const AditionalServices = require('../models/aditionalServices');

const validateAditionalServicesExistence = async (idAditionalServices) => {
    const aditionalServices = await AditionalServices.findByPk(idAditionalServices);
    if (!aditionalServices) {
        return Promise.reject('El servicio adicional no existe');
    }
};

const validateUniqueAditionalServicesName = async (name) => {
    const aditionalServices = await AditionalServices.findOne({ where: { name } });
    if (aditionalServices) {
        return Promise.reject('El nombre del servicio adicional ya está registrado');
    }
};

// Validaciones base para crear y actualizar servicios
const aditionalServicesBaseValidation = [
    body('name')
        .isLength({ min: 3}).withMessage('El nombre debe tener al menos 3 caracteres')
        .isLength({ max: 30}).withMessage('El limite máximo de caracteres es 30')
        .custom(validateUniqueAditionalServicesName).withMessage('El nombre del servicio adicional ya está registrado'),
        
    body('status')
        .isBoolean().withMessage('El estado debe ser un valor booleano')
        .optional({ nullable: true })
];

// Validaciones para crear un servicio
const createAditionalServicesValidation = [
    ...aditionalServicesBaseValidation
];

// Validaciones para actualizar un servicio
const updateAditionalServicesValidation = [
    ...aditionalServicesBaseValidation,
    param('id')
        .isInt().withMessage('El ID debe ser un número entero')
        .custom(validateAditionalServicesExistence)
];

// Validaciones para eliminar un servicio
const deleteAditionalServicesValidation = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero')
        .custom(validateAditionalServicesExistence)
        
];

// Validaciones para obtener un servicio por ID
const getAditionalServicesByIdValidation = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero')
        .custom(validateAditionalServicesExistence)
];

// Validaciones para cambiar el estado de un servicio
const changeStateValidation = [
    body('status')
        .isBoolean().withMessage('El estado debe ser un valor booleano'),
    param('id')
        .isInt().withMessage('El ID debe ser un número entero')
        .custom(validateAditionalServicesExistence)
];

module.exports = {
    createAditionalServicesValidation,
    updateAditionalServicesValidation,
    deleteAditionalServicesValidation,
    getAditionalServicesByIdValidation,
    changeStateValidation,
};