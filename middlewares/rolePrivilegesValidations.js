const { body, param } = require("express-validator")
const RolePrivileges = require("../models/rolePrivileges")
const Role = require("../models/role")
const Privilege = require("../models/privileges")

const validateRolePrivilegeExistence = async (idRolePrivilege) => {
  const rolePrivilege = await RolePrivileges.findByPk(idRolePrivilege)
  if (!rolePrivilege) {
    return Promise.reject("El rol-privilegio no existe")
  }
}

const validateRoleExistence = async (idRole) => {
  const role = await Role.findByPk(idRole)
  if (!role) {
    return Promise.reject("El rol no existe")
  }
}

const validatePrivilegeExistence = async (idPrivilege) => {
  const privilege = await Privilege.findByPk(idPrivilege)
  if (!privilege) {
    return Promise.reject("El privilegio no existe")
  }
}

const validateUniqueRolePrivilege = async (idRole, idPrivilege) => {
  const rolePrivilege = await RolePrivileges.findOne({ where: { idRole, idPrivilege } })
  if (rolePrivilege) {
    return Promise.reject("Esta combinación de rol y privilegio ya existe")
  }
}

const rolePrivilegeBaseValidation = [
  body("idRole")
    .isInt({ min: 1 })
    .withMessage("El id del rol debe ser un número entero positivo")
    .custom(validateRoleExistence),
  body("idPrivilege")
    .isInt({ min: 1 })
    .withMessage("El id del privilegio debe ser un número entero positivo")
    .custom(validatePrivilegeExistence),
]

const getRolePrivilegeByIdValidation = [
  param("idRolePrivilege")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("El id del rol-privilegio debe ser un número entero positivo"),
  param("idRolePrivilege").custom(validateRolePrivilegeExistence),
]

const createRolePrivilegeValidation = [
  ...rolePrivilegeBaseValidation,
  body().custom(async (value, { req }) => {
    await validateUniqueRolePrivilege(req.body.idRole, req.body.idPrivilege)
    return true
  }),
]

const updateRolePrivilegeValidation = [
  ...rolePrivilegeBaseValidation,
  param("idRolePrivilege").isInt({ min: 1 }).withMessage("El id del rol-privilegio debe ser un número entero positivo"),
  param("idRolePrivilege").custom(validateRolePrivilegeExistence),
  body().custom(async (value, { req }) => {
    await validateUniqueRolePrivilege(req.body.idRole, req.body.idPrivilege)
    return true
  }),
]

const deleteRolePrivilegeValidation = [
  param("idRolePrivilege").isInt({ min: 1 }).withMessage("El id del rol-privilegio debe ser un número entero positivo"),
  param("idRolePrivilege").custom(validateRolePrivilegeExistence),
]

module.exports = {
  getRolePrivilegeByIdValidation,
  createRolePrivilegeValidation,
  updateRolePrivilegeValidation,
  deleteRolePrivilegeValidation,
}