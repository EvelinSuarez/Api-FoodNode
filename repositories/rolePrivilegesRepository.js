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
                    as: 'privilege', // Alias de la asociación RolePrivilege.belongsTo(Privilege)
                    attributes: ['privilegeKey', 'status'], // Incluir status para filtrar
                    required: true, // INNER JOIN
                    where: { status: true }, // Filtrar privilegios activos
                    include: [
                        {
                            model: Permission,
                            as: 'permission', // Alias de la asociación Privilege.belongsTo(Permission)
                            attributes: ['permissionKey', 'status'], // Incluir status
                            required: true, // INNER JOIN
                            where: { status: true } // Filtrar permisos activos
                        }
                    ]
                }
            ],
            // raw: true y nest: true pueden complicar el acceso a datos anidados profundamente
            // Es mejor trabajar con instancias de Sequelize y usar .get({ plain: true }) si es necesario
        });

        const combinedPermissions = results.map(entry => {
            const priv = entry.privilege; // Objeto Privilege
            if (!priv || !priv.permission) { // Verificar que la anidación existe
                console.warn(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Entrada incompleta:`, entry.toJSON());
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
                    as: 'privilege',
                    attributes: ['privilegeKey', 'status'],
                    required: true,
                    where: { status: true },
                    include: [
                        {
                            model: Permission,
                            as: 'permission',
                            attributes: ['permissionKey', 'status'],
                            required: true,
                            where: { status: true }
                        }
                    ]
                }
            ]
        });

        const permissionKeyPrivilegeKeyPairs = results.map(entry => {
            const priv = entry.privilege;
            if (!priv || !priv.permission) {
                console.warn(`${LOG_REPO_RP} (getPermissionKeyPrivilegeKeyPairsByRoleId) Entrada incompleta:`, entry.toJSON());
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
        // RolePrivilege tiene idPrivilege. Necesitamos idPermission del Privilege asociado.
        const assignments = await RolePrivilege.findAll({
            where: { idRole: roleIdInt },
            attributes: ['idPrivilege'], // Solo necesitamos idPrivilege de RolePrivilege
            include: [{
                model: Privilege,
                as: 'privilege', // Asegúrate que este alias es correcto
                attributes: ['idPermission'], // Traemos idPermission del Privilegio
                required: true // Para asegurar que solo traemos asignaciones con privilegios válidos
            }]
        });
        return assignments.map(a => ({
            idPrivilege: a.idPrivilege,
            idPermission: a.privilege.idPermission // Acceder a idPermission a través del privilegio incluido
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
        return [];
    }
    // RolePrivileges solo tiene idRole, idPrivilege
    const isValidStructure = assignments.every(a =>
        typeof a === 'object' && a !== null &&
        Number.isInteger(a.idRole) && a.idRole > 0 &&
        Number.isInteger(a.idPrivilege) && a.idPrivilege > 0
        // No idPermission aquí
    );
    if (!isValidStructure) {
        const invalidAssignment = assignments.find(a =>
            !(typeof a === 'object' && a !== null &&
            Number.isInteger(a.idRole) && a.idRole > 0 &&
            Number.isInteger(a.idPrivilege) && a.idPrivilege > 0)
        );
        console.error(`${LOG_REPO_RP} Estructura inválida en 'assignments'. Ejemplo:`, invalidAssignment);
        throw new Error(`Estructura inválida en 'assignments'. Se esperan objetos con idRole e idPrivilege como enteros positivos. Inválido: ${JSON.stringify(invalidAssignment)}`);
    }

    try {
        const queryOptions = { ...options };
        return RolePrivilege.bulkCreate(assignments, queryOptions);
    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en bulkCreate:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error(`Error de restricción única al crear asignaciones: ${error.errors?.[0]?.message || error.message}`);
        }
        throw error;
    }
};

module.exports = {
    findByRoleId: getCombinedPermissionsByRoleId, // Para authorize middleware
    getEffectiveKeysByRoleId: getPermissionKeyPrivilegeKeyPairsByRoleId, // Para authService (frontend)
    getRawAssignmentsByRoleId, // Para FormPermissions.jsx
    deleteByRoleId,
    bulkCreate,
    // Para acceso directo si es necesario
    getCombinedPermissionsByRoleId,
    getPermissionKeyPrivilegeKeyPairsByRoleId
};