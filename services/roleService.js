// services/roleService.js
const roleRepository = require('../repositories/roleRepository');
const rolePrivilegesRepository = require('../repositories/rolePrivilegesRepository');
const db = require('../models'); // Importa el objeto db que contiene todos los modelos y sequelize

const User = db.User; // Modelo User
const Role = db.Role; // Modelo Role
const RolePrivilegeModel = db.RolePrivilege; // Modelo para RolePrivileges
const sequelize = db.sequelize; // Instancia de Sequelize

const LOG_PREFIX_SERVICE = "[SERVICE RoleService]";

const createRole = async (roleData) => {
    console.log(`${LOG_PREFIX_SERVICE} createRole - Datos recibidos:`, JSON.stringify(roleData, null, 2));
    // roleData: { roleName, status?, privilegeAssignments?: [{ idPrivilege: number, idPermission?: number }] }
    // La validación en roleValidations.js (validatePermissionsAndPrivilegesExistAndMatch)
    // ya verificó que idPrivilege existe, y si idPermission se da, también existe y el privilegio pertenece al permiso.

    const { roleName, status, privilegeAssignments } = roleData;
    let t;
    try {
        t = await sequelize.transaction();
        console.log(`${LOG_PREFIX_SERVICE} createRole - Transacción iniciada.`);

        const newRole = await roleRepository.createRole(
            { roleName, status: status !== undefined ? status : true },
            { transaction: t }
        );
        console.log(`${LOG_PREFIX_SERVICE} createRole - Rol base creado con ID: ${newRole.idRole}`);

        if (privilegeAssignments && Array.isArray(privilegeAssignments) && privilegeAssignments.length > 0) {
            // Para RolePrivileges, solo necesitamos idRole e idPrivilege
            const assignmentsToCreateInDb = privilegeAssignments.map(inputAssignment => {
                if (!inputAssignment || typeof inputAssignment.idPrivilege !== 'number') {
                    console.error(`${LOG_PREFIX_SERVICE} createRole - Formato de asignación inválido:`, inputAssignment);
                    throw new Error(`Formato de asignación inválido. Se esperaba idPrivilege como número.`);
                }
                return {
                    idRole: newRole.idRole,
                    idPrivilege: inputAssignment.idPrivilege, // Solo idPrivilege para la tabla RolePrivilege
                };
            });
            console.log(`${LOG_PREFIX_SERVICE} createRole - Asignaciones para DB (bulkCreate):`, JSON.stringify(assignmentsToCreateInDb, null, 2));
            await rolePrivilegesRepository.bulkCreate(assignmentsToCreateInDb, { transaction: t });
            console.log(`${LOG_PREFIX_SERVICE} createRole - Asignaciones de privilegios creadas.`);
        } else {
            console.log(`${LOG_PREFIX_SERVICE} createRole - No se proporcionaron privilegeAssignments o está vacío.`);
        }

        await t.commit();
        console.log(`${LOG_PREFIX_SERVICE} createRole - Transacción commit. Rol ${newRole.idRole} creado.`);

        // Devolver el rol con sus privilegios asignados podría ser útil
        const roleWithDetails = await Role.findByPk(newRole.idRole, {
            // include: [ { model: db.Privilege, as: 'assignedPrivileges' } ] // Si tienes esta asociación definida
        });
        return roleWithDetails ? roleWithDetails.toJSON() : newRole.toJSON();

    } catch (error) {
        console.error(`${LOG_PREFIX_SERVICE} createRole - ERROR: ${error.message}`, error.stack);
        if (t && !t.finished) {
            await t.rollback();
            console.log(`${LOG_PREFIX_SERVICE} createRole - Transacción rollback.`);
        }

        if (error.name === 'SequelizeUniqueConstraintError' || (error.original && error.original.code === 'ER_DUP_ENTRY')) {
            throw new Error(`El rol con nombre '${roleName}' ya existe.`);
        } else if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            throw new Error(`Error de validación al crear el rol: ${messages}`);
        }
        throw new Error(error.message || `Error al crear el rol.`);
    }
};

// --- FUNCIÓN FALTANTE ---
const getAllRoles = async () => {
    console.log(`${LOG_PREFIX_SERVICE} getAllRoles - Solicitado.`);
    try {
        const roles = await roleRepository.getAllRoles();
        // Opcionalmente, aquí podrías mapear los roles para incluir sus privilegios si es necesario para la lista
        // Por ejemplo:
        // const rolesWithPrivileges = await Promise.all(roles.map(async (role) => {
        //    const privileges = await getRoleEffectivePermissions(role.idRole); // O getRolePrivileges
        //    return { ...role.toJSON(), privileges };
        // }));
        // return rolesWithPrivileges;
        return roles; // Devuelve las instancias de Sequelize o roles.map(r => r.toJSON())
    } catch (error) {
        console.error(`${LOG_PREFIX_SERVICE} getAllRoles - Error:`, error);
        throw new Error('Error al obtener todos los roles.');
    }
};
// --- FIN FUNCIÓN FALTANTE ---


const getRoleById = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    // Podrías incluir los privilegios aquí también, como se sugirió en el comentario anterior
    const role = await Role.findByPk(idRole, {
        // include: [{
        //     model: db.Privilege,
        //     as: 'assignedPrivileges',
        //     attributes: ['idPrivilege', 'privilegeName', 'privilegeKey', 'idPermission'],
        //     through: { attributes: [] }
        // }]
    });
    if (!role) {
        throw new Error('Rol no encontrado');
    }
    return role; // Devuelve la instancia de Sequelize
};


const updateRole = async (idRoleParam, roleData) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        console.error(`${LOG_PREFIX_SERVICE} updateRole - ID de rol no numérico: '${idRoleParam}'`);
        throw new Error('El ID del rol debe ser un número.');
    }
    console.log(`${LOG_PREFIX_SERVICE} updateRole - Actualizando rol ID: ${idRole} con datos:`, JSON.stringify(roleData, null, 2));

    const role = await roleRepository.getRoleById(idRole); // Validar existencia usando el repo
    if (!role) {
        throw new Error('Rol no encontrado.');
    }


    const dataToUpdate = {};
    if (roleData.roleName !== undefined) dataToUpdate.roleName = roleData.roleName;
    if (roleData.status !== undefined) dataToUpdate.status = roleData.status;

    if (Object.keys(dataToUpdate).length === 0) {
        console.warn(`${LOG_PREFIX_SERVICE} updateRole - No hay datos válidos para actualizar para el rol ID: ${idRole}.`);
        throw new Error("No se proporcionaron datos válidos para actualizar (nombre o estado).");
    }
    try {
        // El repositorio updateRole solo actualiza nombre y estado
        const [affectedRows] = await roleRepository.updateRole(idRole, dataToUpdate);
        console.log(`${LOG_PREFIX_SERVICE} updateRole - Filas afectadas: ${affectedRows} para rol ID: ${idRole}`);
        if (affectedRows === 0) {
            const currentRole = await roleRepository.getRoleById(idRole);
            if (!currentRole) throw new Error('Rol no encontrado durante la actualización.');
            // Si existe y no hubo filas afectadas, los datos eran los mismos.
        }
        return roleRepository.getRoleById(idRole); // Devolver el rol actualizado
    } catch (error) {
        console.error(`${LOG_PREFIX_SERVICE} updateRole - Error al actualizar rol ID: ${idRole}`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error(`El nombre de rol '${roleData.roleName}' ya está en uso.`);
        }
        throw new Error(`Error al actualizar el rol: ${error.message}`);
    }
};


const deleteRole = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    console.log(`${LOG_PREFIX_SERVICE} deleteRole - Rol ID: ${idRole}`);

    const role = await roleRepository.getRoleById(idRole);
    if (!role) {
        throw new Error('Rol no encontrado');
    }

    const userCount = await User.count({ where: { idRole } });
    if (userCount > 0) {
        throw new Error('No se puede eliminar el rol porque tiene usuarios asociados.');
    }

    const transaction = await sequelize.transaction();
    try {
        // rolePrivilegesRepository.deleteByRoleId ya maneja la eliminación de RolePrivilege
        await rolePrivilegesRepository.deleteByRoleId(idRole, { transaction });
        const numDeletedRoles = await roleRepository.deleteRole(idRole, { transaction }); // Pasar la transacción

        await transaction.commit();
        console.log(`${LOG_PREFIX_SERVICE} deleteRole - Rol ID: ${idRole} eliminado. Filas: ${numDeletedRoles}`);
        return numDeletedRoles;
    } catch (error) {
        await transaction.rollback();
        console.error(`${LOG_PREFIX_SERVICE} deleteRole - Error transaccional Rol ID: ${idRole}`, error);
        throw new Error(`No se pudo eliminar el rol (ID: ${idRole}): ${error.message}`);
    }
};

const changeRoleState = async (idRoleParam, status) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    if (typeof status !== 'boolean') {
        throw new Error('El estado debe ser un valor booleano (true/false).');
    }
    const role = await roleRepository.getRoleById(idRole); // Validar existencia
    if (!role) {
        throw new Error('Rol no encontrado.');
    }

    const [affectedRows] = await roleRepository.changeRoleState(idRole, status);
    if (affectedRows === 0) {
        // Esto podría suceder si el estado ya era el que se intentó establecer
        // o si el rol fue eliminado justo antes (menos probable si getRoleById se ejecutó bien)
        const currentRole = await roleRepository.getRoleById(idRole);
        if (!currentRole) throw new Error('Rol no encontrado después de intentar cambiar el estado.');
    }
    return roleRepository.getRoleById(idRole); // Devolver el rol actualizado
};


// Usado por roleController para GET /api/roles/:idRole/privileges
// Devuelve [{idPermission, idPrivilege}, ...] para el FormPermissions.jsx
const getRolePrivileges = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    const role = await roleRepository.getRoleById(idRole); // Validar existencia
    if (!role) {
        throw new Error('Rol no encontrado.');
    }
    // Esta función del repo ya está corregida para incluir idPermission desde Privilege
    return rolePrivilegesRepository.getRawAssignmentsByRoleId(idRole);
};

// Usado por roleController para PUT /api/roles/:idRole/privileges
// rolePrivilegesInput: [{ idPrivilege: number, idPermission?: number }, ...]
const assignPrivilegesToRole = async (idRoleParam, rolePrivilegesInput) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    if (!Array.isArray(rolePrivilegesInput)) {
        throw new Error("Se esperaba un array para 'rolePrivilegesInput'.");
    }
    console.log(`${LOG_PREFIX_SERVICE} assignPrivilegesToRole - Rol ID: ${idRole}, Datos:`, JSON.stringify(rolePrivilegesInput, null, 2));

    const t = await sequelize.transaction();
    try {
        const role = await roleRepository.getRoleById(idRole); // Validar existencia
        if (!role) {
            throw new Error('Rol no encontrado.');
        }

        await rolePrivilegesRepository.deleteByRoleId(idRole, { transaction: t });

        if (rolePrivilegesInput.length > 0) {
            // La validación (validatePermissionsAndPrivilegesExistAndMatch) ya se encargó de verificar
            // que los idPrivilege son válidos y que si se da idPermission, el privilegio le pertenece.
            // Ahora solo necesitamos los idPrivilege para la tabla RolePrivilege.
            const assignmentsToCreateInDb = rolePrivilegesInput.map(inputAssignment => {
                 if (!inputAssignment || typeof inputAssignment.idPrivilege !== 'number') {
                    console.error(`${LOG_PREFIX_SERVICE} assignPrivilegesToRole - Formato de asignación inválido:`, inputAssignment);
                    throw new Error(`Formato de asignación inválido. Se esperaba idPrivilege como número.`);
                }
                return {
                    idRole: idRole,
                    idPrivilege: inputAssignment.idPrivilege,
                };
            });
            console.log(`${LOG_PREFIX_SERVICE} assignPrivilegesToRole - Asignaciones para DB (bulkCreate):`, JSON.stringify(assignmentsToCreateInDb, null, 2));
            await rolePrivilegesRepository.bulkCreate(assignmentsToCreateInDb, { transaction: t });
        }

        await t.commit();
        console.log(`${LOG_PREFIX_SERVICE} assignPrivilegesToRole - Transacción commit. Privilegios asignados Rol ID: ${idRole}`);
        return { success: true, message: 'Privilegios asignados correctamente.' };

    } catch (error) {
        await t.rollback();
        console.error(`${LOG_PREFIX_SERVICE} assignPrivilegesToRole - Error Rol ID: ${idRole}`, error);
        throw new Error(error.message || `Error al asignar privilegios.`);
    }
};

// getRoleEffectivePermissions se mantiene similar, usa getEffectiveKeysByRoleId del repo
const getRoleEffectivePermissions = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    const role = await roleRepository.getRoleById(idRole); // Validar existencia
    if (!role) {
        throw new Error('Rol no encontrado.');
    }

    const flatPermissions = await rolePrivilegesRepository.getEffectiveKeysByRoleId(idRole); // Corregido
    const effectivePermissions = {};
    flatPermissions.forEach(item => {
        if (!effectivePermissions[item.permissionKey]) {
            effectivePermissions[item.permissionKey] = [];
        }
        if (!effectivePermissions[item.permissionKey].includes(item.privilegeKey)) {
            effectivePermissions[item.permissionKey].push(item.privilegeKey);
        }
    });
    return effectivePermissions;
};


module.exports = {
    createRole,
    getAllRoles, // <--- AHORA ESTÁ DEFINIDA
    getRoleById,
    updateRole,
    deleteRole,
    changeRoleState,
    getRolePrivileges,
    assignPrivilegesToRole,
    getRoleEffectivePermissions,
};