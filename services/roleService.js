// services/roleService.js
const roleRepository = require('../repositories/roleRepository');
const rolePrivilegesRepository = require('../repositories/rolePrivilegesRepository');

// --- IMPORTACIÓN CORREGIDA Y MODELO ADICIONAL ---
const db = require('../models');
// console.log("DEBUG: Contenido del objeto 'db' importado:", Object.keys(db)); // Puedes comentar/eliminar este log ahora si quieres

const User = db.User;
const RolePrivilegesModel = db.RolePrivilege; // <--- CORREGIDO AQUÍ: Debe ser 'RolePrivilege' (singular)
const sequelize = db.sequelize;

// ... (el resto de tu código de roleService.js permanece igual que la versión anterior que te di) ...

const createRole = async (roleData) => {
    const { roleName, status, rolePrivileges } = roleData;
    let t; // Declara 't' fuera para que esté disponible en el catch
    try {
        t = await sequelize.transaction(); // Inicia transacción

        const newRole = await roleRepository.createRole({ roleName, status: !!status }, { transaction: t });

        if (rolePrivileges && Array.isArray(rolePrivileges) && rolePrivileges.length > 0) {
             const assignmentsToCreate = rolePrivileges.map(priv => ({
                idRole: newRole.idRole,
                idPermission: priv.idPermission,
                idPrivilege: priv.idPrivilege,
            }));
            await rolePrivilegesRepository.bulkCreate(assignmentsToCreate, { transaction: t });
        }

        await t.commit();
        console.log(`Service: Role ${newRole.idRole} created successfully.`);
        return newRole.toJSON();

    } catch (error) {
        console.error("Service Error in createRole. Original error message:", error.message);
        if (t && !t.finished) { // Verifica si 't' existe y la transacción no ha sido committed/rolled back
            try {
                await t.rollback();
                console.log("Service createRole: Transaction rolled back successfully.");
            } catch (rollbackError) {
                console.error("Service createRole: Error during transaction rollback:", rollbackError);
                // Aquí podrías lanzar un error que indique fallo en rollback si es crítico
            }
        }
        
        // Personalizar el mensaje de error basado en el tipo de error de Sequelize
        if (error.name === 'SequelizeUniqueConstraintError' || (error.original && error.original.code === 'ER_DUP_ENTRY')) {
            // Asumiendo que roleName tiene una restricción de unicidad
            throw new Error(`El rol con nombre '${roleName}' ya existe.`);
        } else if (error.name === 'SequelizeValidationError') {
            // Errores de validación del modelo
            const messages = error.errors.map(e => e.message).join(', ');
            throw new Error(`Error de validación al crear el rol: ${messages}`);
        }
        // Para el error de 'uuid' u otros no específicos:
        throw new Error(`Error al crear el rol: ${error.message || "Ocurrió un error desconocido."}`);
    }
};

const getAllRoles = async () => {
    return roleRepository.getAllRoles();
};

const getRoleById = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    const role = await roleRepository.getRoleById(idRole);
    if (!role) {
        throw new Error('Rol no encontrado');
    }
    return role;
};

const getRoleEffectivePermissions = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    await getRoleById(idRole);

    const flatPermissions = await rolePrivilegesRepository.getEffectiveKeysByRoleId(idRole);
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

const updateRole = async (idRoleParam, roleData) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    await getRoleById(idRole);

    return roleRepository.updateRole(idRole, {
        roleName: roleData.roleName,
        status: roleData.status
    });
};
/**
 * Elimina un rol existente, asegurándose de eliminar primero sus privilegios asociados.
 * @param {string|number} idRoleParam - El ID del rol a eliminar.
 * @returns {Promise<number>} - El número de filas de roles eliminadas (debería ser 1 si tuvo éxito).
 * @throws {Error} - Si el rol no se encuentra, tiene usuarios asociados, o si ocurre otro error.
 */
const deleteRole = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }

    await getRoleById(idRole); // Validar que el rol existe

    // Validar si tiene usuarios asociados
    // console.log("DEBUG: En deleteRole, valor de User antes de count:", User); // Ya no es necesario este log específico de User
    if (!User || typeof User.count !== 'function') {
        console.error("CRITICAL ERROR: El modelo User no está definido o no tiene el método count en roleService.js");
        throw new Error("Error interno del servidor: Configuración incorrecta del modelo User.");
    }

    const userCount = await User.count({ where: { idRole } });
    if (userCount > 0) {
        throw new Error('No se puede eliminar el rol porque tiene usuarios asociados');
    }

    // Iniciar una transacción para asegurar atomicidad
    const transaction = await sequelize.transaction();
    try {
        // Paso 1: Eliminar todas las asignaciones de privilegios para este rol
        console.log(`Servicio: Eliminando privilegios asociados al rol ID: ${idRole}`);
        if (!RolePrivilegesModel || typeof RolePrivilegesModel.destroy !== 'function') {
            // Este log ahora debería mostrar que RolePrivilegesModel está definido si la importación es correcta
            console.log("DEBUG: Valor de RolePrivilegesModel justo antes de la verificación:", RolePrivilegesModel);
            console.error("CRITICAL ERROR: El modelo RolePrivilege (RolePrivilegesModel) no está definido o no tiene el método destroy.");
            throw new Error("Error interno del servidor: Configuración incorrecta del modelo RolePrivilege.");
        }
        await RolePrivilegesModel.destroy({
            where: { idRole: idRole },
            transaction: transaction
        });

        // Paso 2: Eliminar el rol
        console.log(`Servicio: Procediendo a eliminar el rol ID: ${idRole} del repositorio.`);
        const numDeletedRoles = await roleRepository.deleteRole(idRole, { transaction: transaction });

        await transaction.commit();
        console.log(`Servicio: Rol ID ${idRole} y sus privilegios asociados eliminados exitosamente.`);
        return numDeletedRoles;

    } catch (error) {
        await transaction.rollback();
        console.error(`Error durante la eliminación transaccional del rol ID ${idRole}:`, error);
        throw new Error(`No se pudo eliminar el rol (ID: ${idRole}): ${error.message}`);
    }
};

const changeRoleState = async (idRoleParam, status) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    await getRoleById(idRole);

    return roleRepository.changeRoleState(idRole, status);
};

const getRolePrivileges = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    await getRoleById(idRole);

    return rolePrivilegesRepository.findByRoleId(idRole);
};

const assignPrivilegesToRole = async (idRoleParam, rolePrivilegesData) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }

    if (!Array.isArray(rolePrivilegesData)) {
        throw new Error("Se esperaba un array para 'rolePrivileges'.");
    }

    const t = await sequelize.transaction();
    try {
        await getRoleById(idRole);

        await rolePrivilegesRepository.deleteByRoleId(idRole, { transaction: t });

        if (rolePrivilegesData.length > 0) {
            const assignmentsToCreate = rolePrivilegesData.map(priv => ({
                idRole: idRole,
                idPermission: priv.idPermission,
                idPrivilege: priv.idPrivilege,
            }));
            await rolePrivilegesRepository.bulkCreate(assignmentsToCreate, { transaction: t });
        }

        await t.commit();
        console.log(`Service: Privileges assigned successfully for role ${idRole}.`);
        return { success: true, message: 'Privilegios asignados correctamente.' };

    } catch (error) {
        await t.rollback();
        console.error(`Service Error in assignPrivilegesToRole for role ${idRole}:`, error);
        throw new Error(`Error al asignar privilegios: ${error.message}`);
    }
};


module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    changeRoleState,
    getRolePrivileges,
    assignPrivilegesToRole,
    getRoleEffectivePermissions,
};