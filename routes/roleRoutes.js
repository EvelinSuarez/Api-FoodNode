// backend/routes/roleRoutes.js
const express = require('express');
const router = express.Router();

// Controladores
const roleController = require('../controllers/roleController');

// Middlewares
const validations = require('../middlewares/roleValidations'); // Middlewares de validación específicos para roles
const verifyToken = require('../middlewares/verifyToken');      // Middleware para verificar el JWT y establecer req.user
const authorize = require('../middlewares/authPermissions');    // Middleware para verificar permisos basados en req.user.idRole

console.log("BACKEND: roleRoutes.js - Definición de rutas de roles cargada.");

/*
 * ==========================================================================
 * Rutas para la Gestión de Roles (CRUD)
 * Todas estas rutas requieren autenticación y permisos específicos.
 * ==========================================================================
 */

// POST /api/role - Crear un nuevo rol y sus privilegios iniciales (si se envían)
router.post('/',
    verifyToken,                        // 1. Autentica al usuario
    authorize(['roles-create']),        // 2. Autoriza basado en el permiso 'roles-create'
    validations.createRoleValidation,   // 3. Valida los datos de la solicitud
    roleController.createRole           // 4. Ejecuta la lógica del controlador
);

// GET /api/role - Obtener todos los roles
router.get('/',
    verifyToken,
    authorize(['roles-view']),
    roleController.getAllRoles
);

// GET /api/role/:idRole - Obtener un rol específico por su ID
router.get('/:idRole',
    verifyToken,
    authorize(['roles-view']),
    validations.getRoleByIdValidation,  // Valida que el ID del rol sea válido y exista
    roleController.getRoleById
);

// PUT /api/role/:idRole - Actualizar un rol existente (nombre, estado)
router.put('/:idRole',
    verifyToken,
    authorize(['roles-edit']),
    validations.updateRoleValidation,
    roleController.updateRole
);

// PATCH /api/role/:idRole/state - Cambiar el estado (activo/inactivo) de un rol
router.patch('/:idRole/state',
    verifyToken,
    authorize(['roles-status']),        // O podría ser 'roles-edit' si prefieres
    validations.changeRoleStateValidation,
    roleController.changeRoleState
);

// DELETE /api/role/:idRole - Eliminar un rol
router.delete('/:idRole',
    verifyToken,
    authorize(['roles-delete']),
    validations.deleteRoleValidation,
    roleController.deleteRole
);

/*
 * ==========================================================================
 * Rutas para Permisos y Privilegios de Roles
 * ==========================================================================
 */

// GET /api/role/:idRole/effective-permissions - Obtener los permisos efectivos formateados para el frontend
// Esta ruta es la que el AuthProvider (frontend) podría llamar para un admin, o si se quiere refrescar.
// Para usuarios normales, los permisos vienen con la respuesta del login.
router.get('/:idRole/effective-permissions',
    verifyToken,
    authorize(['roles-view']),          // Requiere 'roles-view' para ver permisos de cualquier rol
    validations.getRoleByIdValidation,
    roleController.getEffectivePermissionsForRole // Llama a la función del controlador que usa authService.getEffectivePermissionsForRole
);

// GET /api/role/:idRole/privileges - Obtener las asignaciones de privilegios de un rol
// (Usado, por ejemplo, por un formulario de matriz de permisos para mostrar las selecciones actuales)
router.get('/:idRole/privileges',
    verifyToken,
    authorize(['roles-view']),          // O 'roles-edit' si ver los privilegios es parte de la edición
    validations.getRoleByIdValidation,
    roleController.getRolePrivileges
);

// PUT /api/role/:idRole/privileges - Reemplazar/Actualizar todas las asignaciones de privilegios de un rol
// (Usado, por ejemplo, al guardar desde un formulario de matriz de permisos)
router.put('/:idRole/privileges',
    verifyToken,
    authorize(['roles-edit']),
    validations.assignPrivilegesValidation, // Valida el cuerpo de la solicitud (array de {idPermission, idPrivilege})
    roleController.assignPrivileges
);

module.exports = router;