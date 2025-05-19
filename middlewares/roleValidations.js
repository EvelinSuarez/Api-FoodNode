// middlewares/roleValidations.js
const { body, param, validationResult } = require('express-validator');
const { Role, User, Permission, Privilege } = require('../models'); // Asegúrate que los modelos están correctamente exportados desde /models (probablemente /models/index.js)
const { Op } = require('sequelize');

const LOG_VALIDATION_PREFIX_MW = "[MW RoleValidation]";

// --- Funciones de Validación Personalizadas ---

const validateRoleExistence = async (idRoleValue, { req }) => {
    const idRoleStr = String(idRoleValue).trim();
    console.log(`${LOG_VALIDATION_PREFIX_MW} validateRoleExistence - Validando idRole: '${idRoleStr}' (tipo original: ${typeof idRoleValue}) para ${req.method} ${req.originalUrl}`);

    if (!idRoleStr || idRoleStr === 'undefined' || idRoleStr === 'null') {
        console.error(`${LOG_VALIDATION_PREFIX_MW} validateRoleExistence - idRole es indefinido, nulo o vacío.`);
        return Promise.reject('El ID del rol es requerido.');
    }

    const numericIdRole = Number(idRoleStr);
    if (isNaN(numericIdRole) || !Number.isInteger(numericIdRole) || numericIdRole <= 0) {
        console.error(`${LOG_VALIDATION_PREFIX_MW} validateRoleExistence - idRole '${idRoleStr}' no es un número entero positivo.`);
        return Promise.reject('El ID del rol debe ser un número entero positivo.');
    }

    try {
        const role = await Role.findByPk(numericIdRole);
        if (!role) {
            console.warn(`${LOG_VALIDATION_PREFIX_MW} validateRoleExistence - Rol con ID ${numericIdRole} NO encontrado.`);
            return Promise.reject('El rol especificado no existe.');
        }
        req.foundRole = role; // Adjuntar el rol encontrado
        console.log(`${LOG_VALIDATION_PREFIX_MW} validateRoleExistence - Rol con ID ${numericIdRole} ENCONTRADO.`);
        return Promise.resolve();
    } catch (dbError) {
        console.error(`${LOG_VALIDATION_PREFIX_MW} validateRoleExistence - Error de BD al buscar rol ID ${numericIdRole}:`, dbError);
        return Promise.reject('Error interno al verificar la existencia del rol.');
    }
};

const validateUniqueRoleNameOnCreate = async (roleName) => {
    console.log(`${LOG_VALIDATION_PREFIX_MW} validateUniqueRoleNameOnCreate - Validando unicidad para nombre: '${roleName}'`);
    const role = await Role.findOne({ where: { roleName } });
    if (role) {
        return Promise.reject('El nombre del rol ya existe.');
    }
    return Promise.resolve();
};

const validateUniqueRoleNameOnUpdate = async (roleName, { req }) => {
    const roleIdToExclude = req.params.idRole;
    console.log(`${LOG_VALIDATION_PREFIX_MW} validateUniqueRoleNameOnUpdate - Validando unicidad para nombre: '${roleName}', excluyendo ID: ${roleIdToExclude}`);
    const role = await Role.findOne({
        where: {
            roleName,
            idRole: { [Op.ne]: Number(roleIdToExclude) } // Asegurar que sea número
        }
    });
    if (role) {
        return Promise.reject('El nombre del rol ya está siendo utilizado por otro rol.');
    }
    return Promise.resolve();
};

const validateRoleHasNoUsers = async (idRole) => {
    console.log(`${LOG_VALIDATION_PREFIX_MW} validateRoleHasNoUsers - Verificando usuarios para rol ID: ${idRole}`);
    const count = await User.count({ where: { idRole: Number(idRole) } }); // Asegurar que sea número
    if (count > 0) {
        return Promise.reject('No se puede eliminar el rol porque tiene usuarios asociados.');
    }
    return Promise.resolve();
};

const validateRoleNotAssignedToLoggedUser = async (idRole, { req }) => {
    if (req.user && req.user.idRole && Number(req.user.idRole) === Number(idRole)) {
        console.log(`${LOG_VALIDATION_PREFIX_MW} validateRoleNotAssignedToLoggedUser - Intento de eliminar/modificar rol propio ID: ${idRole}`);
        return Promise.reject('No puedes modificar o eliminar tu propio rol asignado de esta manera.');
    }
    return Promise.resolve();
};

// Valida la existencia de Permisos y Privilegios, y su correcta asociación
const validatePermissionsAndPrivilegesExistAndMatch = async (assignmentsArray, { req }) => {
    console.log(`${LOG_VALIDATION_PREFIX_MW} validatePermissionsAndPrivilegesExistAndMatch - Validando asignaciones:`, JSON.stringify(assignmentsArray, null, 2));
    if (!assignmentsArray || assignmentsArray.length === 0) {
        return true; // Array vacío es válido
    }

    // Para almacenar los idPrivilege que se validaron y serán usados por el servicio
    const validatedPrivilegeIds = [];

    for (let i = 0; i < assignmentsArray.length; i++) {
        const assignment = assignmentsArray[i];
        const { idPrivilege, idPermission } = assignment; // idPermission puede ser opcional en el input

        if (idPrivilege === undefined || !Number.isInteger(idPrivilege) || idPrivilege <= 0) {
            return Promise.reject(`Cada asignación (índice ${i}) debe tener un 'idPrivilege' numérico positivo.`);
        }

        const privilege = await Privilege.findByPk(idPrivilege);
        if (!privilege) {
            return Promise.reject(`El privilegio con ID ${idPrivilege} (índice ${i}) no existe.`);
        }

        // Si se proporciona idPermission, verificar que el privilegio le pertenece
        if (idPermission !== undefined) {
            if (!Number.isInteger(idPermission) || idPermission <= 0) {
                return Promise.reject(`El 'idPermission' (índice ${i}) debe ser numérico positivo si se proporciona.`);
            }
            const permission = await Permission.findByPk(idPermission);
            if (!permission) {
                return Promise.reject(`El permiso con ID ${idPermission} (índice ${i}) no existe.`);
            }
            if (privilege.idPermission !== idPermission) {
                return Promise.reject(`El privilegio con ID ${idPrivilege} no pertenece al permiso con ID ${idPermission} (índice ${i}).`);
            }
        }
        validatedPrivilegeIds.push({ idPrivilege: privilege.idPrivilege }); // Guardamos solo el idPrivilege para la tabla de unión
    }

    // Opcional: Modificar el req.body para que el servicio solo reciba los { idPrivilege }
    // Esto depende de cómo tu servicio esté estructurado.
    // Si 'assignmentsArray' es directamente req.body (como en assignPrivilegesValidation):
    // req.body = validatedPrivilegeIds;
    // Si 'assignmentsArray' es una propiedad de req.body (como en createRoleValidation para 'privilegeAssignments'):
    // req.body.privilegeAssignments = validatedPrivilegeIds; // O el nombre correcto de la propiedad

    return true;
};


// --- Middleware para manejar errores de validación ---
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn(`${LOG_VALIDATION_PREFIX_MW} handleValidationErrors - Errores para ${req.method} ${req.originalUrl}:`, JSON.stringify(errors.array()));
        return res.status(400).json({
            message: "Error de validación. Por favor, revise los datos enviados.",
            errors: errors.array().map(err => ({
                field: err.param || err.path || (err.nestedErrors ? err.nestedErrors[0].param : 'general'), // Para errores en arrays
                message: err.msg,
                value: err.value !== undefined ? err.value : null
            }))
        });
    }
    next();
};


// --- Conjuntos de Reglas de Validación por Ruta ---

const getRoleByIdValidation = [
    param('idRole').custom(validateRoleExistence),
    handleValidationErrors
];

const createRoleValidation = [
    body('roleName')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('El nombre del rol debe tener entre 2 y 50 caracteres.')
        .matches(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\s'-]+$/).withMessage('El nombre del rol solo puede contener letras, números, espacios, apóstrofes y guiones.')
        .custom(validateUniqueRoleNameOnCreate),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).')
        .toBoolean(),
    body('privilegeAssignments') // El servicio esperará este campo para la creación anidada
        .optional()
        .isArray({ min: 0 }).withMessage('privilegeAssignments debe ser un array si se proporciona.')
        .custom((assignmentsArray) => { // Valida estructura básica
            if (!assignmentsArray || assignmentsArray.length === 0) return true;
            const isValid = assignmentsArray.every(p =>
                typeof p === 'object' && p !== null &&
                p.hasOwnProperty('idPrivilege') && Number.isInteger(p.idPrivilege) && p.idPrivilege > 0 &&
                (!p.hasOwnProperty('idPermission') || (p.idPermission === undefined || (Number.isInteger(p.idPermission) && p.idPermission > 0))) // idPermission es opcional o entero positivo
            );
            if (!isValid) {
                throw new Error('Cada elemento en privilegeAssignments debe ser un objeto con idPrivilege (entero positivo) y opcionalmente idPermission (entero positivo o undefined).');
            }
            return true;
        })
        .custom(validatePermissionsAndPrivilegesExistAndMatch), // Valida existencia y match
    handleValidationErrors
];

const updateRoleValidation = [
    param('idRole').custom(validateRoleExistence),
    body('roleName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('El nombre del rol debe tener entre 2 y 50 caracteres.')
        .matches(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\s'-]+$/).withMessage('El nombre del rol solo puede contener letras, números, espacios, apóstrofes y guiones.')
        .custom(validateUniqueRoleNameOnUpdate),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).')
        .toBoolean(),
    body('privilegeAssignments') // No permitir actualizar privilegios por esta ruta
        .not().exists().withMessage('La actualización de privilegios se realiza a través de la ruta PUT /api/roles/:idRole/privileges.'),
    body().custom((value, { req }) => {
        if (req.body.roleName === undefined && req.body.status === undefined) {
            throw new Error('Debe proporcionar al menos un campo para actualizar (roleName o status).');
        }
        return true;
    }),
    handleValidationErrors
];

const deleteRoleValidation = [
    param('idRole').custom(validateRoleExistence)
        .bail() // Detener si no existe
        .custom(validateRoleHasNoUsers)
        .bail() // Detener si tiene usuarios
        .custom(validateRoleNotAssignedToLoggedUser), // req.user debe estar disponible
    handleValidationErrors
];

const changeRoleStateValidation = [
    param('idRole').custom(validateRoleExistence),
    body('status')
        .exists({ checkFalsy: false }).withMessage('El campo status es requerido (puede ser true o false).')
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false).')
        .toBoolean(),
    handleValidationErrors
];

// Para PUT /api/roles/:idRole/privileges
// El cuerpo de la solicitud DEBE SER un array de objetos: [{ idPrivilege: number, idPermission?: number }, ...]
const assignPrivilegesValidation = [
    param('idRole').custom(validateRoleExistence),
    body() // Validar el cuerpo entero de la solicitud como un array
        .isArray({ min: 0 }).withMessage('El cuerpo de la solicitud debe ser un array de asignaciones (puede ser vacío para quitar todos los privilegios).')
        .custom((assignmentsArrayInBody) => { // Valida estructura básica
            if (assignmentsArrayInBody.length === 0) return true;
            const isValid = assignmentsArrayInBody.every(p =>
                typeof p === 'object' && p !== null &&
                p.hasOwnProperty('idPrivilege') && Number.isInteger(p.idPrivilege) && p.idPrivilege > 0 &&
                (!p.hasOwnProperty('idPermission') || (p.idPermission === undefined || (Number.isInteger(p.idPermission) && p.idPermission > 0)))
            );
            if (!isValid) {
                throw new Error('Cada elemento en el array de asignaciones debe ser un objeto con idPrivilege (entero positivo) y opcionalmente idPermission (entero positivo o undefined).');
            }
            return true;
        })
        .custom(validatePermissionsAndPrivilegesExistAndMatch), // Valida existencia y match
    handleValidationErrors
];

// Para GET /api/roles/:idRole/privileges y GET /api/roles/:idRole/effective-permissions
// Solo se necesita validar que el rol exista.
const getRoleSubresourcesValidation = [
    param('idRole').custom(validateRoleExistence),
    handleValidationErrors
];


module.exports = {
    getRoleByIdValidation,
    createRoleValidation,
    updateRoleValidation,
    deleteRoleValidation,
    changeRoleStateValidation,
    assignPrivilegesValidation,
    getRoleSubresourcesValidation, // Usar para getRolePrivileges y getEffectivePermissionsForRole
};