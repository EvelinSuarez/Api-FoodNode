// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const rolePrivilegesController = require('../controllers/rolePrivilegesController');
const validations = require('../middlewares/roleValidations'); // Asumo que este archivo existe y es correcto

// --- MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN ---
const verifyToken = require('../middlewares/verifyToken'); // Usará el payload del token con id, idRole
const authorize = require('../middlewares/authPermissions'); // Usará req.user.idRole

console.log("BACKEND: roleRoutes.js - Archivo cargado.");

// --- Rutas CRUD básicas para Roles ---
router.post('/',
    verifyToken,
    authorize(['roles-create']), // Ejemplo: se necesita el permiso 'roles-create'
    validations.createRoleValidation,
    roleController.createRole
);

router.get('/',
    verifyToken,
    authorize(['roles-view']), // Ejemplo: se necesita el permiso 'roles-view'
    roleController.getAllRoles
);

router.get('/:idRole',
    verifyToken,
    authorize(['roles-view']), // O 'roles-view-details' si tienes esa granularidad
    validations.getRoleByIdValidation,
    roleController.getRoleById
);

router.put('/:idRole',
    verifyToken,
    authorize(['roles-edit']),
    validations.updateRoleValidation,
    roleController.updateRole
);

// Considera si cambiar el estado es 'roles-edit' o un permiso más específico como 'roles-status'
router.patch('/:idRole/state', // Asumiendo que tienes un permiso como 'roles-status' o usas 'roles-edit'
    verifyToken,
    authorize(['roles-status']), // o ['roles-edit'] si es el caso
    validations.changeRoleStateValidation,
    roleController.changeRoleState
);

router.delete('/:idRole', // Usualmente los deletes no se usan, se inhabilita el estado. Si lo usas:
    verifyToken,
    authorize(['roles-delete']),
    validations.deleteRoleValidation,
    roleController.deleteRole
);


// --- Ruta para Permisos Efectivos de un Rol (cómo lo pide el frontend) ---
// Esta ruta la usa el frontend para saber qué permisos tiene un rol.
// Generalmente, un usuario que puede ver roles o editar roles debería poder ver esto.
router.get('/:idRole/effective-permissions',
    verifyToken,
    authorize(['roles-view']), // O un permiso más específico si lo deseas
    validations.getRoleByIdValidation, // Valida que idRole sea un número y exista
    roleController.getEffectivePermissionsForRole // Controlador que devuelve los permisos en formato { modulo: [accion1, accion2] }
);


// --- Rutas para manejar los Privilegios/Permisos asignados a un Rol ---
// (Esto es lo que el FormPermissions.jsx usa para mostrar/guardar la matriz de permisos)
router.get('/:idRole/privileges', // Obtiene las asignaciones actuales para el FormPermissions
    verifyToken,
    authorize(['roles-view']), // Quien puede ver roles, puede ver sus asignaciones
    validations.getRoleByIdValidation,
    rolePrivilegesController.getRoleAssignments // Devuelve { idPermission, idPrivilege }
);

router.put('/:idRole/privileges', // Guarda las nuevas asignaciones del FormPermissions
    verifyToken,
    authorize(['roles-edit']), // Quien puede editar roles, puede cambiar sus asignaciones
    validations.assignPrivilegesValidation, // Valida el body de la petición
    rolePrivilegesController.assignPrivilegesToRole
);

module.exports = router;