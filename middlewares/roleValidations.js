// middlewares/roleValidations.js
const { body, param } = require('express-validator');
const { Role, User } = require('../models'); // Importar modelos necesarios
const { Op } = require('sequelize'); // Necesario para la validación OnUpdate

// --- Funciones de Validación Personalizadas ---

// Valida si un rol existe por su ID
const validateRoleExistence = async (idRole) => {
    const role = await Role.findByPk(idRole);
    if (!role) {
        // Usar reject para que express-validator lo maneje como error
        return Promise.reject('El rol no existe');
    }
};

// Valida si un nombre de rol ya existe (para CREACIÓN)
const validateUniqueRoleNameOnCreate = async (roleName) => {
    const role = await Role.findOne({ where: { roleName } });
    if (role) {
        return Promise.reject('El nombre del rol ya existe');
    }
};

// Valida si un nombre de rol ya existe en OTRO rol (para ACTUALIZACIÓN)
const validateUniqueRoleNameOnUpdate = async (roleName, { req }) => {
    // Busca un rol con el mismo nombre pero diferente ID al que se está actualizando
    const role = await Role.findOne({
        where: {
            roleName,
            idRole: { [Op.ne]: req.params.idRole } // Op.ne = Not Equal
        }
    });
    if (role) {
        return Promise.reject('El nombre del rol ya está siendo utilizado por otro rol');
    }
};


// Valida si un rol tiene usuarios asociados (para ELIMINACIÓN)
const validateRoleHasNoUsers = async (idRole) => {
    // Usar count es más eficiente que findOne si solo necesitas saber si existe alguno
    const count = await User.count({ where: { idRole } });
    if (count > 0) {
        return Promise.reject('No se puede eliminar el rol porque tiene usuarios asociados');
    }
};

// Valida que el usuario logueado no esté eliminando su propio rol
// (Requiere que tengas información del usuario en req.user, ej: desde un middleware de autenticación)
const validateRoleNotAssignedToLoggedUser = async (idRole, { req }) => {
    // Verifica si req.user y req.user.idRole existen antes de comparar
    if (req.user && req.user.idRole && req.user.idRole == idRole) { // Usar == por si vienen como string/number
        return Promise.reject('No puedes eliminar tu propio rol asignado');
    }
    // Si no hay req.user o no coincide, la validación pasa
};

// --- Conjuntos de Reglas de Validación por Ruta ---

// GET /role/:idRole
const getRoleByIdValidation = [
    param('idRole')
        .isInt({ min: 1 }).withMessage('El ID del rol debe ser un número entero positivo'),
    // Opcional: validar existencia aquí o confiar en el servicio/controlador para el 404
    param('idRole').custom(validateRoleExistence)
];

// POST /role (Crear)
const createRoleValidation = [
    body('roleName')
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('El nombre del rol debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\s]+$/).withMessage('El nombre del rol solo puede contener letras, números y espacios')
        .custom(validateUniqueRoleNameOnCreate), // Validación de unicidad para creación
    body('status')
        .optional() // El estado puede ser opcional (asumir true por defecto en el servicio)
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false)'),
    // Validación opcional para rolePrivileges si se envían en la creación
    body('rolePrivileges')
        .optional()
        .isArray().withMessage('rolePrivileges debe ser un array si se proporciona')
        .custom((privileges) => {
            // Valida la estructura interna del array si existe
            if (!privileges) return true; // Pasa si no se envía
            const isValid = privileges.every(p =>
                typeof p === 'object' && p !== null &&
                Number.isInteger(p.idPermission) && p.idPermission > 0 &&
                Number.isInteger(p.idPrivilege) && p.idPrivilege > 0
            );
            if (!isValid) {
                throw new Error('Cada elemento en rolePrivileges debe ser un objeto con idPermission e idPrivilege como enteros positivos');
            }
            return true;
        }),
];

// PUT /role/:idRole (Actualizar Nombre/Estado)
const updateRoleValidation = [
    param('idRole')
        .isInt({ min: 1 }).withMessage('El ID del rol debe ser un número entero positivo')
        .custom(validateRoleExistence), // Validar que el rol a actualizar exista
    // Validar solo los campos que se actualizan en esta ruta
    body('roleName')
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('El nombre del rol debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\s]+$/).withMessage('El nombre del rol solo puede contener letras, números y espacios')
        .custom(validateUniqueRoleNameOnUpdate), // Validación de unicidad para actualización
    body('status')
        .optional() // Puede que solo se actualice el nombre o el estado
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false)'),
    // Asegurarse explícitamente que NO se envíen privilegios por esta ruta
    body('rolePrivileges')
        .not().exists().withMessage('La actualización de privilegios se realiza a través de la ruta PUT /role/:idRole/privileges')
];

// DELETE /role/:idRole
const deleteRoleValidation = [
    param('idRole')
        .isInt({ min: 1 }).withMessage('El ID del rol debe ser un número entero positivo')
        .custom(validateRoleExistence) // Validar existencia
        .custom(validateRoleHasNoUsers) // Validar que no tenga usuarios
        .custom(validateRoleNotAssignedToLoggedUser), // Validar que no sea el propio rol
];

// PATCH /role/:idRole/state (Cambiar Estado)
const changeRoleStateValidation = [
    param('idRole')
        .isInt({ min: 1 }).withMessage('El ID del rol debe ser un número entero positivo')
        .custom(validateRoleExistence), // Validar existencia
    body('status')
        .exists({ checkFalsy: false }).withMessage('El campo status es requerido') // checkFalsy: false permite enviar 'false'
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false)'),
];

// GET /role/:idRole/privileges
const getRolePrivilegesValidation = [
     param('idRole')
        .isInt({ min: 1 }).withMessage('El ID del rol debe ser un número entero positivo'),
     // Opcional validar existencia aquí, pero el servicio ya debería devolver 404 si no existe
     // param('idRole').custom(validateRoleExistence),
];

// PUT /role/:idRole/privileges (Asignar/Reemplazar Privilegios)
const assignPrivilegesValidation = [
     param('idRole')
        .isInt({ min: 1 }).withMessage('El ID del rol debe ser un número entero positivo')
        .custom(validateRoleExistence), // Es bueno validar que el rol exista antes de intentar asignar
     // Validar el cuerpo de la petición
     body('rolePrivileges') // <<<--- USA ESTE NOMBRE SI EL FRONTEND ENVÍA { "rolePrivileges": [...] }
        // Si el frontend envía { "privilegePermissions": [...] }, cambia 'rolePrivileges' por 'privilegePermissions' aquí abajo
        .exists().withMessage("El campo 'rolePrivileges' es requerido en el body")
        .isArray().withMessage('El campo rolePrivileges debe ser un array')
        .custom((privileges, { req }) => { // Puedes acceder a 'req' si es necesario
            // Permite enviar un array vacío para quitar todos los permisos
            if (privileges.length === 0) {
                return true;
            }
            // Si no está vacío, valida la estructura interna
            const isValid = privileges.every(p =>
                typeof p === 'object' && p !== null &&
                Number.isInteger(p.idPermission) && p.idPermission > 0 &&
                Number.isInteger(p.idPrivilege) && p.idPrivilege > 0
            );
            if (!isValid) {
                // Mensaje de error más específico
                throw new Error('Cada elemento en rolePrivileges debe ser un objeto con las propiedades idPermission e idPrivilege como enteros positivos.');
            }
            // Podrías añadir validaciones más complejas aquí si fuera necesario
            // (ej: verificar que los idPermission/idPrivilege realmente existen en sus tablas, aunque puede ser costoso)
            return true;
        }),
];


module.exports = {
    getRoleByIdValidation,
    createRoleValidation,
    updateRoleValidation,
    deleteRoleValidation,
    changeRoleStateValidation,
    // --- Añadido ---
    getRolePrivilegesValidation,
    assignPrivilegesValidation,
    // --- Fin Añadido ---
};