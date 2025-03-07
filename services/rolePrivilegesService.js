const rolePrivilegesRepository = require("../repositories/rolePrivilegesRepository")

const getAllRolePrivileges = async () => {
  return rolePrivilegesRepository.getAllRolePrivileges()
}

const getRolePrivilegeById = async (idRolePrivilege) => {
  return rolePrivilegesRepository.getRolePrivilegeById(idRolePrivilege)
}

const createRolePrivilege = async (rolePrivilege) => {
  return rolePrivilegesRepository.createRolePrivilege(rolePrivilege)
}

const updateRolePrivilege = async (idRolePrivilege, rolePrivilege) => {
  return rolePrivilegesRepository.updateRolePrivilege(idRolePrivilege, rolePrivilege)
}

const deleteRolePrivilege = async (idRolePrivilege) => {
  return rolePrivilegesRepository.deleteRolePrivilege(idRolePrivilege)
}

module.exports = {
  getAllRolePrivileges,
  getRolePrivilegeById,
  createRolePrivilege,
  updateRolePrivilege,
  deleteRolePrivilege,
}

