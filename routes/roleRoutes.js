// routes/roleRoutes.js (COMPLETO Y CORREGIDO)

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController'); // Controlador para CRUD de Roles
// --- ¡IMPORTA EL CONTROLADOR QUE MANEJA ASIGNACIONES! ---
const rolePrivilegesController = require('../controllers/rolePrivilegesController'); // Ajusta la ruta si es necesario
// --- Middlewares de Validación y Autenticación/Autorización ---
const validations = require('../middlewares/roleValidations'); // Tus validaciones de roles
// const { verifyToken } = require('../middlewares/auth'); // Descomenta si usas autenticación/JWT
// const authorize = require('../middlewares/authPermissions'); // Descomenta si usas autorización basada en permisos

// --- Middleware Global de Autenticación (Opcional) ---
// Si TODAS las rutas de roles requieren autenticación, puedes usarlo aquí:
// router.use(verifyToken);

// --- Rutas CRUD básicas para Roles (usando roleController) ---

// POST /api/roles (Crear un nuevo Rol)
// Asume que createRole en roleController maneja solo la creación del rol, no los privilegios iniciales.
// La asignación se haría con PUT /roles/:idRole/privileges después.
router.post('/',
    // verifyToken, authorize(['roles-create']), // Ejemplo de protección
    validations.createRoleValidation,
    roleController.createRole
);

// GET /api/roles (Obtener todos los roles)
router.get('/',
    // verifyToken, authorize(['roles-view']), // Ejemplo de protección
    roleController.getAllRoles
);

// GET /api/roles/:idRole (Obtener un rol por ID)
router.get('/:idRole',
    // verifyToken, authorize(['roles-view']), // Ejemplo de protección
    validations.getRoleByIdValidation,
    roleController.getRoleById
);

// PUT /api/roles/:idRole (Actualizar solo nombre/estado del rol)
router.put('/:idRole',
    // verifyToken, authorize(['roles-edit']), // Ejemplo de protección
    validations.updateRoleValidation, // Valida ID, roleName, status
    roleController.updateRole
);

// DELETE /api/roles/:idRole (Eliminar un rol - ¡CUIDADO! Usualmente se desactiva)
router.delete('/:idRole',
    // verifyToken, authorize(['roles-delete']), // Ejemplo de protección
    validations.deleteRoleValidation,
    roleController.deleteRole
);

// PATCH /api/roles/:idRole/state (Cambiar estado del rol - más seguro que delete)
router.patch('/:idRole/state',
    // verifyToken, authorize(['roles-edit']), // Ejemplo de protección (mismo que editar?)
    validations.changeRoleStateValidation,
    roleController.changeRoleState
);


// --- Rutas para manejar los Privilegios asociados a un Rol (usando rolePrivilegesController) ---

// GET /api/roles/:id/privileges (Obtener las asignaciones [idPermission, idPrivilege] para un rol)
// Esta es la ruta que tu FormPermissions necesita para cargar el estado inicial
router.get('/:id/privileges', // <-- Cambiado de :idRole a :id para consistencia con otras rutas
    // verifyToken, authorize(['roles-view']), // Protección: ¿Quién puede ver asignaciones?
    validations.getRoleByIdValidation, // Reutiliza la validación de ID de rol
    rolePrivilegesController.getRoleAssignments // <-- Llama a la función del OTRO controlador
);

// PUT /api/roles/:id/privileges (Reemplazar TODAS las asignaciones de privilegios para un rol)
// El frontend enviará el array de { idPermission, idPrivilege } en el body
router.put('/:id/privileges', // <-- Cambiado de :idRole a :id
    // verifyToken, authorize(['roles-edit']), // Protección: ¿Quién puede editar asignaciones?
    // Necesitarás una validación para el body (que sea un array, etc.)
    // Podrías crearla en roleValidations.js o rolePrivilegesValidations.js
    // validations.assignPrivilegesValidation, // Descomenta si creas la validación
    rolePrivilegesController.assignPrivilegesToRole // <-- Llama a la función del OTRO controlador
);
// --- Fin Rutas Privilegios ---


module.exports = router;