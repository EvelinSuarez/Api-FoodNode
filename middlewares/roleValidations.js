// middlewares/roleValidations.js
const { body, param, validationResult } = require('express-validator');
const db = require('../models'); // Importa el objeto 'db' que contiene todos los modelos
const Role = db.role;             // Accede al modelo Role a través de db.role
const User = db.user;             // Accede al modelo User a través de db.user
const Permission = db.permission;   // Accede al modelo Permission a través de db.permission
const Privilege = db.privilege;   // Accede al modelo Privilege a través de db.privilege

// Verifica que los modelos se cargaron correctamente
if (!Role || !User || !Permission || !Privilege) {
    console.error("ERROR CRÍTICO en roleValidations.js: Uno o más modelos (Role, User, Permission, Privilege) son undefined después de intentar accederlos desde 'db'.");
} else {
    console.log("Modelos (Role, User, Permission, Privilege) cargados correctamente en roleValidations.js.");
}

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
        if (!Role) {
             console.error(`${LOG_VALIDATION_PREFIX_MW} validateRoleExistence - ¡¡¡El modelo Role es UNDEFINED aquí!!!`);
             return Promise.reject('Error interno crítico: Modelo Role no disponible en validación.');
        }
        const role = await Role.findByPk(numericIdRole);
        if (!role) {
            console.warn(`${LOG_VALIDATION_PREFIX_MW} validateRoleExistence - Rol con ID ${numericIdRole} NO encontrado.`);
            return Promise.reject('El rol especificado no existe.');
        }
        req.foundRole = role;
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
            idRole: { [Op.ne]: Number(roleIdToExclude) }
        }
    });
    if (role) {
        return Promise.reject('El nombre del rol ya está siendo utilizado por otro rol.');
    }
    return Promise.resolve();
};

const validateRoleHasNoUsers = async (idRoleValue, { req }) => {
    const idRole = Number(String(idRoleValue).trim());
    console.log(`${LOG_VALIDATION_PREFIX_MW} validateRoleHasNoUsers - Verificando usuarios para rol ID: ${idRole}`);

    if (isNaN(idRole)) {
        return Promise.reject('ID de rol inválido para verificar usuarios.');
    }

    try {
        if (!User) { // Verifica que User no sea undefined
            console.error(`${LOG_VALIDATION_PREFIX_MW} validateRoleHasNoUsers - Modelo User es UNDEFINED.`);
            return Promise.reject('Error interno: Modelo User no disponible para validación.');
        }
        const count = await User.count({ where: { idRole: idRole } });
        if (count > 0) {
            console.warn(`${LOG_VALIDATION_PREFIX_MW} validateRoleHasNoUsers - Rol ID ${idRole} tiene ${count} usuarios asociados.`);
            // Mensaje que verá el frontend
            return Promise.reject(`No se puede eliminar el rol porque tiene ${count} usuario(s) asociado(s). Primero debe eliminar o cambiarles el rol a los usuarios.`);
        }
    } catch (dbError) {
        console.error(`${LOG_VALIDATION_PREFIX_MW} validateRoleHasNoUsers - Error de BD al contar usuarios para rol ID ${idRole}:`, dbError);
        return Promise.reject('Error interno al verificar usuarios asociados al rol.');
    }
};


const validateRoleNotAssignedToLoggedUser = async (idRole, { req }) => {
    if (req.user && req.user.idRole && Number(req.user.idRole) === Number(idRole)) {
        console.log(`${LOG_VALIDATION_PREFIX_MW} validateRoleNotAssignedToLoggedUser - Intento de eliminar/modificar rol propio ID: ${idRole}`);
        return Promise.reject('No puedes modificar o eliminar tu propio rol asignado de esta manera.');
    }
    return Promise.resolve();
};

const validatePermissionsAndPrivilegesExistAndMatch = async (assignmentsArray, { req }) => {
    console.log(`${LOG_VALIDATION_PREFIX_MW} validatePermissionsAndPrivilegesExistAndMatch - Validando asignaciones:`, JSON.stringify(assignmentsArray, null, 2));
    if (!assignmentsArray || assignmentsArray.length === 0) {
        return true;
    }
    for (let i = 0; i < assignmentsArray.length; i++) {
        const assignment = assignmentsArray[i];
        const { idPrivilege, idPermission } = assignment;

        if (idPrivilege === undefined || !Number.isInteger(idPrivilege) || idPrivilege <= 0) {
            return Promise.reject(`Cada asignación (índice ${i}) debe tener un 'idPrivilege' numérico positivo.`);
        }
        if (!Privilege) return Promise.reject('Error interno: Modelo Privilege no disponible.');
        const privilege = await Privilege.findByPk(idPrivilege);
        if (!privilege) {
            return Promise.reject(`El privilegio con ID ${idPrivilege} (índice ${i}) no existe.`);
        }

        if (idPermission !== undefined) {
            if (!Number.isInteger(idPermission) || idPermission <= 0) {
                return Promise.reject(`El 'idPermission' (índice ${i}) debe ser numérico positivo si se proporciona.`);
            }
            if (!Permission) return Promise.reject('Error interno: Modelo Permission no disponible.');
            const permission = await Permission.findByPk(idPermission);
            if (!permission) {
                return Promise.reject(`El permiso con ID ${idPermission} (índice ${i}) no existe.`);
            }
            if (privilege.idPermission !== idPermission) {
                return Promise.reject(`El privilegio con ID ${idPrivilege} no pertenece al permiso con ID ${idPermission} (índice ${i}).`);
            }
        }
    }
    return true;
};

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn(`${LOG_VALIDATION_PREFIX_MW} handleValidationErrors - Errores para ${req.method} ${req.originalUrl}:`, JSON.stringify(errors.array()));
        return res.status(400).json({
            message: "Error de validación. Por favor, revise los datos enviados.",
            errors: errors.array().map(err => ({
                field: err.param || err.path || (err.nestedErrors ? err.nestedErrors[0].param : 'general'),
                message: err.msg,
                value: err.value !== undefined ? err.value : null
            }))
        });
    }
    next();
};

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
    body('privilegeAssignments')
        .optional()
        .isArray({ min: 0 }).withMessage('privilegeAssignments debe ser un array si se proporciona.')
        .custom((assignmentsArray) => {
            if (!assignmentsArray || assignmentsArray.length === 0) return true;
            const isValid = assignmentsArray.every(p =>
                typeof p === 'object' && p !== null &&
                p.hasOwnProperty('idPrivilege') && Number.isInteger(p.idPrivilege) && p.idPrivilege > 0 &&
                (!p.hasOwnProperty('idPermission') || (p.idPermission === undefined || (Number.isInteger(p.idPermission) && p.idPermission > 0)))
            );
            if (!isValid) {
                throw new Error('Cada elemento en privilegeAssignments debe ser un objeto con idPrivilege (entero positivo) y opcionalmente idPermission (entero positivo o undefined).');
            }
            return true;
        })
        .custom(validatePermissionsAndPrivilegesExistAndMatch),
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
    body('privilegeAssignments')
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
        .bail()
        .custom(validateRoleHasNoUsers) // ESTA ES LA VALIDACIÓN CLAVE
        .bail()
        .custom(validateRoleNotAssignedToLoggedUser),
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

const assignPrivilegesValidation = [
    param('idRole').custom(validateRoleExistence),
    body()
        .isArray({ min: 0 }).withMessage('El cuerpo de la solicitud debe ser un array de asignaciones (puede ser vacío para quitar todos los privilegios).')
        .custom((assignmentsArrayInBody) => {
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
        .custom(validatePermissionsAndPrivilegesExistAndMatch),
    handleValidationErrors
];

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
    getRoleSubresourcesValidation,
};