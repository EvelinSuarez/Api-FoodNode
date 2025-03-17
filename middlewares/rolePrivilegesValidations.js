
 
// middlewares/rolePrivilegesValidations.js
const { body, param } = require("express-validator");
const RolePrivileges = require("../models/rolePrivileges");
const Role = require("../models/role");
const Privilege = require("../models/privilege");
const Permission = require("../models/permission");

const validateRolePrivilegeExistence = async (idRolePrivilege) => {
  const rolePrivilege = await RolePrivileges.findByPk(idRolePrivilege);
  if (!rolePrivilege) {
    return Promise.reject("El rol-privilegio no existe");
  }
};

const validateRoleExistence = async (idRole) => {
  const role = await Role.findByPk(idRole);
  if (!role) {
    return Promise.reject("El rol no existe");
  }
};

const validatePrivilegeExistence = async (idPrivilege) => {
  const privilege = await Privilege.findByPk(idPrivilege);
  if (!privilege) {
    return Promise.reject("El privilegio no existe");
  }
};

const validatePermissionExistence = async (idPermission) => {
  const permission = await Permission.findByPk(idPermission);
  if (!permission) {
    return Promise.reject("El permiso no existe");
  }
};

const validateUniqueRolePrivilege = async (idRole, idPrivilege, idPermission) => {
  const rolePrivilege = await RolePrivileges.findOne({ 
    where: { 
      idRole, 
      idPrivilege,
      idPermission 
    } 
  });
  
  if (rolePrivilege) {
    return Promise.reject("Esta combinación de rol, privilegio y permiso ya existe");
  }
};

const rolePrivilegeBaseValidation = [
  body("idRole")
    .isInt({ min: 1 })
    .withMessage("El id del rol debe ser un número entero positivo")
    .custom(validateRoleExistence),
  body("idPrivilege")
    .isInt({ min: 1 })
    .withMessage("El id del privilegio debe ser un número entero positivo")
    .custom(validatePrivilegeExistence),
  body("idPermission")
    .isInt({ min: 1 })
    .withMessage("El id del permiso debe ser un número entero positivo")
    .custom(validatePermissionExistence)
];

const getRolePrivilegeByIdValidation = [
  param("idRolePrivilege")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("El id del rol-privilegio debe ser un número entero positivo"),
  param("idRolePrivilege").custom(validateRolePrivilegeExistence),
];

const createRolePrivilegeValidation = [
  ...rolePrivilegeBaseValidation,
  body().custom(async (_value, { req }) => {
    await validateUniqueRolePrivilege(
      req.body.idRole, 
      req.body.idPrivilege,
      req.body.idPermission
    );
    return true;
  }),
];

const updateRolePrivilegeValidation = [
  ...rolePrivilegeBaseValidation,
  param("idRolePrivilege")
    .isInt({ min: 1 })
    .withMessage("El id del rol-privilegio debe ser un número entero positivo"),
  param("idRolePrivilege").custom(validateRolePrivilegeExistence),
  body().custom(async (_value, { req }) => {
    await validateUniqueRolePrivilege(
      req.body.idRole, 
      req.body.idPrivilege,
      req.body.idPermission
    );
    return true;
  }),
];

const deleteRolePrivilegeValidation = [
  param("idRolePrivilege")
    .isInt({ min: 1 })
    .withMessage("El id del rol-privilegio debe ser un número entero positivo"),
  param("idRolePrivilege").custom(validateRolePrivilegeExistence),
];

module.exports = {
  getRolePrivilegeByIdValidation,
  createRolePrivilegeValidation,
  updateRolePrivilegeValidation,
  deleteRolePrivilegeValidation,
};   