// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
// Asegúrate que el nombre del archivo importado coincida con el tuyo
const validations = require('../middlewares/roleValidations');
// const authMiddleware = require('../middlewares/authMiddleware'); // Descomenta si usas autenticación

// router.use(authMiddleware.verifyToken); // Aplicar autenticación si es necesario

// --- Rutas CRUD básicas para Roles ---

// POST /role (Crear Rol CON privilegios opcionales en el body)
router.post('/',
    validations.createRoleValidation, // Valida roleName, status y opcionalmente rolePrivileges
    roleController.createRole         // Llama al controlador que usa el servicio createRole (o createRoleWithPrivileges)
);

// GET /role (Obtener todos los roles)
router.get('/',
    roleController.getAllRoles
);

// GET /role/:idRole (Obtener un rol por ID)
router.get('/:idRole',
    validations.getRoleByIdValidation, // Valida el formato del ID
    roleController.getRoleById
);

// PUT /role/:idRole (Actualizar solo nombre/estado del rol)
router.put('/:idRole',
    validations.updateRoleValidation, // Valida ID, roleName, status (NO privilegios)
    roleController.updateRole
);

// DELETE /role/:idRole (Eliminar un rol)
router.delete('/:idRole',
    validations.deleteRoleValidation, // Valida ID y condiciones de eliminación
    roleController.deleteRole
);

// PATCH /role/:idRole/state (Cambiar estado del rol)
// Esta ruta es más explícita que solo /:idRole para PATCH
router.patch('/:idRole/state',
    validations.changeRoleStateValidation, // Valida ID y el campo status en el body
    roleController.changeRoleState
);


// --- Rutas para manejar los Privilegios asociados a un Rol ---

// GET /role/:idRole/privileges (Obtener los IDs de privilegios asignados a un rol)
// *** RUTA NECESARIA ***
router.get('/:idRole/privileges',
    validations.getRolePrivilegesValidation, // Valida el formato del ID del rol
    roleController.getRolePrivileges        // Llama al controlador getRolePrivileges
);

// PUT /role/:idRole/privileges (Reemplazar TODAS las asignaciones de privilegios para un rol)
// *** RUTA NECESARIA ***
router.put('/:idRole/privileges',
    validations.assignPrivilegesValidation, // Valida ID y el array 'rolePrivileges' (o similar) en el body
    roleController.assignPrivileges         // Llama al controlador assignPrivileges
);
// --- Fin Rutas Privilegios ---


module.exports = router;