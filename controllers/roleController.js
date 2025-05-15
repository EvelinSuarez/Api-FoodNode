// controllers/roleController.js
const { validationResult } = require('express-validator');
const roleService = require('../services/roleService'); // Asegúrate que la ruta es correcta

// POST /role
const createRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const role = await roleService.createRole(req.body);
        res.status(201).json(role);
    } catch (error) {
        console.error("Controller Error in createRole:", error.message);
        // Devuelve un mensaje más específico si el servicio lo proporciona
        const statusCode = error.message.toLowerCase().includes("ya existe") ? 409 : 400;
        res.status(statusCode).json({ message: error.message });
    }
};

// GET /role
const getAllRoles = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        console.error("Controller Error in getAllRoles:", error.message);
        res.status(500).json({ message: "Error al obtener roles." });
    }
};

// GET /role/:idRole
const getRoleById = async (req, res) => {
    const errors = validationResult(req); // Validaciones de formato de ID desde el middleware
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const roleId = req.params.idRole; // Ya validado como numérico por el middleware
        const role = await roleService.getRoleById(roleId);
        // El servicio ya lanza "Rol no encontrado" que se maneja abajo
        res.status(200).json(role);
    } catch (error) {
        console.error(`Controller Error in getRoleById (${req.params.idRole}):`, error.message);
        if (error.message.includes('Rol no encontrado')) {
             res.status(404).json({ message: error.message });
        } else {
             res.status(500).json({ message: "Error al obtener el rol." });
        }
    }
};

// PUT /role/:idRole
const updateRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const roleId = req.params.idRole;
        await roleService.updateRole(roleId, req.body);
        // El servicio debería lanzar error si el rol no existe o si hay error de validación (ej. nombre duplicado)
        const updatedRole = await roleService.getRoleById(roleId); // Opcional: devolver el rol actualizado
        res.status(200).json(updatedRole); // O res.status(204).end(); si no devuelves nada
    } catch (error) {
        console.error(`Controller Error in updateRole (${req.params.idRole}):`, error.message);
         if (error.message.includes('Rol no encontrado')) {
             res.status(404).json({ message: error.message });
        } else if (error.message.toLowerCase().includes("ya existe")) { // Para nombres duplicados
            res.status(409).json({ message: error.message });
        } else {
             res.status(400).json({ message: error.message }); // Otros errores de validación del servicio
        }
    }
};

// DELETE /role/:idRole
const deleteRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await roleService.deleteRole(req.params.idRole);
        res.status(204).end();
    } catch (error) {
        console.error(`Controller Error in deleteRole (${req.params.idRole}):`, error.message);
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else if (error.message.includes('usuarios asociados')) {
            res.status(409).json({ message: error.message }); // Conflict
        } else {
            res.status(500).json({ message: error.message }); // Otros errores
        }
    }
};

// PATCH /role/:idRole/state
const changeRoleState = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // La validación de 'status' en el body ya está en el middleware 'changeRoleStateValidation'
    try {
        await roleService.changeRoleState(req.params.idRole, req.body.status);
        res.status(204).end();
    } catch (error) {
         console.error(`Controller Error in changeRoleState (${req.params.idRole}):`, error.message);
        if (error.message.includes('Rol no encontrado')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message }); // Otros errores (ej. valor de status inválido)
        }
    }
};

// --- Controladores para Privilegios del Rol (si los manejas aquí) ---

// GET /role/:idRole/privileges
const getRolePrivileges = async (req, res) => {
    const errors = validationResult(req); // Viene de getRoleByIdValidation en la ruta
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const privileges = await roleService.getRolePrivileges(req.params.idRole);
        // Si el rol no tiene privilegios, el servicio devuelve array vacío, lo cual es 200 OK.
        res.status(200).json(privileges);
    } catch (error) {
        console.error(`Controller Error in getRolePrivileges for role ${req.params.idRole}:`, error.message);
         if (error.message.includes('Rol no encontrado')) { // Error del servicio si el rol base no existe
             res.status(404).json({ message: error.message });
        } else {
             res.status(500).json({ message: "Error al obtener los privilegios del rol." });
        }
    }
};

// PUT /role/:idRole/privileges
const assignPrivileges = async (req, res) => {
    const errors = validationResult(req); // Viene de assignPrivilegesValidation
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idRole } = req.params;
        // El middleware assignPrivilegesValidation ya debería haber validado la estructura de req.body.rolePrivileges
        const rolePrivileges = req.body; // Asumiendo que el body es el array directamente
                                         // o req.body.rolePrivileges si está anidado

        await roleService.assignPrivilegesToRole(idRole, rolePrivileges);
        res.status(200).json({ message: "Privilegios asignados correctamente." });
    } catch (error) {
         console.error(`Controller Error in assignPrivileges for role ${req.params.idRole}:`, error.message);
         if (error.message.includes('Rol no encontrado')) {
             res.status(404).json({ message: error.message });
        } else if (error.message.includes("Se esperaba un array") || error.message.includes("inválido")) {
             res.status(400).json({ message: error.message }); // Errores de validación de datos de privilegios
        }
         else {
             res.status(500).json({ message: "Error al asignar privilegios al rol." });
        }
    }
};

// --- Controlador para Permisos Efectivos ---
const getEffectivePermissionsForRole = async (req, res) => {
    const errors = validationResult(req); // Viene de getRoleByIdValidation
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idRole } = req.params;
        const effectivePermissions = await roleService.getRoleEffectivePermissions(idRole);
        res.status(200).json(effectivePermissions);
    } catch (error) {
        console.error(`Controller Error in getEffectivePermissionsForRole for role ${req.params.idRole}:`, error.message);
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
    // Si estos son los controladores principales para privilegios, deben estar aquí:
    getRolePrivileges,
    assignPrivileges,
    // Y el de permisos efectivos:
    getEffectivePermissionsForRole,
};