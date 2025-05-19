// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
// const rolePrivilegesController = require('../controllers/rolePrivilegesController'); // NO LO NECESITAMOS AQUÍ si roleController maneja la asignación
const validations = require('../middlewares/roleValidations');

// --- MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN ---
const verifyToken = require('../middlewares/verifyToken');
const authorize = require('../middlewares/authPermissions');

console.log("BACKEND: roleRoutes.js - Archivo cargado.");

// --- Rutas CRUD básicas para Roles ---
router.post('/',
    verifyToken,
    authorize(['roles-create']),
    validations.createRoleValidation,
    roleController.createRole // Usa la función createRole de roleController (que llama a roleService)
);

router.get('/',
    verifyToken,
    authorize(['roles-view']),
    roleController.getAllRoles
);

router.get('/:idRole',
    verifyToken,
    authorize(['roles-view']),
    validations.getRoleByIdValidation,
    roleController.getRoleById
);

router.put('/:idRole', // Para actualizar nombre/estado del ROL
    verifyToken,
    authorize(['roles-edit']),
    validations.updateRoleValidation,
    roleController.updateRole
);

router.patch('/:idRole/state',
    verifyToken,
    authorize(['roles-status']),
    validations.changeRoleStateValidation,
    roleController.changeRoleState
);

router.delete('/:idRole',
    verifyToken,
    authorize(['roles-delete']),
    validations.deleteRoleValidation,
    roleController.deleteRole
);

// --- Ruta para Permisos Efectivos de un Rol ---
router.get('/:idRole/effective-permissions',
    verifyToken,
    authorize(['roles-view']),
    validations.getRoleByIdValidation,
    roleController.getEffectivePermissionsForRole
);

// --- Rutas para manejar los Privilegios/Permisos asignados a un Rol ---
// (Esto es lo que el FormPermissions.jsx usa para mostrar/guardar la matriz de permisos)

// Obtiene las asignaciones actuales para el FormPermissions [{idPermission, idPrivilege}, ...]
router.get('/:idRole/privileges',
    verifyToken,
    authorize(['roles-view']),
    validations.getRoleByIdValidation,
    roleController.getRolePrivileges // Usa la función getRolePrivileges de roleController (que llama a roleService)
);

// Guarda/Reemplaza las nuevas asignaciones del FormPermissions.
// El cuerpo de la solicitud debe ser un array: [{ idPermission, idPrivilege }, ...]
router.put('/:idRole/privileges',
    verifyToken,
    authorize(['roles-edit']),
    validations.assignPrivilegesValidation, // Valida el body de la petición
    roleController.assignPrivileges // <--- CORREGIDO AQUÍ: Usa la función assignPrivileges de roleController
);

module.exports = router;