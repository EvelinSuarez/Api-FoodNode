const { body, param, validationResult } = require('express-validator');
const RolePrivileges = require('../models/rolePrivileges');
const Permissions = require('../models/permissions');

const validatePrivilegeExistence = async (idPrivilege) => {
    const privilege = await Privilege.findByPk(idPrivilege);
    if (!privilege) {
        return Promise.reject('El privilegio no existe');
    }
};

const validateUniquePrivilegeName = async (privilege_name) => {
    const privilege = await Privilege.findOne({ where: { privilege_name } });
    if (privilege) {
        return Promise.reject('El nombre del privilegio ya existe');
    }
};

const validatePermissionExistence = async (idPermission) => {
    const permission = await Permission.findByPk(idPermission);
    if (!permission) {
        return Promise.reject('El permiso asociado no existe');
    }
};

const privilegeBaseValidation = [
    body('privilege_name')
        .isLength({ min: 3, max: 50 }).withMessage('El nombre del privilegio debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9\s]+$/).withMessage('El nombre del privilegio solo puede contener letras, números y espacios'),
    body('idPermission')
        .isInt({ min: 1 }).withMessage('El id del permiso debe ser un número entero positivo')
        .custom(validatePermissionExistence)
];

const createPrivilegeValidation = [
    ...privilegeBaseValidation,
    body('privilege_name').custom(validateUniquePrivilegeName)
];

const updatePrivilegeValidation = [
    ...privilegeBaseValidation,
    param('idPrivilege').isInt({ min: 1 }).withMessage('El id del privilegio debe ser un número entero positivo'),
    param('idPrivilege').custom(validatePrivilegeExistence)
];

const deletePrivilegeValidation = [
    param('idPrivilege').isInt({ min: 1 }).withMessage('El id del privilegio debe ser un número entero positivo'),
    param('idPrivilege').custom(validatePrivilegeExistence)
];

const getPrivilegeByIdValidation = [
    param('idPrivilege').isInt({ min: 1 }).withMessage('El id del privilegio debe ser un número entero positivo'),
    param('idPrivilege').custom(validatePrivilegeExistence)
];

module.exports = {
    createPrivilegeValidation,
    updatePrivilegeValidation,
    deletePrivilegeValidation,
    getPrivilegeByIdValidation
};