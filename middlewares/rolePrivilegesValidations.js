// middlewares/rolePrivilegesValidations.js
const { body, param, validationResult } = require("express-validator");
const { RolePrivilege, Role, Privilege } = require("../models"); // Permission no es necesario aquí directamente para la tabla RolePrivilege
const { Op } = require('sequelize');

const LOG_VALIDATION_PREFIX_MW_RP = "[MW RolePrivilegesValidation]";

// --- Funciones de Validación Personalizadas (reusables) ---
const validateEntityExistence = (model, entityNameSingular, idFieldInModel) => async (idValue, { req }) => {
    const idStr = String(idValue).trim();
    const entityNameLower = entityNameSingular.toLowerCase();
    console.log(`${LOG_VALIDATION_PREFIX_MW_RP} validate${entityNameSingular}Existence - Validando ID '${idStr}' para ${entityNameLower}`);

    if (!idStr || idStr === 'undefined' || idStr === 'null') {
        return Promise.reject(`El ID de ${entityNameLower} es requerido.`);
    }
    const numericId = Number(idStr);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
        return Promise.reject(`El ID de ${entityNameLower} debe ser un número entero positivo.`);
    }
    const entity = await model.findByPk(numericId);
    if (!entity) {
        return Promise.reject(`El ${entityNameLower} con ID ${numericId} no existe.`);
    }
    // req[`found${entityNameSingular}`] = entity; // Opcional: adjuntar al request si es necesario en el controlador
    return Promise.resolve();
};

const validateRolePrivilegeEntryExistence = validateEntityExistence(RolePrivilege, 'RolePrivilegeEntry', 'idPrivilegedRole'); // 'RolePrivilegeEntry' para diferenciar
const validateRoleForRPAssignExistence = validateEntityExistence(Role, 'Role', 'idRole');
const validatePrivilegeForRPAssignExistence = validateEntityExistence(Privilege, 'Privilege', 'idPrivilege');


const validateUniqueRolePrivilegeCombination = async (value, { req }) => {
    // Esta validación se aplica al body(), por lo que 'value' es el body completo.
    // O, si se aplica a un campo específico, ese campo es 'value'.
    // Aquí asumimos que los campos ya están en req.body
    const { idRole, idPrivilege } = req.body;
    const idPrivilegedRoleParam = req.params.idRolePrivilege; // Para la actualización, para excluir el registro actual

    // Asegurarse que idRole e idPrivilege son números válidos si llegan aquí
    // (deberían haber sido validados por .isInt() antes)
    const numIdRole = Number(idRole);
    const numIdPrivilege = Number(idPrivilege);

    if (isNaN(numIdRole) || isNaN(numIdPrivilege)) {
        // Esto no debería suceder si las validaciones previas de isInt() funcionaron.
        // No se rechaza aquí para permitir que las validaciones de campo fallen primero.
        return true;
    }

    const queryOptions = {
        where: {
            idRole: numIdRole,
            idPrivilege: numIdPrivilege,
        }
    };

    if (idPrivilegedRoleParam) { // Si estamos actualizando un registro existente
        queryOptions.where.idPrivilegedRole = { [Op.ne]: Number(idPrivilegedRoleParam) };
    }
    console.log(`${LOG_VALIDATION_PREFIX_MW_RP} validateUniqueRolePrivilegeCombination - Buscando con:`, queryOptions.where);

    const existing = await RolePrivilege.findOne(queryOptions);
    if (existing) {
        console.warn(`${LOG_VALIDATION_PREFIX_MW_RP} validateUniqueRolePrivilegeCombination - Combinación duplicada encontrada:`, existing);
        return Promise.reject("Esta combinación de rol y privilegio ya existe.");
    }
    console.log(`${LOG_VALIDATION_PREFIX_MW_RP} validateUniqueRolePrivilegeCombination - Combinación es única.`);
    return true;
};


// --- Middleware para manejar errores de validación ---
const handleValidationErrorsRP = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn(`${LOG_VALIDATION_PREFIX_MW_RP} handleValidationErrorsRP - Errores para ${req.method} ${req.originalUrl}:`, JSON.stringify(errors.array()));
        return res.status(400).json({
            message: "Error de validación en la asignación rol-privilegio.",
            errors: errors.array().map(err => ({
                field: err.param || err.path || (err.nestedErrors ? err.nestedErrors[0].param : 'general'),
                message: err.msg,
                value: err.value !== undefined ? err.value : null
            }))
        });
    }
    next();
};

// --- Conjuntos de Validación ---

const getRolePrivilegeByIdValidation = [
    param("idRolePrivilege") // Nombre del parámetro en la ruta
        .isInt({ min: 1 }).withMessage("El ID de la asignación rol-privilegio debe ser un número entero positivo.")
        .custom(validateRolePrivilegeEntryExistence),
    handleValidationErrorsRP
];

const createRolePrivilegeValidation = [
    body("idRole")
        .isInt({ min: 1 }).withMessage("El ID del rol debe ser un número entero positivo.")
        .bail()
        .custom(validateRoleForRPAssignExistence),
    body("idPrivilege")
        .isInt({ min: 1 }).withMessage("El ID del privilegio debe ser un número entero positivo.")
        .bail()
        .custom(validatePrivilegeForRPAssignExistence),
    // Se aplica al body completo después de que los campos individuales han sido validados
    body().custom(validateUniqueRolePrivilegeCombination),
    handleValidationErrorsRP
];

const updateRolePrivilegeValidation = [
    param("idRolePrivilege") // El ID del registro a actualizar
        .isInt({ min: 1 }).withMessage("El ID de la asignación rol-privilegio a actualizar debe ser un número entero positivo.")
        .custom(validateRolePrivilegeEntryExistence),
    body("idRole") // El nuevo idRole para la asignación
        .isInt({ min: 1 }).withMessage("El ID del rol debe ser un número entero positivo.")
        .bail()
        .custom(validateRoleForRPAssignExistence),
    body("idPrivilege") // El nuevo idPrivilege para la asignación
        .isInt({ min: 1 }).withMessage("El ID del privilegio debe ser un número entero positivo.")
        .bail()
        .custom(validatePrivilegeForRPAssignExistence),
    body().custom(validateUniqueRolePrivilegeCombination), // Valida la nueva combinación (idRole, idPrivilege) excluyendo el actual
    handleValidationErrorsRP
];

// deleteRolePrivilegeValidation es igual que getRolePrivilegeByIdValidation
const deleteRolePrivilegeValidation = getRolePrivilegeByIdValidation;


module.exports = {
    getRolePrivilegeByIdValidation,
    createRolePrivilegeValidation,
    updateRolePrivilegeValidation,
    deleteRolePrivilegeValidation,
};