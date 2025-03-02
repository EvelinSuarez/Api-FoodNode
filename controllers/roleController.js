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

// 🔹 Nueva función para asignar privilegios a un rol
const assignPrivileges = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { idRole } = req.params;
        const { privilegeIds } = req.body; // Array de IDs de privilegios

        const role = await Role.findByPk(idRole);
        if (!role) return res.status(404).json({ message: "Rol no encontrado" });

        const privileges = await Privilege.findAll({ where: { idPrivilege: privilegeIds } });

        await role.setPrivileges(privileges); // Asigna los privilegios al rol

        res.status(200).json({ message: "Privilegios asignados con éxito" });
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
