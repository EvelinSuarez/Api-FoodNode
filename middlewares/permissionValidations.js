const { body, param, validationResult } = require('express-validator');
const Permission = require('../models/permission');

const validatePermissionExistence = async (idPermission) => {
    const permission = await Permissions.findByPk(idPermission);
    if (!permission) {
        return Promise.reject('El permiso no existe');
    }
};

const validateUniquePermissionName = async (permissionName) => {
    const permission = await Permissions.findOne({ where: { permissionName } });
    if (permission) {
        return Promise.reject('El nombre del permiso ya existe');
    }
};

const permissionBaseValidation = [
    body('permissionName')
        .isLength({ min: 3, max: 50 }).withMessage('El nombre del permiso debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9\s]+$/).withMessage('El nombre del permiso solo puede contener letras, números y espacios'),
    body('status').isBoolean().withMessage('El estado debe ser un booleano')
];

const getPermissionByIdValidation = [
    param('idPermission').toInt().isInt({ min: 1 }).withMessage('El id del permiso debe ser un número entero positivo'),
    param('idPermission').custom(validatePermissionExistence)
];

const createPermissionValidation = [
    ...permissionBaseValidation,
    body('permissionName').custom(validateUniquePermissionName)
];

const updatePermissionValidation = [
    ...permissionBaseValidation,
    param('idPermission').isInt({ min: 1 }).withMessage('El id del permiso debe ser un número entero positivo'),
    param('idPermission').custom(validatePermissionExistence),
    body('permissionName').custom(validateUniquePermissionName)
];

const deletePermissionValidation = [
    param('idPermission').isInt({ min: 1 }).withMessage('El id del permiso debe ser un número entero positivo'),
    param('idPermission').custom(validatePermissionExistence)
];

const changePermissionStateValidation = [
    param('idPermission').isInt({ min: 1 }).withMessage('El id del permiso debe ser un número entero positivo'),
    param('idPermission').custom(validatePermissionExistence),
    body('status').isBoolean().withMessage('El estado debe ser un booleano')
];

module.exports = {
    getPermissionByIdValidation,
    createPermissionValidation,
    updatePermissionValidation,
    deletePermissionValidation,
    changePermissionStateValidation
};
