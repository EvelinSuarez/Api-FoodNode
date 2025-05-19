// routes/rolePrivilegesRoutes.js
const express = require("express");
const router = express.Router();

// Controladores y Middlewares
const rolePrivilegesController = require("../controllers/rolePrivilegesController");
const {
  getRolePrivilegeByIdValidation,
  createRolePrivilegeValidation,
  updateRolePrivilegeValidation,
  deleteRolePrivilegeValidation,
} = require("../middlewares/rolePrivilegesValidations");

// (Opcional) Middlewares de autenticación y autorización si estas rutas directas los necesitan
// const verifyToken = require('../middlewares/verifyToken');
// const authorize = require('../middlewares/authPermissions');

console.log("BACKEND: rolePrivilegesRoutes.js - Archivo cargado y router definido.");

/*
 * ==========================================================================
 * Rutas para operaciones CRUD directas sobre la tabla 'RolePrivileges'
 * Estas rutas permiten gestionar entradas individuales en la tabla de unión.
 * Son menos comunes si la asignación principal se hace vía /api/roles/:idRole/privileges.
 * Proteger estas rutas adecuadamente si se exponen.
 * ==========================================================================
 */

// GET /api/roleprivileges
// Obtiene TODAS las entradas de la tabla RolePrivileges (con detalles de rol y privilegio)
router.get("/",
    // verifyToken,  // Descomentar y configurar si se requiere autenticación/autorización
    // authorize(['role-privileges-view-all']), // Ejemplo de permiso
    rolePrivilegesController.getAllRolePrivileges
);

// GET /api/roleprivileges/:idRolePrivilege
// Obtiene UNA entrada específica de RolePrivileges por su Clave Primaria (idPrivilegedRole)
router.get("/:idRolePrivilege",
    // verifyToken,
    // authorize(['role-privileges-view-detail']),
    getRolePrivilegeByIdValidation, // Valida que el ID del parámetro es válido y la entrada existe
    rolePrivilegesController.getRolePrivilegeById
);

// POST /api/roleprivileges
// Crea UNA SOLA entrada en la tabla RolePrivileges.
// Body esperado: { "idRole": <number>, "idPrivilege": <number> }
router.post("/",
    // verifyToken,
    // authorize(['role-privileges-create']), // Permiso específico para esta acción granular
    createRolePrivilegeValidation, // Valida el body (idRole, idPrivilege), existencia y unicidad
    rolePrivilegesController.createRolePrivilege
);

// PUT /api/roleprivileges/:idRolePrivilege
// Actualiza UNA SOLA entrada existente en la tabla RolePrivileges.
// Body esperado: { "idRole": <number>, "idPrivilege": <number> }
router.put("/:idRolePrivilege",
    // verifyToken,
    // authorize(['role-privileges-edit']),
    updateRolePrivilegeValidation, // Valida ID de param, body, existencia y unicidad
    rolePrivilegesController.updateRolePrivilege
);

// DELETE /api/roleprivileges/:idRolePrivilege
// Elimina UNA SOLA entrada de la tabla RolePrivileges por su Clave Primaria.
router.delete("/:idRolePrivilege",
    // verifyToken,
    // authorize(['role-privileges-delete']),
    deleteRolePrivilegeValidation, // Valida que el ID del parámetro es válido y la entrada existe
    rolePrivilegesController.deleteRolePrivilege
);

/*
 * ==========================================================================
 * NOTA SOBRE ASIGNACIÓN MASIVA:
 * La lógica para asignar/reemplazar TODOS los privilegios de un ROL específico
 * (ej. desde un formulario de matriz de permisos) se maneja a través de:
 *      PUT /api/roles/:idRole/privileges
 * Esta ruta es gestionada por `roleController` y `roleService`, que a su vez
 * utilizan `rolePrivilegesRepository` para borrar y hacer bulkCreate.
 * La función `assignPrivilegesToRole` que pudiste tener en `rolePrivilegesController`
 * o `rolePrivilegesService` es generalmente redundante si se sigue ese flujo.
 * ==========================================================================
 */

module.exports = router; // Exportar el router directamente