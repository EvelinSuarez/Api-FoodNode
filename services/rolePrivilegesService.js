// services/rolePrivilegesService.js
// Este servicio maneja operaciones directas sobre la tabla RolePrivilege
// (la tabla de unión entre Role y Privilege)

const { RolePrivilege, Role, Privilege, Permission } = require('../models'); // RolePrivilege es el modelo de la tabla de unión
const { Op } = require('sequelize');

const LOG_SERVICE_RP = "[SERVICE RolePrivileges]";

/**
 * Obtiene todas las entradas de la tabla RolePrivilege.
 * Incluye detalles del Rol y del Privilegio (y a su vez el Permiso del Privilegio).
 */
const getAllRolePrivileges = async () => {
    console.log(`${LOG_SERVICE_RP} getAllRolePrivileges`);
    return RolePrivilege.findAll({
        include: [
            {
                model: Role,
                as: 'role', // Asegúrate que 'role' es el alias correcto en el modelo RolePrivilege
                attributes: ['idRole', 'roleName']
            },
            {
                model: Privilege,
                as: 'privilege', // Asegúrate que 'privilege' es el alias correcto
                attributes: ['idPrivilege', 'privilegeName', 'privilegeKey'],
                include: [{
                    model: Permission,
                    as: 'permission', // Asegúrate que 'permission' es el alias en el modelo Privilege
                    attributes: ['idPermission', 'permissionName', 'permissionKey']
                }]
            }
        ]
    });
};

/**
 * Obtiene una entrada específica de RolePrivilege por su PK (idPrivilegedRole).
 */
const getRolePrivilegeById = async (idPrivilegedRole) => {
    console.log(`${LOG_SERVICE_RP} getRolePrivilegeById - ID: ${idPrivilegedRole}`);
    const entry = await RolePrivilege.findByPk(idPrivilegedRole, {
        include: [
            { model: Role, as: 'role' },
            {
                model: Privilege,
                as: 'privilege',
                include: [{ model: Permission, as: 'permission' }]
            }
        ]
    });
    if (!entry) {
        console.warn(`${LOG_SERVICE_RP} getRolePrivilegeById - Entrada no encontrada para ID: ${idPrivilegedRole}`);
        throw new Error('Asignación rol-privilegio no encontrada.');
    }
    return entry;
};

/**
 * Crea UNA SOLA entrada en la tabla RolePrivilege.
 * El body esperado es { idRole, idPrivilege }.
 * La validación de existencia de Role y Privilege, y la unicidad de la combinación,
 * se espera que se hayan realizado en el middleware de validación.
 */
const createRolePrivilege = async (data) => {
    console.log(`${LOG_SERVICE_RP} createRolePrivilege - Data:`, data);
    const { idRole, idPrivilege } = data;

    // La validación de tipo ya se hizo en el middleware, pero una verificación rápida no hace daño
    if (typeof idRole !== 'number' || typeof idPrivilege !== 'number') {
        console.error(`${LOG_SERVICE_RP} createRolePrivilege - Tipos de ID inválidos: idRole=${typeof idRole}, idPrivilege=${typeof idPrivilege}`);
        throw new Error('idRole e idPrivilege deben ser números.');
    }
    try {
        // RolePrivilege SOLO tiene idRole e idPrivilege
        return RolePrivilege.create({ idRole, idPrivilege });
    } catch (error) {
        console.error(`${LOG_SERVICE_RP} createRolePrivilege - Error:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error('Esta combinación de rol y privilegio ya existe.');
        }
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error('El rol o privilegio especificado no existe.');
        }
        throw error; // Re-lanzar otros errores
    }
};

/**
 * Actualiza UNA SOLA entrada en la tabla RolePrivilege.
 * El body esperado es { idRole, idPrivilege }.
 */
const updateRolePrivilege = async (idPrivilegedRole, data) => {
    console.log(`${LOG_SERVICE_RP} updateRolePrivilege - ID: ${idPrivilegedRole}, Data:`, data);
    const { idRole, idPrivilege } = data;

    if (typeof idRole !== 'number' || typeof idPrivilege !== 'number') {
        console.error(`${LOG_SERVICE_RP} updateRolePrivilege - Tipos de ID inválidos.`);
        throw new Error('idRole e idPrivilege deben ser números.');
    }

    const entry = await RolePrivilege.findByPk(idPrivilegedRole);
    if (!entry) {
        console.warn(`${LOG_SERVICE_RP} updateRolePrivilege - Entrada no encontrada para ID: ${idPrivilegedRole}`);
        throw new Error('Asignación rol-privilegio no encontrada para actualizar.');
    }

    try {
        const [affectedRows] = await RolePrivilege.update(
            { idRole, idPrivilege }, // RolePrivilege SOLO tiene idRole e idPrivilege
            { where: { idPrivilegedRole: Number(idPrivilegedRole) } }
        );

        if (affectedRows === 0) {
            console.log(`${LOG_SERVICE_RP} updateRolePrivilege - 0 filas afectadas. Verificando si los datos eran los mismos o si el registro desapareció.`);
            const currentEntry = await RolePrivilege.findByPk(Number(idPrivilegedRole));
            if (!currentEntry) {
                throw new Error('Asignación rol-privilegio no encontrada después del intento de actualización (posiblemente eliminada concurrentemente).');
            }
             // Si la entrada existe pero no hubo filas afectadas, los datos eran los mismos.
        }
        return RolePrivilege.findByPk(Number(idPrivilegedRole)); // Devuelve la entrada actualizada (o sin cambios)
    } catch (error) {
        console.error(`${LOG_SERVICE_RP} updateRolePrivilege - Error:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error('Esta combinación de rol y privilegio ya está en uso por otra asignación.');
        }
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error('El nuevo rol o privilegio especificado no existe.');
        }
        throw error;
    }
};

/**
 * Elimina UNA SOLA entrada de la tabla RolePrivilege por su PK.
 */
const deleteRolePrivilege = async (idPrivilegedRole) => {
    console.log(`${LOG_SERVICE_RP} deleteRolePrivilege - ID: ${idPrivilegedRole}`);
    const numIdPrivilegedRole = Number(idPrivilegedRole);
    if (isNaN(numIdPrivilegedRole)) {
        throw new Error('ID de asignación rol-privilegio inválido.');
    }

    const entry = await RolePrivilege.findByPk(numIdPrivilegedRole);
    if (!entry) {
        console.warn(`${LOG_SERVICE_RP} deleteRolePrivilege - Entrada no encontrada para ID: ${numIdPrivilegedRole}`);
        throw new Error('Asignación rol-privilegio no encontrada para eliminar.');
    }
    const deletedCount = await RolePrivilege.destroy({
        where: { idPrivilegedRole: numIdPrivilegedRole }
    });
    return deletedCount; // Debería ser 1 si se encontró y eliminó
};

// La función 'assignPrivilegesToRole' NO pertenece a este servicio si la lógica principal
// de asignar privilegios a un ROL (no una entrada individual de RolePrivilege)
// está en 'roleService.js'. Mantenerla aquí crea confusión y posible duplicidad de lógica.
// Si por alguna razón EXTREMADAMENTE específica la necesitas aquí, asegúrate de que el
// controlador que la llama y su propósito estén claros y no colisionen con roleService.
// Generalmente, se elimina de aquí.
/*
const assignPrivilegesToRole = async (idRole, privilegePermissions) => {
    // ... lógica ...
    // PERO RECUERDA: RolePrivileges.create solo toma idRole e idPrivilege.
    // La validación de si el idPrivilege pertenece al idPermission (si se proporciona)
    // debe hacerse ANTES de llegar aquí.
};
*/

module.exports = {
    getAllRolePrivileges,
    getRolePrivilegeById,
    createRolePrivilege,
    updateRolePrivilege,
    deleteRolePrivilege,
    // No exportar assignPrivilegesToRole desde aquí si roleService lo maneja.
};