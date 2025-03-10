



const RolePrivileges = require("../models/rolePrivileges")
const Role = require("../models/role")
const Privilege = require("../models/privileges")
const Permission = require("../models/permission")

const getAllRolePrivileges = async () => {
  return RolePrivileges.findAll({
    include: [{ model: Role }, { model: Privilege }, { model: Permission }],
  })
}

const getRolePrivilegeById = async (idRolePrivilege) => {
  return RolePrivileges.findByPk(idRolePrivilege, {
    include: [{ model: Role }, { model: Privilege }, { model: Permission }],
  })
}

const createRolePrivilege = async (rolePrivilege) => {
  return RolePrivileges.create(rolePrivilege)
}

const updateRolePrivilege = async (idRolePrivilege, rolePrivilege) => {
  return RolePrivileges.update(rolePrivilege, {
    where: { idPrivilegedRole: idRolePrivilege },
  })
}

const deleteRolePrivilege = async (idRolePrivilege) => {
  return RolePrivileges.destroy({
    where: { idPrivilegedRole: idRolePrivilege },
  })
}

// Nuevo método para asignar múltiples privilegios y permisos a un rol
const assignPrivilegesToRole = async (idRole, privilegePermissions) => {
  // Verificar que el rol existe
  const role = await Role.findByPk(idRole)
  if (!role) {
    throw new Error("El rol no existe")
  }

  // Eliminar asignaciones existentes para este rol
  await RolePrivileges.destroy({ where: { idRole } })

  // Crear nuevas asignaciones
  const createdRolePrivileges = []

  for (const item of privilegePermissions) {
    const { idPrivilege, idPermission } = item

    // Verificar que existan el privilegio y el permiso
    const privilege = await Privilege.findByPk(idPrivilege)
    const permission = await Permission.findByPk(idPermission)

    if (!privilege || !permission) {
      continue // Saltamos esta asignación si no existe el privilegio o permiso
    }

    // Crear la asignación
    const rolePrivilege = await RolePrivileges.create({
      idRole,
      idPrivilege,
      idPermission,
    })

    createdRolePrivileges.push(rolePrivilege)
  }

  return createdRolePrivileges
}

module.exports = {
  getAllRolePrivileges,
  getRolePrivilegeById,
  createRolePrivilege,
  updateRolePrivilege,
  deleteRolePrivilege,
  assignPrivilegesToRole, // Exportamos el nuevo método
}

