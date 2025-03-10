

// middlewares/privilegeValidations.js
const { body, param } = require('express-validator');
const Privilege = require('../models/privileges');

const validatePrivilegeExistence = async (idPrivilege) => {
    const privilege = await Privilege.findByPk(idPrivilege);
    if (!privilege) {
        return Promise.reject('El privilegio no existe');
    }
};

const validateUniquePrivilegeName = async (privilegeName) => {
    const privilege = await Privilege.findOne({ where: { privilegename: privilegeName } });
    if (privilege) {
        return Promise.reject('El nombre del privilegio ya existe');
    }
};

const privilegeBaseValidation = [
    body('privilegename')
        .isLength({ min: 3, max: 50 }).withMessage('El nombre del privilegio debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9\s]+$/).withMessage('El nombre del privilegio solo puede contener letras, números y espacios')
];

const createPrivilegeValidation = [
    ...privilegeBaseValidation,
    body('privilegename').custom(validateUniquePrivilegeName)
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