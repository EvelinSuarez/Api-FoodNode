// controllers/roleController.js
const { validationResult } = require('express-validator');
const roleService = require('../services/roleService');
// const db = require('../models'); // O from '../models/index'

const LOG_PREFIX_CONTROLLER = "[CONTROLLER Role]";

// POST /api/roles (Cambié a plural "roles" por convención REST)
const createRole = async (req, res) => {
    console.log(`${LOG_PREFIX_CONTROLLER} createRole - Solicitud POST /api/roles recibida.`);
    console.log(`${LOG_PREFIX_CONTROLLER} createRole - req.body:`, JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn(`${LOG_PREFIX_CONTROLLER} createRole - Errores de validación:`, JSON.stringify(errors.array()));
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // req.body esperado: { roleName, status? (boolean), privilegeAssignments?: [{ idPrivilege: number, (opcional) idPermission: number }] }
        // El servicio transformará privilegeAssignments a lo que Sequelize necesita para la asociación
        const role = await roleService.createRole(req.body);
        console.log(`${LOG_PREFIX_CONTROLLER} createRole - Rol creado exitosamente:`, role);
        res.status(201).json(role);
    } catch (error) {
        console.error(`${LOG_PREFIX_CONTROLLER} createRole - Error: ${error.message}`, error.stack);
        // Simplificado, el servicio debería arrojar errores con más contexto
        if (error.message.toLowerCase().includes("ya existe")) {
            return res.status(409).json({ message: error.message });
        }
        if (error.message.toLowerCase().includes("no existe") || error.message.toLowerCase().includes("inválido")) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || "Error al crear el rol." });
    }
};

// GET /api/roles
const getAllRoles = async (req, res) => {
    console.log(`${LOG_PREFIX_CONTROLLER} getAllRoles - Solicitud GET /api/roles recibida.`);
    try {
        // El servicio getAllRoles debería incluir los privilegios asignados
        const roles = await roleService.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        console.error(`${LOG_PREFIX_CONTROLLER} getAllRoles - Error: ${error.message}`);
        res.status(500).json({ message: "Error al obtener roles." });
    }
};

// GET /api/roles/:idRole
const getRoleById = async (req, res) => {
    const { idRole } = req.params;
    console.log(`${LOG_PREFIX_CONTROLLER} getRoleById - Solicitud GET /api/roles/${idRole} recibida.`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // El servicio getRoleById debería incluir los privilegios asignados
        const role = await roleService.getRoleById(idRole); // Este servicio debe manejar el "no encontrado"
        res.status(200).json(role);
    } catch (error) {
        console.error(`${LOG_PREFIX_CONTROLLER} getRoleById - Error para ID ${idRole}: ${error.message}`);
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Error al obtener el rol." });
        }
    }
};

// PUT /api/roles/:idRole  (Para actualizar nombre/estado del rol)
const updateRole = async (req, res) => {
    const { idRole } = req.params;
    const { roleName, status } = req.body; // Solo estos campos para esta ruta
    console.log(`${LOG_PREFIX_CONTROLLER} updateRole - Solicitud PUT /api/roles/${idRole} recibida.`);
    console.log(`${LOG_PREFIX_CONTROLLER} updateRole - req.body:`, JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updatedRole = await roleService.updateRole(idRole, { roleName, status });
        console.log(`${LOG_PREFIX_CONTROLLER} updateRole - Rol ID ${idRole} actualizado.`);
        res.status(200).json(updatedRole);
    } catch (error) {
        console.error(`${LOG_PREFIX_CONTROLLER} updateRole - Error para ID ${idRole}: ${error.message}`);
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else if (error.message.toLowerCase().includes("ya existe")) {
            res.status(409).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || "Error al actualizar el rol." });
        }
    }
};

// DELETE /api/roles/:idRole
const deleteRole = async (req, res) => {
    const { idRole } = req.params;
    console.log(`${LOG_PREFIX_CONTROLLER} deleteRole - Solicitud DELETE /api/roles/${idRole} recibida.`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // La validación (validateRoleExistence, validateRoleHasNoUsers) ya se ejecutó
        // y si req.foundRole fue establecido, podrías usarlo, pero el servicio debería revalidar.

        // La llamada al servicio deleteRole es la que internamente intentará hacer el User.count
        await roleService.deleteRole(idRole); // <--- El error está ocurriendo DENTRO de esta llamada
        
        console.log(`${LOG_PREFIX_CONTROLLER} deleteRole - Rol ID ${idRole} eliminado.`);
        res.status(204).end();
    } catch (error) {
        console.error(`${LOG_PREFIX_CONTROLLER} deleteRole - Error para ID ${idRole}: ${error.message}`); // <--- ESTE ES TU LOG
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else if (error.message.includes('usuarios asociados')) {
            res.status(409).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || "Error al eliminar el rol." });
        }
    }
};

// PATCH /api/roles/:idRole/state
const changeRoleState = async (req, res) => {
    // ... (Tu lógica actual parece correcta)
    const { idRole } = req.params;
    const { status } = req.body;
    console.log(`${LOG_PREFIX_CONTROLLER} changeRoleState - Solicitud PATCH /api/roles/${idRole}/state recibida.`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updatedRole = await roleService.changeRoleState(idRole, status);
        console.log(`${LOG_PREFIX_CONTROLLER} changeRoleState - Estado del rol ID ${idRole} cambiado.`);
        res.status(200).json(updatedRole); // Devolver el rol actualizado puede ser útil
    } catch (error) {
        console.error(`${LOG_PREFIX_CONTROLLER} changeRoleState - Error para ID ${idRole}: ${error.message}`);
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else if (error.message.includes('debe ser un valor booleano')) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || "Error al cambiar el estado del rol." });
        }
    }
};

// GET /api/roles/:idRole/privileges (Devuelve las asignaciones actuales [{idPrivilege, idPermission, privilegeName, ...}, ...])
const getRolePrivileges = async (req, res) => {
    const { idRole } = req.params;
    console.log(`${LOG_PREFIX_CONTROLLER} getRolePrivileges - Solicitud GET /api/roles/${idRole}/privileges recibida.`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // El servicio se encarga de buscar RolePrivileges e incluir Privilege y Permission
        const privileges = await roleService.getRolePrivileges(idRole);
        console.log(`${LOG_PREFIX_CONTROLLER} getRolePrivileges - Asignaciones para rol ID ${idRole}:`, JSON.stringify(privileges, null, 2));
        res.status(200).json(privileges);
    } catch (error) {
        console.error(`${LOG_PREFIX_CONTROLLER} getRolePrivileges - Error para ID ${idRole}: ${error.message}`);
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Error al obtener los privilegios del rol." });
        }
    }
};

// PUT /api/roles/:idRole/privileges (Asigna/Reemplaza TODAS las asignaciones para un rol)
// El cuerpo de la solicitud debe ser un array: [{ idPrivilege: number, (opcional) idPermission: number  }, ...]
const assignPrivileges = async (req, res) => {
    const { idRole } = req.params;
    const privilegeAssignments = req.body; // Array de objetos [{ idPrivilege, (opcional) idPermission }]

    console.log(`${LOG_PREFIX_CONTROLLER} assignPrivileges - Solicitud PUT /api/roles/${idRole}/privileges recibida.`);
    console.log(`${LOG_PREFIX_CONTROLLER} assignPrivileges - req.body (assignments):`, JSON.stringify(privilegeAssignments, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // El servicio se encarga de validar los IDs y la lógica de reemplazo
        await roleService.assignPrivilegesToRole(idRole, privilegeAssignments);
        console.log(`${LOG_PREFIX_CONTROLLER} assignPrivileges - Privilegios asignados/actualizados para rol ID ${idRole}.`);
        // Podrías devolver los privilegios asignados o el rol actualizado con sus privilegios
        const updatedRoleWithPrivileges = await roleService.getRoleById(idRole); // Asumiendo que getRoleById incluye privilegios
        res.status(200).json({ message: "Privilegios asignados/actualizados correctamente.", role: updatedRoleWithPrivileges });
    } catch (error) {
        console.error(`${LOG_PREFIX_CONTROLLER} assignPrivileges - Error para ID ${idRole}: ${error.message}`);
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else if (error.message.toLowerCase().includes("inválido") ||
                   error.message.toLowerCase().includes("no existe") ||
                   error.message.toLowerCase().includes("se esperaba un array") ||
                   error.message.toLowerCase().includes("deben ser números")) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || "Error al asignar privilegios al rol." });
        }
    }
};

// GET /api/roles/:idRole/effective-permissions (Devuelve { permissionKey: [privilegeKey, ...], ... })
const getEffectivePermissionsForRole = async (req, res) => {
    const { idRole } = req.params;
    console.log(`${LOG_PREFIX_CONTROLLER} getEffectivePermissionsForRole - Solicitud GET /api/roles/${idRole}/effective-permissions recibida.`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const effectivePermissions = await roleService.getRoleEffectivePermissions(idRole);
        console.log(`${LOG_PREFIX_CONTROLLER} getEffectivePermissionsForRole - Permisos efectivos para rol ID ${idRole}:`, JSON.stringify(effectivePermissions, null, 2));
        res.status(200).json(effectivePermissions);
    } catch (error) {
        console.error(`${LOG_PREFIX_CONTROLLER} getEffectivePermissionsForRole - Error para ID ${idRole}: ${error.message}`);
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Error al obtener los permisos efectivos del rol." });
        }
    }
};

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    changeRoleState,
    getRolePrivileges,
    assignPrivileges,
    getEffectivePermissionsForRole,
};