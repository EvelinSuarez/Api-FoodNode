


const { validationResult } = require("express-validator")
const rolePrivilegesService = require("../services/rolePrivilegesService")
const RolePrivileges = require("../models/rolePrivileges")
const Role = require("../models/role")
const Privilege = require("../models/privileges")
const Permission = require("../models/permission")

const getAllRolePrivileges = async (req, res) => {
  try {
    const rolePrivileges = await rolePrivilegesService.getAllRolePrivileges()
    res.status(200).json(rolePrivileges)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getRolePrivilegeById = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const rolePrivilege = await rolePrivilegesService.getRolePrivilegeById(req.params.idRolePrivilege)
    res.status(200).json(rolePrivilege)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const createRolePrivilege = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const rolePrivilege = await rolePrivilegesService.createRolePrivilege(req.body)
    res.status(201).json(rolePrivilege)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateRolePrivilege = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    await rolePrivilegesService.updateRolePrivilege(req.params.idRolePrivilege, req.body)
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteRolePrivilege = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    await rolePrivilegesService.deleteRolePrivilege(req.params.idRolePrivilege)
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Nuevo controlador para asignar privilegios a un rol
const assignPrivilegesToRole = async (req, res) => {
  try {
    const { idRole } = req.params;
    const { privilegePermissions } = req.body;
    
    // Verificar que el rol existe
    const role = await Role.findByPk(idRole);
    if (!role) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    
    // Eliminar asignaciones existentes para este rol
    await RolePrivileges.destroy({ where: { idRole } });
    
    // Crear nuevas asignaciones
    const createdRolePrivileges = [];
    
    for (const item of privilegePermissions) {
      const { idPrivilege, idPermission } = item;
      
      // Verificar que existan el privilegio y el permiso
      const privilege = await Privilege.findByPk(idPrivilege);
      const permission = await Permission.findByPk(idPermission);
      
      if (!privilege || !permission) {
        continue; // Saltamos esta asignación si no existe el privilegio o permiso
      }
      
      // Crear la asignación
      const rolePrivilege = await RolePrivileges.create({
        idRole,
        idPrivilege,
        idPermission
      });
      
      createdRolePrivileges.push(rolePrivilege);
    }
    
    res.status(200).json({ 
      message: "Privilegios y permisos asignados con éxito",
      rolePrivileges: createdRolePrivileges
    });
  } catch (error) {
    console.error("Error al asignar privilegios:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllRolePrivileges,
  getRolePrivilegeById,
  createRolePrivilege,
  updateRolePrivilege,
  deleteRolePrivilege,
  assignPrivilegesToRole // Exportamos el nuevo controlador
}
