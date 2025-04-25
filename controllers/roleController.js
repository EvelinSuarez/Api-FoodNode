// controllers/roleController.js
const { validationResult } = require('express-validator');
const roleService = require('../services/roleService'); // Asegúrate que la ruta es correcta

// --- Mantener estas importaciones SOLO si las necesitas en alguna lógica que NO moviste al servicio ---
// const Role = require('../models/role');
// const Privilege = require('../models/privilege');
// const Permission = require('../models/permission'); // Ojo, aquí tenías 'permission' en minúscula antes
// const RolePrivileges = require('../models/rolePrivileges'); // Este modelo NO debería usarse aquí directamente

// POST /role (Crear rol con privilegios opcionales)
const createRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // El servicio createRole (o createRoleWithPrivileges si lo renombraste en el servicio)
        // ahora se encarga de manejar req.body.rolePrivileges si existe.
        const role = await roleService.createRole(req.body); // Asume que tu servicio se llama createRole
        res.status(201).json(role);
    } catch (error) {
        console.error("Controller Error in createRole:", error.message);
        res.status(400).json({ message: error.message });
    }
};

// GET /role (Obtener todos los roles)
const getAllRoles = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        console.error("Controller Error in getAllRoles:", error.message);
        // Considera un 500 si es un error inesperado del servidor
        res.status(500).json({ message: "Error al obtener roles" });
    }
};

// GET /role/:idRole (Obtener un rol por ID)
const getRoleById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const role = await roleService.getRoleById(req.params.idRole);
        // El servicio ya debería lanzar error si no se encuentra
        res.status(200).json(role);
    } catch (error) {
        console.error(`Controller Error in getRoleById (${req.params.idRole}):`, error.message);
        if (error.message.includes('Rol no encontrado')) {
             res.status(404).json({ message: error.message });
        } else {
             res.status(500).json({ message: "Error al obtener el rol" });
        }
    }
};

// PUT /role/:idRole (Actualizar solo nombre/estado del rol)
const updateRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // El servicio updateRole debe asegurarse de solo actualizar los campos permitidos (nombre, estado)
        await roleService.updateRole(req.params.idRole, req.body);
        res.status(204).end(); // Éxito sin contenido
    } catch (error) {
        console.error(`Controller Error in updateRole (${req.params.idRole}):`, error.message);
         if (error.message.includes('Rol no encontrado')) {
             res.status(404).json({ message: error.message });
        } else {
             // Podría ser un error de validación de nombre duplicado desde el servicio
             res.status(400).json({ message: error.message });
        }
    }
};

// DELETE /role/:idRole (Eliminar un rol)
const deleteRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // El servicio deleteRole maneja las validaciones de negocio (ej: usuarios asociados)
        await roleService.deleteRole(req.params.idRole);
        res.status(204).end();
    } catch (error) {
        console.error(`Controller Error in deleteRole (${req.params.idRole}):`, error.message);
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else if (error.message.includes('usuarios asociados')) {
            // Usar 409 Conflict es apropiado aquí
            res.status(409).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

// PATCH /role/:idRole/state (Cambiar estado del rol)
const changeRoleState = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // Asegúrate de que el body contenga 'status' (la validación debería cubrirlo)
    if (req.body.status === undefined) {
         return res.status(400).json({ message: "El campo 'status' es requerido en el body." });
    }
    try {
        await roleService.changeRoleState(req.params.idRole, req.body.status);
        res.status(204).end();
    } catch (error) {
         console.error(`Controller Error in changeRoleState (${req.params.idRole}):`, error.message);
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

// --- Controladores para Privilegios del Rol ---

// GET /role/:idRole/privileges (Obtener los IDs de privilegios asignados)
// *** NUEVO CONTROLADOR ***
const getRolePrivileges = async (req, res) => {
     const errors = validationResult(req); // Valida el formato del :idRole
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Llama al método del servicio correspondiente
        const privileges = await roleService.getRolePrivileges(req.params.idRole);
        res.status(200).json(privileges); // Devuelve el array [{idPermission, idPrivilege}, ...]
    } catch (error) {
        console.error(`Controller Error in getRolePrivileges for role ${req.params.idRole}:`, error.message);
         if (error.message.includes('Rol no encontrado')) {
             res.status(404).json({ message: error.message });
        } else {
             // Error genérico si falla la consulta al servicio/repositorio
             res.status(500).json({ message: "Error al obtener los privilegios del rol" });
        }
    }
};

// PUT /role/:idRole/privileges (Reemplazar/Asignar todos los privilegios)
// *** MÉTODO 'assignPrivileges' EXISTENTE, PERO CON LÓGICA SIMPLIFICADA ***
const assignPrivileges = async (req, res) => {
    const errors = validationResult(req); // Usa la validación 'assignPrivilegesValidation' de las rutas
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { idRole } = req.params;
        // El payload esperado (según la validación y el servicio) es un objeto
        // que contiene la clave 'rolePrivileges' con el array de asignaciones.
        // Si tu validación usa 'privilegePermissions', usa ese nombre aquí.
        const { rolePrivileges } = req.body; // <-- Asegúrate que este nombre coincida con lo que envía el frontend y valida el middleware

        // Verificar que el array existe en el body (aunque la validación ya debería hacerlo)
        if (!rolePrivileges) {
             return res.status(400).json({ message: "El campo 'rolePrivileges' (o similar) es requerido en el body con un array de asignaciones." });
        }

        // Llama al método del servicio correspondiente
        await roleService.assignPrivilegesToRole(idRole, rolePrivileges);

        // Éxito
        res.status(200).json({ message: "Privilegios asignados correctamente" });

    } catch (error) {
         console.error(`Controller Error in assignPrivileges for role ${req.params.idRole}:`, error.message);
         if (error.message.includes('Rol no encontrado')) {
             res.status(404).json({ message: error.message });
        } else {
             // Otros errores (ej: formato inválido, error de base de datos)
             res.status(400).json({ message: error.message });
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
    assignPrivileges, // Mantenido el nombre, lógica interna simplificada
    getRolePrivileges, // Nuevo método exportado
};