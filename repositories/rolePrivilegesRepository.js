// repositories/rolePrivilegesRepository.js
const {
    role: Role,
    permission: Permission,
    privilege: Privilege,
    RolePrivilege, // Este ya está bien
    // ... otros modelos que necesites ...
} = require('../models');const { Op } = require('sequelize');

const LOG_REPO_RP = "[Repo RolePrivileges]";

// Logs de verificación de modelos importados
console.log(`${LOG_REPO_RP} Modelo Permission importado:`, Permission ? Permission.name : "Permission UNDEFINED");
console.log(`${LOG_REPO_RP} Modelo Privilege importado:`, Privilege ? Privilege.name : "Privilege UNDEFINED");
console.log(`${LOG_REPO_RP} Modelo RolePrivilege importado:`, RolePrivilege ? RolePrivilege.name : "RolePrivilege UNDEFINED");
console.log(`${LOG_REPO_RP} Modelo Role importado:`, Role ? Role.name : "Role UNDEFINED");


const getCombinedPermissionsByRoleId = async (idRole) => {
    console.log(`${LOG_REPO_RP} getCombinedPermissionsByRoleId - Rol ID: ${idRole}`);
    if (!Permission || !Privilege || !RolePrivilege) {
        console.error(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Uno o más modelos (Permission, Privilege, RolePrivilege) son UNDEFINED.`);
        throw new Error("Error de configuración de modelos en el repositorio.");
    }
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
                    as: 'privilegeDetails', // Este alias DEBE coincidir con RolePrivilege.belongsTo(Privilege, {as: 'privilegeDetails'})
                    attributes: ['privilegeKey', 'status'], // idPermission no está aquí, está en Permission
                    required: true, // Solo trae RolePrivileges que tengan un Privilege activo asociado
                    where: { status: true }, // Solo Privilegios activos
                    include: [
                        {
                            model: Permission,
                            as: 'permission', // Este alias DEBE coincidir con Privilege.belongsTo(Permission, {as: 'permission'})
                            attributes: ['permissionKey', 'status'],
                            required: true, // Solo trae Privileges que tengan un Permission activo asociado
                            where: { status: true } // Solo Permisos activos
                        }
                    ]
                }
            ],
        });

        const combinedPermissions = results.map(entry => {
            // Acceder a través de los alias definidos en los includes
            const privilegeData = entry.privilegeDetails; // Usa el alias del include de Privilege
            if (!privilegeData || !privilegeData.permission) { // Usa el alias del include de Permission
                console.warn(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Datos anidados incompletos para RolePrivilege ID ${entry.idPrivilegedRole}:`, entry.toJSON ? entry.toJSON() : entry);
                return null;
            }
            const pKey = privilegeData.permission.permissionKey;
            const privKey = privilegeData.privilegeKey;

            if (!pKey || !privKey) {
                console.warn(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Claves permissionKey o privilegeKey faltantes: pKey=${pKey}, privKey=${privKey}`);
                return null;
            }
            return `${pKey}-${privKey}`;
        }).filter(Boolean); // Elimina nulos si alguna validación falló

        console.log(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Permisos combinados para Rol ID ${roleIdInt}:`, combinedPermissions);
        return combinedPermissions;

    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en getCombinedPermissionsByRoleId para rol ${idRole}:`, error.message);
        console.error(error.stack); // Log completo del stack para más detalles
        throw error;
    }
};

const getPermissionKeyPrivilegeKeyPairsByRoleId = async (idRole) => {
    console.log(`${LOG_REPO_RP} getPermissionKeyPrivilegeKeyPairsByRoleId - Rol ID: ${idRole}`);
     if (!Permission || !Privilege || !RolePrivilege) {
        console.error(`${LOG_REPO_RP} (getPermissionKeyPrivilegeKeyPairsByRoleId) Uno o más modelos (Permission, Privilege, RolePrivilege) son UNDEFINED.`);
        throw new Error("Error de configuración de modelos en el repositorio.");
    }
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
                    as: 'privilegeDetails', // Alias de RolePrivilege a Privilege
                    attributes: ['privilegeKey', 'status'],
                    required: true,
                    where: { status: true },
                    include: [
                        {
                            model: Permission,
                            as: 'permission', // Alias de Privilege a Permission
                            attributes: ['permissionKey', 'status'],
                            required: true,
                            where: { status: true }
                        }
                    ]
                }
            ]
        });

        const permissionKeyPrivilegeKeyPairs = results.map(entry => {
            const privilegeData = entry.privilegeDetails;
            if (!privilegeData || !privilegeData.permission) {
                console.warn(`${LOG_REPO_RP} (getPermissionKeyPrivilegeKeyPairsByRoleId) Datos anidados incompletos para RolePrivilege ID ${entry.idPrivilegedRole}:`, entry.toJSON ? entry.toJSON() : entry);
                return null;
            }
            const pKey = privilegeData.permission.permissionKey;
            const privKey = privilegeData.privilegeKey;

            if (!pKey || !privKey) {
                console.warn(`${LOG_REPO_RP} (getPermissionKeyPrivilegeKeyPairsByRoleId) Claves permissionKey o privilegeKey faltantes: pKey=${pKey}, privKey=${privKey}`);
                return null;
            }
            return { permissionKey: pKey, privilegeKey: privKey };
        }).filter(Boolean);

        console.log(`${LOG_REPO_RP} (getPermissionKeyPrivilegeKeyPairsByRoleId) Pares para Rol ID ${roleIdInt}:`, permissionKeyPrivilegeKeyPairs);
        return permissionKeyPrivilegeKeyPairs;

    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en getPermissionKeyPrivilegeKeyPairsByRoleId para rol ${idRole}:`, error.message);
        console.error(error.stack);
        throw error;
    }
};

const getRawAssignmentsByRoleId = async (idRole) => {
    console.log(`${LOG_REPO_RP} getRawAssignmentsByRoleId - Rol ID: ${idRole}`);
    if (!Privilege || !RolePrivilege) {
        console.error(`${LOG_REPO_RP} (getRawAssignmentsByRoleId) Modelos Privilege o RolePrivilege son UNDEFINED.`);
        throw new Error("Error de configuración de modelos en el repositorio.");
    }
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
                as: 'privilegeDetails', // Alias de RolePrivilege a Privilege
                attributes: ['idPermission'], // idPermission está en Privilege
                required: true
                // No necesitamos incluir Permission aquí si solo queremos idPermission
            }]
        });
        return assignments.map(a => {
            const privilegeData = a.privilegeDetails;
            if (!privilegeData || typeof privilegeData.idPermission === 'undefined') { // Verifica que idPermission exista
                console.warn(`${LOG_REPO_RP} (getRawAssignmentsByRoleId) Falta 'privilegeDetails.idPermission' para RolePrivilege con idPrivilege ${a.idPrivilege} en Rol ID ${roleIdInt}`);
                return null;
            }
            return {
                idPrivilege: a.idPrivilege,
                idPermission: privilegeData.idPermission
            };
        }).filter(Boolean);
    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en getRawAssignmentsByRoleId para rol ${idRole}:`, error.message);
        console.error(error.stack);
        throw error;
    }
};

const deleteByRoleId = async (idRole, options = {}) => {
    console.log(`${LOG_REPO_RP} deleteByRoleId - Rol ID: ${idRole}`);
     if (!RolePrivilege) {
        console.error(`${LOG_REPO_RP} (deleteByRoleId) Modelo RolePrivilege es UNDEFINED.`);
        throw new Error("Error de configuración de modelos en el repositorio.");
    }
    try {
        const roleIdInt = parseInt(idRole, 10);
        if (isNaN(roleIdInt)) {
            throw new Error("ID de rol inválido.");
        }
        const queryOptions = { where: { idRole: roleIdInt }, ...options };
        return RolePrivilege.destroy(queryOptions);
    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en deleteByRoleId para rol ${idRole}:`, error.message);
        console.error(error.stack);
        throw error;
    }
};

const bulkCreate = async (assignments, options = {}) => {
    console.log(`${LOG_REPO_RP} bulkCreate - Asignaciones:`, assignments);
    if (!RolePrivilege) {
        console.error(`${LOG_REPO_RP} (bulkCreate) Modelo RolePrivilege es UNDEFINED.`);
        throw new Error("Error de configuración de modelos en el repositorio.");
    }
    // ... (resto de validaciones de la función bulkCreate sin cambios) ...
    if (!Array.isArray(assignments)) {
        throw new Error("Se esperaba un array para 'assignments' en bulkCreate.");
    }
    if (assignments.length === 0) {
        console.log(`${LOG_REPO_RP} bulkCreate - Array de asignaciones vacío, no se creará nada.`);
        return [];
    }
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
        ) || {};
        console.error(`${LOG_REPO_RP} Estructura inválida en 'assignments'. Ejemplo de asignación inválida:`, invalidAssignment);
        throw new Error(`Estructura inválida en 'assignments'. Se esperan objetos con idRole e idPrivilege como enteros positivos. Inválido: ${JSON.stringify(invalidAssignment)}`);
    }

    try {
        return RolePrivilege.bulkCreate(assignments, { ...options, validate: true });
    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en bulkCreate:`, error.message);
        console.error(error.stack);
        if (error.name === 'SequelizeUniqueConstraintError') {
            const constraintFields = error.fields && typeof error.fields === 'object' ? Object.keys(error.fields).join(', ') : (error.fields || 'desconocidos');
            throw new Error(`Error de restricción única (campos: ${constraintFields}) al crear asignaciones en lote: ${error.errors?.[0]?.message || error.message}`);
        }
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error(`Error de clave foránea al crear asignaciones: Un rol o privilegio especificado no existe. Detalles: ${error.message}`);
        }
        throw error;
    }
};

module.exports = {
    findByRoleId: getCombinedPermissionsByRoleId,
    getEffectiveKeysByRoleId: getPermissionKeyPrivilegeKeyPairsByRoleId,
    getRawAssignmentsByRoleId,
    deleteByRoleId,
    bulkCreate,
};