const { body, param, validationResult } = require('express-validator');
const Role = require('../models/role');
const User = require('../models/user');
const RolePrivilege = require('../models/rolePrivilege');

const validateRoleExistence = async (idRole) => {
    const role = await Role.findByPk(idRole);
    if (!role) {
        return Promise.reject('El rol no existe');
    }
};

const validateUniqueRoleName = async (roleName) => {
    const role = await Role.findOne({ where: { roleName } });
    if (role) {
        return Promise.reject('El nombre del rol ya existe');
    }
};

const validateRoleHasPrivileges = async (idRole) => {
    const rolePrivileges = await RolePrivilege.findOne({ where: { idRole } });
    if (!rolePrivileges) {
        return Promise.reject('El rol debe tener al menos un permiso a un privilegio');
    }
};

const validateRoleHasNoUsers = async (idRole) => {
    const users = await User.findOne({ where: { idRole } });
    if (users) {
        return Promise.reject('No se puede eliminar el rol porque tiene usuarios asociados');
    }
};

const roleBaseValidation = [
    body('roleName')
        .isLength({ min: 3, max: 20 }).withMessage('El nombre del rol debe tener entre 3 y 20 caracteres')
        .matches(/^[a-zA-Z0-9\s]+$/).withMessage('El nombre del rol solo puede contener letras, números y espacios'),
    body('status').isBoolean().withMessage('El estado debe ser un booleano')
];

const createRoleValidation = [
    ...roleBaseValidation,
    body('roleName').custom(validateUniqueRoleName),
    body('privileges').isArray({ min: 1 }).withMessage('El rol debe tener al menos un permiso a un privilegio')
];

const updateRoleValidation = [
    ...roleBaseValidation,
    param('idRole').isInt({ min: 1 }).withMessage('El id del rol debe ser un número entero positivo'),
    param('idRole').custom(validateRoleExistence),
    body('roleName').custom(validateUniqueRoleName),
    body('privileges').isArray({ min: 1 }).withMessage('El rol debe tener al menos un permiso a un privilegio')
];

const deleteRoleValidation = [
    param('idRole').isInt({ min: 1 }).withMessage('El id del rol debe ser un número entero positivo'),
    param('idRole').custom(validateRoleExistence),
    param('idRole').custom(validateRoleHasNoUsers)
];

const changeRoleStateValidation = [
    param('idRole').isInt({ min: 1 }).withMessage('El id del rol debe ser un número entero positivo'),
    param('idRole').custom(validateRoleExistence),
    body('status').isBoolean().withMessage('El estado debe ser un booleano')
];

module.exports = {
    createRoleValidation,
    updateRoleValidation,
    deleteRoleValidation,
    changeRoleStateValidation
};



