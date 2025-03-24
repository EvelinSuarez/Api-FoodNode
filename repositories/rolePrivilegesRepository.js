


// repositories/rolePrivilegesRepository.js
const RolePrivileges = require("../models/rolePrivileges");
const Role = require("../models/role");
const Privilege = require("../models/privilege");
const Permission = require("../models/permission");

const getAllRolePrivileges = async () => {
  return RolePrivileges.findAll({
    include: [
      { model: Role },
      { model: Privilege },
      { model: Permission }
    ]
  });
};

const getRolePrivilegeById = async (idRolePrivilege) => {
  return await RolePrivileges.findAll({
    where: { idRole: idRolePrivilege },
    include: [
      { model: Role, as: "role" },
      { model: Privilege, as: "privilege" },
      { model: Permission, as: "permission" }
    ]
  });
};

const createRolePrivilege = async (rolePrivilege) => {
  return RolePrivileges.create(rolePrivilege);
};

const updateRolePrivilege = async (idRolePrivilege, rolePrivilege) => {
  return RolePrivileges.update(rolePrivilege, { 
    where: { idPrivilegedRole: idRolePrivilege } 
  });
};

const deleteRolePrivilege = async (idRolePrivilege) => {
  return RolePrivileges.destroy({ 
    where: { idPrivilegedRole: idRolePrivilege } 
  });
};

const getPrivilegesByRoleId = async (idRole) => {
  return RolePrivileges.findAll({
    where: { idRole },
    include: [
      { model: Privilege },
      { model: Permission }
    ]
  });
};

module.exports = {
  getAllRolePrivileges,
  getRolePrivilegeById,
  createRolePrivilege,
  updateRolePrivilege,
  deleteRolePrivilege,
  getPrivilegesByRoleId
};