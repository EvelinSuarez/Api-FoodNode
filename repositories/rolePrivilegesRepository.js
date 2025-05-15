// repositories/rolePrivilegesRepository.js

// Asegúrate de importar TODOS los modelos necesarios
const { RolePrivilege, Privilege, Permission } = require("../models"); // Asegúrate de que los nombres coincidan con los definidos en tu modelo

/**
 * Obtiene los permisos combinados (ej. 'modulo-accion') para un rol específico.
 * Esta función es la que debe ser utilizada por el middleware 'authorize'.
 * @param {number | string} idRole - El ID del rol.
 * @returns {Promise<Array<string>>}
 *          Un array de strings, cada uno representando un permiso combinado efectivo.
 *          Ej: ['roles-view', 'usuarios-create', ...]
 */
const getCombinedPermissionsByRoleId = async (idRole) => {
    console.log(`[Repo] Buscando permisos combinados (ej. 'modulo-accion') para Rol ID: ${idRole}`);
    try {
        const roleIdInt = parseInt(idRole, 10);
        if (isNaN(roleIdInt)) {
            console.error(`[Repo] ID de rol inválido para getCombinedPermissionsByRoleId: ${idRole}`);
            throw new Error("ID de rol inválido.");
        }

        const results = await RolePrivileges.findAll({
            where: { idRole: roleIdInt, '$permission.status$': true, '$privilege.status$': true },
            include: [
                {
                    model: Permission,
                    as: 'permission', // Asegúrate que 'permission' es el alias correcto en tu modelo RolePrivileges
                    attributes: ['permissionKey'],
                    required: true // INNER JOIN
                },
                {
                    model: Privilege,
                    as: 'privilege', // Asegúrate que 'privilege' es el alias correcto
                    attributes: ['privilegeKey'],
                    required: true // INNER JOIN
                }
            ],
            raw: true, // Para obtener objetos planos
            nest: true  // Para anidar los resultados de los includes bajo sus alias
        });

        const combinedPermissions = results.map(entry => {
            // Con raw: true y nest: true, accedes así: entry.aliasDeAsociacion.nombreDeColumna
            const pKey = entry.permission?.permissionKey;
            const privKey = entry.privilege?.privilegeKey;

            if (!pKey || !privKey) {
                console.warn(`[Repo] (getCombinedPermissionsByRoleId) Entrada incompleta encontrada: ${JSON.stringify(entry)}`);
                return null;
            }
            return `${pKey}-${privKey}`;
        }).filter(Boolean); // Filtra cualquier entrada nula si pKey o privKey faltaban

        console.log(`[Repo] Permisos combinados ('modulo-accion') mapeados para Rol ID ${roleIdInt}:`, JSON.stringify(combinedPermissions, null, 2));
        return combinedPermissions;

    } catch (error) {
        console.error(`[Repo] Error en getCombinedPermissionsByRoleId para rol ${idRole}:`, error);
        throw error;
    }
};

/**
 * Obtiene los pares de permissionKey y privilegeKey para un rol específico.
 * Esta función es la que debe ser utilizada por authService para construir el objeto de permisos del frontend.
 * @param {number | string} idRole - El ID del rol.
 * @returns {Promise<Array<{permissionKey: string, privilegeKey: string}>>}
 *          Un array de objetos, cada uno con permissionKey y privilegeKey.
 *          Ej: [{permissionKey: 'roles', privilegeKey: 'view'}, {permissionKey: 'usuarios', privilegeKey: 'create'}, ...]
 */
const getPermissionKeyPrivilegeKeyPairsByRoleId = async (idRole) => {
    console.log(`[Repo] Buscando pares (permissionKey, privilegeKey) para Rol ID: ${idRole}`);
    try {
        const roleIdInt = parseInt(idRole, 10);
        if (isNaN(roleIdInt)) {
            console.error(`[Repo] ID de rol inválido para getPermissionKeyPrivilegeKeyPairsByRoleId: ${idRole}`);
            throw new Error("ID de rol inválido.");
        }

        const results = await RolePrivileges.findAll({
            where: { idRole: roleIdInt, '$permission.status$': true, '$privilege.status$': true },
            include: [
                {
                    model: Permission,
                    as: 'permission', // Asegúrate que 'permission' es el alias correcto en tu modelo RolePrivileges
                    attributes: ['permissionKey'],
                    required: true // INNER JOIN
                },
                {
                    model: Privilege,
                    as: 'privilege', // Asegúrate que 'privilege' es el alias correcto
                    attributes: ['privilegeKey'],
                    required: true // INNER JOIN
                }
            ],
            raw: true, // Para obtener objetos planos
            nest: true  // Para anidar los resultados de los includes bajo sus alias
        });

        const permissionKeyPrivilegeKeyPairs = results.map(entry => {
            // Con raw: true y nest: true, accedes así: entry.aliasDeAsociacion.nombreDeColumna
            const pKey = entry.permission?.permissionKey;
            const privKey = entry.privilege?.privilegeKey;

            if (!pKey || !privKey) {
                console.warn(`[Repo] (getPermissionKeyPrivilegeKeyPairsByRoleId) Entrada incompleta encontrada: ${JSON.stringify(entry)}`);
                return null;
            }
            // Construir el objeto esperado por authService
            return { permissionKey: pKey, privilegeKey: privKey };
        }).filter(Boolean); // Filtra cualquier entrada nula si pKey o privKey faltaban

        console.log(`[Repo] Pares (permissionKey, privilegeKey) mapeados para Rol ID ${roleIdInt}:`, JSON.stringify(permissionKeyPrivilegeKeyPairs, null, 2));
        return permissionKeyPrivilegeKeyPairs;

    } catch (error) {
        console.error(`[Repo] Error en getPermissionKeyPrivilegeKeyPairsByRoleId para rol ${idRole}:`, error);
        throw error;
    }
};


/**
 * Obtiene las asignaciones de un rol específico (idPermission, idPrivilege).
 * Utilizado para cargar el estado inicial en FormPermissions.jsx.
 * @param {number | string} idRole - El ID del rol.
 * @returns {Promise<Array<{idPermission: number, idPrivilege: number}>>}
 */
const getRawAssignmentsByRoleId = async (idRole) => {
    console.log(`[Repo] Buscando asignaciones crudas (idPermission, idPrivilege) para Rol ID: ${idRole}`);
    try {
        const roleIdInt = parseInt(idRole, 10);
        if (isNaN(roleIdInt)) {
            console.error(`[Repo] ID de rol inválido para getRawAssignmentsByRoleId: ${idRole}`);
            throw new Error("ID de rol inválido.");
        }
        const assignments = await RolePrivileges.findAll({
            where: { idRole: roleIdInt },
            attributes: ['idPermission', 'idPrivilege']
            // No es necesario raw:true aquí si solo queremos los atributos directamente del modelo RolePrivileges
        });
        return assignments.map(a => ({ idPermission: a.idPermission, idPrivilege: a.idPrivilege }));
    } catch (error) {
        console.error(`Repository Error in getRawAssignmentsByRoleId for role ${idRole}:`, error);
        throw error;
    }
};


/**
 * Elimina todas las asignaciones de privilegios para un rol específico.
 * @param {number | string} idRole - El ID del rol.
 * @param {object} [transaction=null] - Una transacción de Sequelize opcional.
 * @returns {Promise<number>} - El número de filas eliminadas.
 */
const deleteByRoleId = async (idRole, transaction = null) => {
    try {
        const roleIdInt = parseInt(idRole, 10);
        if (isNaN(roleIdInt)) {
            throw new Error("ID de rol inválido proporcionado a deleteByRoleId.");
        }
        const options = { where: { idRole: roleIdInt } };
        if (transaction) {
            options.transaction = transaction;
        }
        const deletedCount = await RolePrivileges.destroy(options);
        return deletedCount;
    } catch (error) {
        console.error(`Repository Error in deleteByRoleId for role ${idRole}:`, error);
        throw error;
    }
};

/**
 * Crea asignaciones de privilegios en lote para un rol.
 * @param {Array<object>} assignments - Un array de objetos, cada uno con { idRole, idPermission, idPrivilege }.
 * @param {object} [transaction=null] - Una transacción de Sequelize opcional.
 * @returns {Promise<Array<RolePrivileges>>} - Un array de las instancias de RolePrivileges creadas.
 */
const bulkCreate = async (assignments, transaction = null) => {
    if (!Array.isArray(assignments)) {
        throw new Error("Se esperaba un array para 'assignments' en bulkCreate.");
    }
    if (assignments.length === 0) {
        return [];
    }
    const isValidStructure = assignments.every(a =>
        typeof a === 'object' && a !== null &&
        Number.isInteger(a.idRole) && a.idRole > 0 &&
        Number.isInteger(a.idPermission) && a.idPermission > 0 &&
        Number.isInteger(a.idPrivilege) && a.idPrivilege > 0
    );
    if (!isValidStructure) {
        const invalidAssignment = assignments.find(a =>
            !(typeof a === 'object' && a !== null &&
            Number.isInteger(a.idRole) && a.idRole > 0 &&
            Number.isInteger(a.idPermission) && a.idPermission > 0 &&
            Number.isInteger(a.idPrivilege) && a.idPrivilege > 0)
        );
        console.error("[Repo] Estructura inválida en 'assignments'. Ejemplo de entrada inválida:", invalidAssignment);
        throw new Error(`Estructura inválida en 'assignments'. Se esperan objetos con idRole, idPermission, e idPrivilege como enteros positivos. Entrada inválida: ${JSON.stringify(invalidAssignment)}`);
    }

    try {
        const options = {};
        if (transaction) {
            options.transaction = transaction;
        }
        const createdAssignments = await RolePrivileges.bulkCreate(assignments, options);
        return createdAssignments;
    } catch (error) {
        console.error("Repository Error in bulkCreate:", error.name, error.message);
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error(`Error de restricción única al crear asignaciones: ${error.errors?.[0]?.message || error.message}`);
        }
        throw error;
    }
};

// Exporta las funciones necesarias
module.exports = {
    // Esta es la función que debe ser llamada por el middleware 'authorize'
    // Devuelve ['modulo-accion', ...]
    findByRoleId: getCombinedPermissionsByRoleId,

    // Esta es la función que debe ser llamada por authService.js para obtener los pares de claves
    // Devuelve [{permissionKey: '...', privilegeKey: '...'}, ...]
    getEffectiveKeysByRoleId: getPermissionKeyPrivilegeKeyPairsByRoleId, // <-- CORRECCIÓN PRINCIPAL

    // Otras funciones
    getRawAssignmentsByRoleId,
    deleteByRoleId,
    bulkCreate,

    // Opcional: Exportar las funciones también por su nombre original si necesitas acceder a ellas directamente
    getCombinedPermissionsByRoleId,
    getPermissionKeyPrivilegeKeyPairsByRoleId
};