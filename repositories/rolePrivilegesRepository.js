// repositories/rolePrivilegesRepository.js
const { RolePrivilege, Permission, Privilege, Role } = require('../models'); // Asumiendo que RolePrivilege es el nombre del modelo
const { Op } = require('sequelize');

const LOG_REPO_RP = "[Repo RolePrivileges]";

/**
 * Obtiene los permisos combinados (ej. 'modulo-accion') para un rol específico.
 * @param {number | string} idRole - El ID del rol.
 * @returns {Promise<Array<string>>} Ej: ['USERS_MANAGE-USER_CREATE', ...]
 */
const getCombinedPermissionsByRoleId = async (idRole) => {
    console.log(`${LOG_REPO_RP} getCombinedPermissionsByRoleId - Rol ID: ${idRole}`);
    try {
        const roleIdInt = parseInt(idRole, 10);
        if (isNaN(roleIdInt)) {
            throw new Error("ID de rol inválido.");
        }

        const results = await RolePrivilege.findAll({
            where: { idRole: roleIdInt },
            include: [
                {
                    model: Privilege,
                    as: 'privilegeDetailsInRoleLink', // Correcto: Coincide con la definición de la asociación
                    attributes: ['privilegeKey', 'status'],
                    required: true,
                    where: { status: true },
                    include: [
                        {
                            model: Permission,
                            as: 'permission', // Asume que Privilege.belongsTo(Permission) usa as: 'permission'
                            attributes: ['permissionKey', 'status'],
                            required: true,
                            where: { status: true }
                        }
                    ]
                }
            ],
        });

        const combinedPermissions = results.map(entry => {
            const priv = entry.privilegeDetailsInRoleLink; // Correcto: Accede usando el alias del include
            if (!priv || !priv.permission) {
                console.warn(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Entrada incompleta o sin permiso anidado:`, entry.toJSON ? entry.toJSON() : entry);
                return null;
            }
            const pKey = priv.permission.permissionKey;
            const privKey = priv.privilegeKey;

            if (!pKey || !privKey) {
                console.warn(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Claves faltantes: pKey=${pKey}, privKey=${privKey}`);
                return null;
            }
            return `${pKey}-${privKey}`;
        }).filter(Boolean);

        console.log(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Permisos combinados para Rol ID ${roleIdInt}:`, combinedPermissions);
        return combinedPermissions;

    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en getCombinedPermissionsByRoleId para rol ${idRole}:`, error);
        throw error;
    }
};

/**
 * Obtiene los pares de permissionKey y privilegeKey para un rol específico.
 * @param {number | string} idRole - El ID del rol.
 * @returns {Promise<Array<{permissionKey: string, privilegeKey: string}>>}
 */
const getPermissionKeyPrivilegeKeyPairsByRoleId = async (idRole) => {
    console.log(`${LOG_REPO_RP} getPermissionKeyPrivilegeKeyPairsByRoleId - Rol ID: ${idRole}`);
    try {
        const roleIdInt = parseInt(idRole, 10);
        if (isNaN(roleIdInt)) {
            throw new Error("ID de rol inválido.");
        }

        const results = await RolePrivilege.findAll({
            where: { idRole: roleIdInt },
            include: [
                {
                    model: Privilege,
                    as: 'privilegeDetailsInRoleLink', // Correcto: Coincide con la definición de la asociación
                    attributes: ['privilegeKey', 'status'],
                    required: true,
                    where: { status: true },
                    include: [
                        {
                            model: Permission,
                            as: 'permission', // Asume que Privilege.belongsTo(Permission) usa as: 'permission'
                            attributes: ['permissionKey', 'status'],
                            required: true,
                            where: { status: true }
                        }
                    ]
                }
            ]
        });

        const permissionKeyPrivilegeKeyPairs = results.map(entry => {
            const priv = entry.privilegeDetailsInRoleLink; // Correcto: Accede usando el alias del include
            if (!priv || !priv.permission) {
                console.warn(`${LOG_REPO_RP} (getPermissionKeyPrivilegeKeyPairsByRoleId) Entrada incompleta o sin permiso anidado:`, entry.toJSON ? entry.toJSON() : entry);
                return null;
            }
            const pKey = priv.permission.permissionKey;
            const privKey = priv.privilegeKey;

            if (!pKey || !privKey) {
                console.warn(`${LOG_REPO_RP} (getPermissionKeyPrivilegeKeyPairsByRoleId) Claves faltantes: pKey=${pKey}, privKey=${privKey}`);
                return null;
            }
            return { permissionKey: pKey, privilegeKey: privKey };
        }).filter(Boolean);

        console.log(`${LOG_REPO_RP} (getPermissionKeyPrivilegeKeyPairsByRoleId) Pares para Rol ID ${roleIdInt}:`, permissionKeyPrivilegeKeyPairs);
        return permissionKeyPrivilegeKeyPairs;

    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en getPermissionKeyPrivilegeKeyPairsByRoleId para rol ${idRole}:`, error);
        throw error;
    }
};


/**
 * Obtiene las asignaciones de un rol específico (idPermission, idPrivilege).
 * Utilizado para cargar el estado inicial en FormPermissions.jsx.
 * @param {number | string} idRole - El ID del rol.
 * @returns {Promise<Array<{idPrivilege: number, idPermission: number}>>}
 */
const getRawAssignmentsByRoleId = async (idRole) => {
    console.log(`${LOG_REPO_RP} getRawAssignmentsByRoleId - Rol ID: ${idRole}`);
    try {
        const roleIdInt = parseInt(idRole, 10);
        if (isNaN(roleIdInt)) {
            throw new Error("ID de rol inválido.");
        }
        const assignments = await RolePrivilege.findAll({
            where: { idRole: roleIdInt },
            attributes: ['idPrivilege'],
            include: [{
                model: Privilege,
                as: 'privilegeDetailsInRoleLink', // Correcto: Coincide con la definición de la asociación
                attributes: ['idPermission'],
                required: true
            }]
        });
        return assignments.map(a => ({
            idPrivilege: a.idPrivilege,
            idPermission: a.privilegeDetailsInRoleLink.idPermission // Correcto: Accede usando el alias del include
        }));
    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en getRawAssignmentsByRoleId para rol ${idRole}:`, error);
        throw error;
    }
};


/**
 * Elimina todas las asignaciones de privilegios para un rol específico.
 * @param {number | string} idRole - El ID del rol.
 * @param {object} [options={}] - Opciones de Sequelize, ej { transaction }.
 * @returns {Promise<number>} - El número de filas eliminadas.
 */
const deleteByRoleId = async (idRole, options = {}) => {
    console.log(`${LOG_REPO_RP} deleteByRoleId - Rol ID: ${idRole}`);
    try {
        const roleIdInt = parseInt(idRole, 10);
        if (isNaN(roleIdInt)) {
            throw new Error("ID de rol inválido.");
        }
        const queryOptions = { where: { idRole: roleIdInt }, ...options };
        return RolePrivilege.destroy(queryOptions);
    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en deleteByRoleId para rol ${idRole}:`, error);
        throw error;
    }
};

/**
 * Crea asignaciones de privilegios en lote para un rol.
 * @param {Array<object>} assignments - Un array de objetos, cada uno con { idRole, idPrivilege }.
 * @param {object} [options={}] - Opciones de Sequelize, ej { transaction }.
 * @returns {Promise<Array<RolePrivilege>>}
 */
const bulkCreate = async (assignments, options = {}) => {
    console.log(`${LOG_REPO_RP} bulkCreate - Asignaciones:`, assignments);
    if (!Array.isArray(assignments)) {
        throw new Error("Se esperaba un array para 'assignments' en bulkCreate.");
    }
    if (assignments.length === 0) {
        console.log(`${LOG_REPO_RP} bulkCreate - Array de asignaciones vacío, no se creará nada.`);
        return []; // No hay nada que crear
    }
    
    // Validación de la estructura de cada asignación
    const isValidStructure = assignments.every(a =>
        typeof a === 'object' && a !== null &&
        Number.isInteger(a.idRole) && a.idRole > 0 &&
        Number.isInteger(a.idPrivilege) && a.idPrivilege > 0
    );

    if (!isValidStructure) {
        const invalidAssignment = assignments.find(a =>
            !(typeof a === 'object' && a !== null &&
            Number.isInteger(a.idRole) && a.idRole > 0 &&
            Number.isInteger(a.idPrivilege) && a.idPrivilege > 0)
        );
        console.error(`${LOG_REPO_RP} Estructura inválida en 'assignments'. Ejemplo de asignación inválida:`, invalidAssignment);
        throw new Error(`Estructura inválida en 'assignments'. Se esperan objetos con idRole e idPrivilege como enteros positivos. Inválido: ${JSON.stringify(invalidAssignment)}`);
    }

    try {
        const queryOptions = { ...options };
        // Asegurarse que los campos en 'assignments' coincidan con las columnas de RolePrivilege
        // RolePrivilege tiene 'idRole' y 'idPrivilege' (y quizás 'idPrivilegedRole' como PK)
        // Los objetos en 'assignments' ya tienen 'idRole' e 'idPrivilege'.
        return RolePrivilege.bulkCreate(assignments, queryOptions);
    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en bulkCreate:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            // Puede que necesites un manejo más específico si hay una PK compuesta o única en (idRole, idPrivilege)
            throw new Error(`Error de restricción única al crear asignaciones en lote: ${error.errors?.[0]?.message || error.message}`);
        }
        // Si hay un error de FK (ej. idRole o idPrivilege no existen en sus tablas respectivas)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error(`Error de clave foránea al crear asignaciones: Un rol o privilegio especificado no existe. Detalles: ${error.message}`);
        }
        throw error; // Re-lanzar otros errores
    }
};

module.exports = {
    findByRoleId: getCombinedPermissionsByRoleId, // Usado por authorize middleware
    getEffectiveKeysByRoleId: getPermissionKeyPrivilegeKeyPairsByRoleId, // Usado por authService para el formato del frontend
    getRawAssignmentsByRoleId, // Usado por FormPermissions.jsx para obtener los {idPrivilege, idPermission}
    deleteByRoleId,
    bulkCreate,
    // Exportar funciones individuales también si se acceden directamente desde otros lugares
    getCombinedPermissionsByRoleId,
    getPermissionKeyPrivilegeKeyPairsByRoleId
};