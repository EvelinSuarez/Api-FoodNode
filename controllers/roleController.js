const { validationResult } = require('express-validator');
const roleService = require('../services/roleService');
const Role = require('../models/role');
const Privilege = require('../models/privilege');

const createRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const role = await roleService.createRole(req.body);
        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllRoles = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getRoleById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const role = await roleService.getRoleById(req.params.idRole);
        res.status(200).json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateRole = async (req, res) => {
    console.log("Params:", req.params);
  console.log("Body:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await roleService.updateRole(req.params.idRole, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



const deleteRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await roleService.deleteRole(req.params.idRole);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const changeRoleState = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await roleService.changeRoleState(req.params.idRole, req.body.status);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 🔹 Función actualizada para asignar privilegios con permisos a un rol
const assignPrivileges = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
        
    try {
        const { idRole } = req.params;
        const { privilegePermissions } = req.body; // Array de objetos {idPrivilege, idPermission}
        
        const role = await Role.findByPk(idRole);
        if (!role) return res.status(404).json({ message: "Rol no encontrado" });
        
        // Eliminar asignaciones existentes para este rol
        await rolePrivileges.destroy({ where: { idRole } });
        
        // Crear nuevas asignaciones
        const rolePrivileges = [];
        for (const item of privilegePermissions) {
            const { idPrivilege, idPermission } = item;
            
            // Verificar que existan el privilegio y el permiso
            const privilege = await Privilege.findByPk(idPrivilege);
            const permission = await permission.findByPk(idPermission);
            
            if (!privilege || !permission) {
                continue; // Saltamos esta asignación si no existe el privilegio o permiso
            }
            
            // Crear la asignación
            const rolePrivilege = await rolePrivileges.create({
                idRole,
                idPrivilege,
                idPermission
            });
            
            rolePrivileges.push(rolePrivilege);
        }
        
        res.status(200).json({ 
            message: "Privilegios y permisos asignados con éxito",
            rolePrivileges
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    changeRoleState,
    assignPrivileges, // Agregado aquí
};
