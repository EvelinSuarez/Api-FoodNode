// middlewares/roleValidations.js
const { body, param, validationResult } = require('express-validator'); // Añadido validationResult
const { Role, User } = require('../models'); // Importar modelos necesarios
const { Op } = require('sequelize'); // Necesario para la validación OnUpdate

// --- Funciones de Validación Personalizadas ---

/**
 * Valida si un rol existe por su ID.
 * Esta función ahora incluye logging detallado y manejo de tipo para idRole.
 * @param {*} idRole El ID del rol a validar, puede ser string o number.
 * @param {object} options - Opciones, incluyendo { req } para el contexto de la solicitud.
 * @returns Promise
 */
const validateRoleExistence = async (idRole, { req }) => {
    const LOG_VALIDATION_PREFIX = `[validateRoleExistence for ${req.method} ${req.originalUrl}]`;
    console.log(`${LOG_VALIDATION_PREFIX} Iniciando validación para idRole: '${idRole}' (tipo: ${typeof idRole})`);

    // ... (verificación de undefined/null/vacío) ...

    const numericIdRole = Number(idRole); // CONVERSIÓN IMPORTANTE
    if (isNaN(numericIdRole) || numericIdRole <= 0) {
        console.error(`${LOG_VALIDATION_PREFIX} idRole '${idRole}' no es un número entero positivo. Rechazando.`);
        return Promise.reject('El ID del rol debe ser un número entero positivo.');
    }

    try {
        console.log(`${LOG_VALIDATION_PREFIX} Buscando rol con ID numérico: ${numericIdRole}`);
        const role = await Role.findByPk(numericIdRole); // USA EL ID NUMÉRICO

        if (!role) {
            console.warn(`${LOG_VALIDATION_PREFIX} Rol con ID ${numericIdRole} NO encontrado en la BD.`);
            return Promise.reject('El rol especificado no existe.');
        }

        console.log(`${LOG_VALIDATION_PREFIX} Rol con ID ${numericIdRole} ENCONTRADO.`);
        req.foundRole = role;
        return Promise.resolve();
    } catch (dbError) {
        console.error(`${LOG_VALIDATION_PREFIX} Error de base de datos al buscar rol con ID ${numericIdRole}:`, dbError);
        return Promise.reject('Error interno al verificar la existencia del rol.');
    }
};

// (El resto de tus funciones de validación personalizadas como validateUniqueRoleNameOnCreate, etc., permanecen igual)
// Valida si un nombre de rol ya existe (para CREACIÓN)
const validateUniqueRoleNameOnCreate = async (roleName) => {
    const role = await Role.findOne({ where: { roleName } });
    if (role) {
        return Promise.reject('El nombre del rol ya existe');
    }
};

// Valida si un nombre de rol ya existe en OTRO rol (para ACTUALIZACIÓN)
const validateUniqueRoleNameOnUpdate = async (roleName, { req }) => {
    const role = await Role.findOne({
        where: {
            roleName,
            idRole: { [Op.ne]: req.params.idRole }
        }
    });
    if (role) {
        return Promise.reject('El nombre del rol ya está siendo utilizado por otro rol');
    }
};

// Valida si un rol tiene usuarios asociados (para ELIMINACIÓN)
const validateRoleHasNoUsers = async (idRole) => {
    const count = await User.count({ where: { idRole } });
    if (count > 0) {
        return Promise.reject('No se puede eliminar el rol porque tiene usuarios asociados');
    }
};

// Valida que el usuario logueado no esté eliminando su propio rol
const validateRoleNotAssignedToLoggedUser = async (idRole, { req }) => {
    if (req.user && req.user.idRole && req.user.idRole == idRole) {
        return Promise.reject('No puedes eliminar tu propio rol asignado');
    }
};

// --- Middleware para manejar errores de validación ---
// Es buena práctica tener un middleware que maneje los resultados de express-validator
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Loguear los errores para depuración en el servidor
        console.error("[ValidationErrorHandler] Errores de validación:", JSON.stringify(errors.array()));
        // Puedes personalizar el formato de la respuesta
        // Aquí un ejemplo que devuelve la primera o todas, y un mensaje genérico si es necesario
        return res.status(400).json({
            message: "Error de validación. Por favor, revise los datos enviados.",
            errors: errors.array().map(err => ({
                field: err.param || err.path || 'general', // err.path a partir de express-validator v7
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};


// --- Conjuntos de Reglas de Validación por Ruta ---

// GET /role/:idRole y otras rutas que necesitan validar :idRole
const getRoleByIdValidation = [
    param('idRole')
        .custom(async (value, { req }) => { // 'value' es el idRole de req.params.idRole
            // Llama a la función de validación personalizada mejorada.
            // No es necesario `await` aquí si `custom` maneja la promesa correctamente.
            // express-validator esperará la promesa de validateRoleExistence.
            return validateRoleExistence(value, { req });
        }),
    handleValidationErrors // Aplicar el manejador de errores después de las validaciones
];

// POST /role (Crear)
const createRoleValidation = [
    body('roleName')
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('El nombre del rol debe tener entre 3 y 50 caracteres.')
        .matches(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\s]+$/).withMessage('El nombre del rol solo puede contener letras, números y espacios.')
        .custom(validateUniqueRoleNameOnCreate),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).'),
    body('rolePrivileges')
        .optional()
        .isArray().withMessage('rolePrivileges debe ser un array si se proporciona.')
        .custom((privileges) => {
            if (!privileges) return true;
            const isValid = privileges.every(p =>
                typeof p === 'object' && p !== null &&
                Number.isInteger(p.idPermission) && p.idPermission > 0 &&
                Number.isInteger(p.idPrivilege) && p.idPrivilege > 0
            );
            if (!isValid) {
                throw new Error('Cada elemento en rolePrivileges debe ser un objeto con idPermission e idPrivilege como enteros positivos.');
            }
            return true;
        }),
    handleValidationErrors
];

// PUT /role/:idRole (Actualizar Nombre/Estado)
const updateRoleValidation = [
    param('idRole').custom(async (value, { req }) => validateRoleExistence(value, { req })),
    body('roleName')
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('El nombre del rol debe tener entre 3 y 50 caracteres.')
        .matches(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\s]+$/).withMessage('El nombre del rol solo puede contener letras, números y espacios.')
        .custom(validateUniqueRoleNameOnUpdate),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).'),
    body('rolePrivileges')
        .not().exists().withMessage('La actualización de privilegios se realiza a través de la ruta PUT /role/:idRole/privileges.'),
    handleValidationErrors
];

// DELETE /role/:idRole
const deleteRoleValidation = [
    param('idRole').custom(async (value, { req }) => validateRoleExistence(value, { req }))
        .custom(validateRoleHasNoUsers) // Estas se encadenan sobre el mismo param('idRole')
        .custom(validateRoleNotAssignedToLoggedUser),
    handleValidationErrors
];

// PATCH /role/:idRole/state (Cambiar Estado)
const changeRoleStateValidation = [
    param('idRole').custom(async (value, { req }) => validateRoleExistence(value, { req })),
    body('status')
        .exists({ checkFalsy: false }).withMessage('El campo status es requerido.')
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).'),
    handleValidationErrors
];

// GET /role/:idRole/privileges
// Esta ruta ya usa getRoleByIdValidation si así lo defines en roleRoutes.js,
// así que no necesitas definir getRolePrivilegesValidation por separado a menos que tenga reglas distintas.
// Si la lógica de validación para el :idRole es la misma, reutiliza getRoleByIdValidation.
// const getRolePrivilegesValidation = getRoleByIdValidation; // Simplemente un alias si es igual

// PUT /role/:idRole/privileges (Asignar/Reemplazar Privilegios)
const assignPrivilegesValidation = [
    param('idRole').custom(async (value, { req }) => validateRoleExistence(value, { req })),
    // Asumiendo que el frontend envía el array directamente como req.body
    body()
        .isArray().withMessage('El cuerpo de la solicitud debe ser un array de asignaciones.')
        .custom((privilegesArrayInBody, { req }) => {
            if (privilegesArrayInBody.length === 0) {
                return true; // Array vacío es válido (quita todos los permisos)
            }
            const isValid = privilegesArrayInBody.every(p =>
                typeof p === 'object' && p !== null &&
                Number.isInteger(p.idPermission) && p.idPermission > 0 &&
                Number.isInteger(p.idPrivilege) && p.idPrivilege > 0
            );
            if (!isValid) {
                throw new Error('Cada elemento en el array de asignaciones debe ser un objeto con idPermission e idPrivilege como enteros positivos.');
            }
            return true;
        }),
    handleValidationErrors
];

module.exports = {
    getRoleByIdValidation,
    createRoleValidation,
    updateRoleValidation,
    deleteRoleValidation,
    changeRoleStateValidation,
    assignPrivilegesValidation,
    // No necesitas exportar getRolePrivilegesValidation si es igual a getRoleByIdValidation
};