'use strict';

const {
    role: Role,
    permission: Permission,
    privilege: Privilege,
    RolePrivilege,
} = require('../models');
const { Op } = require('sequelize');

const LOG_REPO_RP = "[Repo RolePrivileges]";

// Logs de verificación de modelos importados (buena práctica que ya tenías)
console.log(`${LOG_REPO_RP} Modelo Permission importado:`, Permission ? Permission.name : "Permission UNDEFINED");
console.log(`${LOG_REPO_RP} Modelo Privilege importado:`, Privilege ? Privilege.name : "Privilege UNDEFINED");
console.log(`${LOG_REPO_RP} Modelo RolePrivilege importado:`, RolePrivilege ? RolePrivilege.name : "RolePrivilege UNDEFINED");
console.log(`${LOG_REPO_RP} Modelo Role importado:`, Role ? Role.name : "Role UNDEFINED");


const getCombinedPermissionsByRoleId = async (idRole) => {
    console.log(`${LOG_REPO_RP} getCombinedPermissionsByRoleId - Rol ID: ${idRole}`);
    if (!Permission || !Privilege || !RolePrivilege) {
        console.error(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Uno o más modelos son UNDEFINED.`);
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
                    // CORRECCIÓN: Usar el alias definido en models/index.js
                    as: 'privilegeDetails',
                    attributes: ['privilegeKey', 'status'],
                    required: true,
                    where: { status: true },
                    include: [
                        {
                            model: Permission,
                            // CORRECCIÓN: Usar el alias definido en models/index.js
                            as: 'permission',
                            attributes: ['permissionKey', 'status'],
                            required: true,
                            where: { status: true }
                        }
                    ]
                }
            ],
        });

        const combinedPermissions = results.map(entry => {
            // Acceder a través de los alias
            const privilegeData = entry.privilegeDetails;
            if (!privilegeData || !privilegeData.permission) {
                console.warn(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Datos anidados incompletos para RolePrivilege ID ${entry.idPrivilegedRole}`);
                return null;
            }
            const pKey = privilegeData.permission.permissionKey;
            const privKey = privilegeData.privilegeKey;
            return `${pKey}-${privKey}`;
        }).filter(Boolean);

        console.log(`${LOG_REPO_RP} (getCombinedPermissionsByRoleId) Permisos combinados para Rol ID ${roleIdInt}:`, combinedPermissions);
        return combinedPermissions;

    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en getCombinedPermissionsByRoleId para rol ${idRole}:`, error.message);
        console.error(error.stack);
        throw error;
    }
};

// =========================================================================
// == ESTA ES LA FUNCIÓN QUE PROVOCABA EL ERROR ORIGINAL DEL STACK TRACE ==
// =========================================================================
const getPermissionKeyPrivilegeKeyPairsByRoleId = async (idRole) => {
    // ===== PRUEBA DE DIAGNÓSTICO =====
    console.log("### ARCHIVO CORRECTO EN EJECUCIÓN (v2) ### - Dentro de getPermissionKeyPrivilegeKeyPairsByRoleId");
    // =================================

    console.log(`${LOG_REPO_RP} getPermissionKeyPrivilegeKeyPairsByRoleId - Rol ID: ${idRole}`);
     if (!Permission || !Privilege || !RolePrivilege) {
        console.error(`${LOG_REPO_RP} (getPermissionKeyPrivilegeKeyPairsByRoleId) Uno o más modelos son UNDEFINED.`);
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
                    // <-- LA CORRECCIÓN CLAVE ESTÁ AQUÍ -->
                    as: 'privilegeDetails',
                    attributes: ['privilegeKey', 'status'],
                    required: true,
                    where: { status: true },
                    include: [
                        {
                            model: Permission,
                            // <-- Y AQUÍ -->
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
            const privilegeData = entry.privilegeDetails;
            if (!privilegeData || !privilegeData.permission) {
                console.warn(`${LOG_REPO_RP} (getPermissionKeyPrivilegeKeyPairsByRoleId) Datos anidados incompletos para RolePrivilege ID ${entry.idPrivilegedRole}`);
                return null;
            }
            const pKey = privilegeData.permission.permissionKey;
            const privKey = privilegeData.privilegeKey;

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
                // CORRECCIÓN: Usar el alias correcto aquí también
                as: 'privilegeDetails',
                attributes: ['idPermission'],
                required: true
            }]
        });
        return assignments.map(a => {
            // Acceder a través del alias
            const privilegeData = a.privilegeDetails;
            if (!privilegeData || typeof privilegeData.idPermission === 'undefined') {
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
    // ... (esta función no necesita cambios, está bien como estaba)
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
    // ... (esta función no necesita cambios, está bien como estaba)
    console.log(`${LOG_REPO_RP} bulkCreate - Asignaciones:`, assignments);
    if (!RolePrivilege) {
        console.error(`${LOG_REPO_RP} (bulkCreate) Modelo RolePrivilege es UNDEFINED.`);
        throw new Error("Error de configuración de modelos en el repositorio.");
    }
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
        console.error(`${LOG_REPO_RP} Estructura inválida en 'assignments'. Ejemplo:`, invalidAssignment);
        throw new Error(`Estructura inválida en 'assignments'. Se esperan objetos con idRole e idPrivilege como enteros positivos.`);
    }

    try {
        return RolePrivilege.bulkCreate(assignments, { ...options, validate: true });
    } catch (error) {
        console.error(`${LOG_REPO_RP} Error en bulkCreate:`, error.message);
        console.error(error.stack);
        if (error.name === 'SequelizeUniqueConstraintError') {
            const constraintFields = error.fields && typeof error.fields === 'object' ? Object.keys(error.fields).join(', ') : (error.fields || 'desconocidos');
            throw new Error(`Error de restricción única (campos: ${constraintFields}) al crear asignaciones.`);
        }
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error(`Error de clave foránea al crear asignaciones: Un rol o privilegio especificado no existe.`);
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