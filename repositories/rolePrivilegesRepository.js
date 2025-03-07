const RolePrivileges = require("../models/rolePrivileges")

const getAllRolePrivileges = async () => {
  return RolePrivileges.findAll()
}

const getRolePrivilegeById = async (idRolePrivilege) => {
  return RolePrivileges.findByPk(idRolePrivilege)
}

const createRolePrivilege = async (rolePrivilege) => {
  return RolePrivileges.create(rolePrivilege)
}

const updateRolePrivilege = async (idRolePrivilege, rolePrivilege) => {
  return RolePrivileges.update(rolePrivilege, { where: { idPrivilegedRole: idRolePrivilege } })
}

const deleteRolePrivilege = async (idRolePrivilege) => {
  return RolePrivileges.destroy({ where: { idPrivilegedRole: idRolePrivilege } })
}

module.exports = {
  getAllRolePrivileges,
  getRolePrivilegeById,
  createRolePrivilege,
  updateRolePrivilege,
  deleteRolePrivilege,
}

