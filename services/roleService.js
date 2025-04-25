// services/roleService.js
const roleRepository = require('../repositories/roleRepository');
const rolePrivilegesRepository = require('../repositories/rolePrivilegesRepository');
const { sequelize, User } = require('../models/role'); // Importa User si necesitas validar usuarios asociados al eliminar

/**
 * Crea un nuevo rol y, opcionalmente, sus asignaciones de privilegios.
 * @param {object} roleData - Datos del rol. Debe contener { roleName, status } y opcionalmente { rolePrivileges: Array<{idPermission, idPrivilege}> }.
 * @returns {Promise<object>} - El objeto del rol creado (sin los privilegios asignados).
 * @throws {Error} - Si ocurre un error durante la creación o asignación.
 */
const createRole = async (roleData) => {
    const { roleName, status, rolePrivileges } = roleData; // Extrae los datos
    const t = await sequelize.transaction(); // Inicia transacción
    try {
        // 1. Crear el rol base usando el repositorio de roles
        const newRole = await roleRepository.createRole({ roleName, status }, { transaction: t }); // Pasar transacción

        // 2. Crear asignaciones de privilegios si se proporcionaron
        if (rolePrivileges && Array.isArray(rolePrivileges) && rolePrivileges.length > 0) {
             // (Opcional pero recomendado) Validar aquí que los IDs son números válidos
             const assignmentsToCreate = rolePrivileges.map(priv => ({
                idRole: newRole.idRole,
                idPermission: priv.idPermission,
                idPrivilege: priv.idPrivilege,
            }));
            // Usar el repositorio de privilegios para la creación masiva
            await rolePrivilegesRepository.bulkCreate(assignmentsToCreate, t); // Pasar transacción
        }

        // 3. Confirmar la transacción si todo fue exitoso
        await t.commit();
        console.log(`Service: Role ${newRole.idRole} created successfully.`);
        return newRole.toJSON(); // Devolver el objeto del rol creado

    } catch (error) {
        // 4. Revertir la transacción si algo falló
        await t.rollback();
        console.error("Service Error in createRole:", error);
        // Relanzar el error para que el controlador lo maneje
        throw new Error(`Error al crear el rol: ${error.message}`);
    }
};

/**
 * Obtiene todos los roles existentes.
 * @returns {Promise<Array<Role>>} - Un array con todos los roles.
 */
const getAllRoles = async () => {
    // Llama directamente al repositorio
    return roleRepository.getAllRoles();
};

/**
 * Obtiene un rol específico por su ID.
 * @param {number} idRole - El ID del rol a buscar.
 * @returns {Promise<Role>} - El objeto del rol encontrado.
 * @throws {Error} - Si el rol no se encuentra.
 */
const getRoleById = async (idRole) => {
    const role = await roleRepository.getRoleById(idRole);
    if (!role) {
        // Lanzar error si no se encuentra para que el controlador devuelva 404
        throw new Error('Rol no encontrado');
    }
    return role;
};

/**
 * Actualiza los datos básicos (nombre, estado) de un rol existente.
 * @param {number} idRole - El ID del rol a actualizar.
 * @param {object} roleData - Datos a actualizar (solo { roleName, status }).
 * @returns {Promise<Array<number>>} - Resultado de la operación de actualización.
 * @throws {Error} - Si el rol no se encuentra o si hay un error de validación (ej: nombre duplicado).
 */
const updateRole = async (idRole, roleData) => {
    // 1. Validar que el rol existe (reutilizando getRoleById)
    await getRoleById(idRole);

    // 2. (Opcional) Validar nombre único aquí si el repositorio no lo hace
    // ... (lógica para verificar nombre duplicado excluyendo el idRole actual)

    // 3. Llamar al repositorio para actualizar (pasando solo los campos permitidos)
    return roleRepository.updateRole(idRole, {
        roleName: roleData.roleName,
        status: roleData.status
    });
};

/**
 * Elimina un rol existente.
 * @param {number} idRole - El ID del rol a eliminar.
 * @returns {Promise<number>} - El número de filas eliminadas.
 * @throws {Error} - Si el rol no se encuentra, si tiene usuarios asociados, o si ocurre otro error.
 */
const deleteRole = async (idRole) => {
    // 1. Validar que el rol existe
    await getRoleById(idRole);

    // 2. Validar si tiene usuarios asociados (si es un requisito)
    const userCount = await User.count({ where: { idRole } });
    if (userCount > 0) {
        throw new Error('No se puede eliminar el rol porque tiene usuarios asociados');
    }

    // 3. (Opcional) Validar si es el rol del usuario actual (necesitaría pasar req.user.idRole)

    // 4. (Opcional pero recomendado si no hay CASCADE en DB) Eliminar asignaciones de privilegios primero
    // await rolePrivilegesRepository.deleteByRoleId(idRole); // Descomentar si es necesario

    // 5. Eliminar el rol usando el repositorio
    return roleRepository.deleteRole(idRole);
};

/**
 * Cambia el estado (activo/inactivo) de un rol.
 * @param {number} idRole - El ID del rol.
 * @param {boolean} status - El nuevo estado (true o false).
 * @returns {Promise<Array<number>>} - Resultado de la operación de actualización.
 * @throws {Error} - Si el rol no se encuentra.
 */
const changeRoleState = async (idRole, status) => {
    // 1. Validar que el rol existe
    await getRoleById(idRole);

    // 2. Llamar al repositorio para cambiar el estado
    return roleRepository.changeRoleState(idRole, status);
};

// --- Métodos para Manejar Privilegios del Rol ---

/**
 * Obtiene los IDs de los privilegios y permisos asignados a un rol específico.
 * @param {number} idRole - El ID del rol.
 * @returns {Promise<Array<{idPermission: number, idPrivilege: number}>>} - Array de objetos con los IDs.
 * @throws {Error} - Si el rol no se encuentra.
 */
const getRolePrivileges = async (idRole) => {
    // 1. Validar que el rol existe
    await getRoleById(idRole); // Reutiliza la validación existente

    // 2. Llamar al repositorio de privilegios para obtener las asignaciones
    return rolePrivilegesRepository.findByRoleId(idRole);
};

/**
 * Asigna (reemplazando las existentes) las combinaciones de privilegio/permiso a un rol.
 * @param {number} idRole - El ID del rol.
 * @param {Array<object>} rolePrivileges - Array de objetos {idPermission, idPrivilege}. Un array vacío eliminará todas las asignaciones.
 * @returns {Promise<{success: boolean, message: string}>} - Objeto indicando éxito.
 * @throws {Error} - Si el rol no se encuentra, si los datos son inválidos, o si falla la BD.
 */
const assignPrivilegesToRole = async (idRole, rolePrivileges) => {
    // Validar formato básico del array (más validaciones están en el middleware)
    if (!Array.isArray(rolePrivileges)) {
        throw new Error("Se esperaba un array para 'rolePrivileges'.");
    }

    const t = await sequelize.transaction(); // Iniciar transacción
    try {
        // 1. Validar que el rol existe (dentro de la transacción es opcional, pero bueno hacerlo antes)
        await getRoleById(idRole);

        // 2. Eliminar las asignaciones existentes para este rol (usando el repositorio y la transacción)
        await rolePrivilegesRepository.deleteByRoleId(idRole, t);

        // 3. Si se proporcionó un array no vacío, crear las nuevas asignaciones
        if (rolePrivileges.length > 0) {
            // (Opcional) Validar aquí que los IDs son números válidos
            const assignmentsToCreate = rolePrivileges.map(priv => ({
                idRole: parseInt(idRole, 10), // Asegurar que idRole es número
                idPermission: priv.idPermission,
                idPrivilege: priv.idPrivilege,
            }));
            // Usar el repositorio para la creación masiva (pasando la transacción)
            await rolePrivilegesRepository.bulkCreate(assignmentsToCreate, t);
        }

        // 4. Confirmar la transacción
        await t.commit();
        console.log(`Service: Privileges assigned successfully for role ${idRole}.`);
        return { success: true, message: 'Privilegios asignados correctamente.' };

    } catch (error) {
        // 5. Revertir la transacción en caso de error
        await t.rollback();
        console.error(`Service Error in assignPrivilegesToRole for role ${idRole}:`, error);
        // Relanzar el error para que el controlador lo maneje
        throw new Error(`Error al asignar privilegios: ${error.message}`);
    }
};


module.exports = {
    // Métodos originales
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    changeRoleState,
    // Nuevos métodos añadidos
    getRolePrivileges,
    assignPrivilegesToRole,
};