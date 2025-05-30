// services/roleService.js
const roleRepository = require('../repositories/roleRepository');
const rolePrivilegesRepository = require('../repositories/rolePrivilegesRepository');
const db = require('../models'); // Contiene todos los modelos cargados por Sequelize

// console.log("[SERVICE RoleService] Objeto 'db' importado:", db !== undefined);
// console.log("[SERVICE RoleService] db.user (modelo User):", db.user !== undefined ? "Definido" : "UNDEFINED");
// if (db.user) {
//     console.log("[SERVICE RoleService] Keys de db.user:", Object.keys(db.user));
// }

// Acceder a los modelos a través del objeto db exportado por models/index.js
// Los nombres de las propiedades en 'db' deben coincidir con los model.name que definiste (ej. 'user', 'role')
const User = db.user;
const Role = db.role;
const RolePrivilege = db.RolePrivilege; // Asegúrate que el nombre coincida (RolePrivilege o rolePrivilege)
const sequelize = db.sequelize;

// console.log("[SERVICE RoleService] Variable 'User' después de asignación:", User !== undefined ? "Definido" : "UNDEFINED");
// console.log("[SERVICE RoleService] Variable 'Role' después de asignación:", Role !== undefined ? "Definido" : "UNDEFINED");

const LOG_PREFIX_SERVICE = "[SERVICE RoleService]";

const createRole = async (roleData) => {
    console.log(`${LOG_PREFIX_SERVICE} createRole - Datos recibidos:`, JSON.stringify(roleData, null, 2));
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
            const assignmentsToCreateInDb = privilegeAssignments.map(inputAssignment => {
                if (!inputAssignment || typeof inputAssignment.idPrivilege !== 'number') {
                    console.error(`${LOG_PREFIX_SERVICE} createRole - Formato de asignación inválido:`, inputAssignment);
                    throw new Error(`Formato de asignación inválido. Se esperaba idPrivilege como número.`);
                }
                return {
                    idRole: newRole.idRole,
                    idPrivilege: inputAssignment.idPrivilege,
                };
            });
            console.log(`${LOG_PREFIX_SERVICE} createRole - Asignaciones para DB (bulkCreate):`, JSON.stringify(assignmentsToCreateInDb, null, 2));
            // Usar el modelo directamente para bulkCreate si el repositorio no lo expone con transacciones
            // o asegurarse que rolePrivilegesRepository.bulkCreate acepta una transacción
            await RolePrivilege.bulkCreate(assignmentsToCreateInDb, { transaction: t });
            console.log(`${LOG_PREFIX_SERVICE} createRole - Asignaciones de privilegios creadas.`);
        } else {
            console.log(`${LOG_PREFIX_SERVICE} createRole - No se proporcionaron privilegeAssignments o está vacío.`);
        }

        await t.commit();
        console.log(`${LOG_PREFIX_SERVICE} createRole - Transacción commit. Rol ${newRole.idRole} creado.`);

        const roleWithDetails = await Role.findByPk(newRole.idRole, {
            // Aquí podrías incluir los privilegios si tuvieras una asociación directa o a través de RolePrivilege
            // include: [ { model: db.Privilege, as: 'privileges', through: { attributes: [] } } ]
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

const getAllRoles = async () => {
    console.log(`${LOG_PREFIX_SERVICE} getAllRoles - Solicitado.`);
    try {
        // Usar el modelo Role directamente para obtener todos los roles
        // o si roleRepository.getAllRoles ya lo hace, está bien.
        const roles = await Role.findAll({
            order: [['roleName', 'ASC']] // Ejemplo de ordenación
        });
        return roles.map(role => role.toJSON()); // Devolver JSON plano es común para APIs
    } catch (error) {
        console.error(`${LOG_PREFIX_SERVICE} getAllRoles - Error:`, error);
        throw new Error('Error al obtener todos los roles.');
    }
};

const getRoleById = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    const role = await Role.findByPk(idRole, {
        include: [{ // Incluir los privilegios directamente
            model: db.privilege, // Asegúrate que 'db.privilege' es el modelo Privilege
            as: 'privileges', // El alias que definiste en Role.belongsToMany(Privilege, { as: 'privileges', ...})
            attributes: ['idPrivilege', 'privilegeName', 'privilegeKey', 'idPermission'], // Campos que quieres de Privilege
            through: { attributes: [] } // No traer campos de la tabla de unión RolePrivilege
        }]
    });
    if (!role) {
        // Devolver null o lanzar un error es una decisión de diseño.
        // Para API REST, lanzar un error que se traduzca a 404 es común.
        const error = new Error('Rol no encontrado');
        error.statusCode = 404;
        throw error;
    }
    return role.toJSON(); // Devolver JSON plano
};

const updateRole = async (idRoleParam, roleData) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        console.error(`${LOG_PREFIX_SERVICE} updateRole - ID de rol no numérico: '${idRoleParam}'`);
        throw new Error('El ID del rol debe ser un número.');
    }
    console.log(`${LOG_PREFIX_SERVICE} updateRole - Actualizando rol ID: ${idRole} con datos:`, JSON.stringify(roleData, null, 2));

    const roleInstance = await Role.findByPk(idRole);
    if (!roleInstance) {
        const error = new Error('Rol no encontrado.');
        error.statusCode = 404;
        throw error;
    }

    const dataToUpdate = {};
    if (roleData.roleName !== undefined) dataToUpdate.roleName = roleData.roleName;
    if (roleData.status !== undefined) dataToUpdate.status = roleData.status;

    if (Object.keys(dataToUpdate).length === 0 && roleData.privilegeAssignments === undefined) {
        console.warn(`${LOG_PREFIX_SERVICE} updateRole - No hay datos válidos para actualizar para el rol ID: ${idRole}.`);
        throw new Error("No se proporcionaron datos válidos para actualizar (nombre, estado o privilegios).");
    }

    const t = await sequelize.transaction();
    try {
        if (Object.keys(dataToUpdate).length > 0) {
            await roleInstance.update(dataToUpdate, { transaction: t });
            console.log(`${LOG_PREFIX_SERVICE} updateRole - Datos base del rol ID: ${idRole} actualizados.`);
        }

        // Manejo de actualización de privilegios
        if (roleData.privilegeAssignments !== undefined) {
            if (!Array.isArray(roleData.privilegeAssignments)) {
                throw new Error("Se esperaba un array para 'privilegeAssignments'.");
            }
            console.log(`${LOG_PREFIX_SERVICE} updateRole - Actualizando privilegios para Rol ID: ${idRole}`);
            // 1. Eliminar asignaciones existentes
            await RolePrivilege.destroy({ where: { idRole: idRole }, transaction: t });

            // 2. Crear nuevas asignaciones si hay alguna
            if (roleData.privilegeAssignments.length > 0) {
                const assignmentsToCreateInDb = roleData.privilegeAssignments.map(inputAssignment => {
                    if (!inputAssignment || typeof inputAssignment.idPrivilege !== 'number') {
                        console.error(`${LOG_PREFIX_SERVICE} updateRole - Formato de asignación inválido:`, inputAssignment);
                        throw new Error(`Formato de asignación inválido. Se esperaba idPrivilege como número.`);
                    }
                    return {
                        idRole: idRole,
                        idPrivilege: inputAssignment.idPrivilege,
                    };
                });
                await RolePrivilege.bulkCreate(assignmentsToCreateInDb, { transaction: t });
                console.log(`${LOG_PREFIX_SERVICE} updateRole - Nuevas asignaciones de privilegios creadas para Rol ID: ${idRole}`);
            } else {
                console.log(`${LOG_PREFIX_SERVICE} updateRole - No hay nuevos privilegios para asignar a Rol ID: ${idRole} (lista vacía).`);
            }
        }

        await t.commit();
        console.log(`${LOG_PREFIX_SERVICE} updateRole - Transacción commit para rol ID: ${idRole}`);
        
        // Devolver el rol actualizado con sus privilegios
        return getRoleById(idRole);

    } catch (error) {
        await t.rollback();
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
        console.error(`${LOG_PREFIX_SERVICE} deleteRole - ID de rol no numérico: '${idRoleParam}'`);
        const error = new Error('El ID del rol debe ser un número.');
        error.statusCode = 400; // Bad Request
        throw error;
    }
    console.log(`${LOG_PREFIX_SERVICE} deleteRole - Solicitando eliminar Rol ID: ${idRole}`);

    // --- INICIO DE LA COMPROBACIÓN PREVIA DE USUARIOS ---
    if (!User) {
        console.error(`${LOG_PREFIX_SERVICE} deleteRole - Modelo User es UNDEFINED. No se puede verificar si el rol está en uso por usuarios.`);
        // Decide tu política: ¿permitir eliminar si no puedes verificar, o bloquear? Bloquear es más seguro.
        const error = new Error('Error interno: No se pudo verificar si el rol está en uso.');
        error.statusCode = 500;
        throw error;
    }

    const userCount = await User.count({ where: { idRole: idRole } });
    if (userCount > 0) {
        console.warn(`${LOG_PREFIX_SERVICE} deleteRole - Intento de eliminar Rol ID: ${idRole}, pero está asignado a ${userCount} usuario(s).`);
        const error = new Error(`No se puede eliminar el rol (ID: ${idRole}) porque está asignado a ${userCount} usuario(s).`);
        error.statusCode = 409; // Conflict
        throw error;
    }
    console.log(`${LOG_PREFIX_SERVICE} deleteRole - Rol ID: ${idRole} no está asignado a ningún usuario. Procediendo con la eliminación.`);
    // --- FIN DE LA COMPROBACIÓN PREVIA DE USUARIOS ---

    // Validar si el rol existe antes de la transacción (opcional, pero bueno)
    const roleInstance = await Role.findByPk(idRole);
    if (!roleInstance) {
        const error = new Error('Rol no encontrado para eliminar.');
        error.statusCode = 404;
        throw error;
    }

    const transaction = await sequelize.transaction();
    try {
        console.log(`${LOG_PREFIX_SERVICE} deleteRole - Iniciando transacción para Rol ID: ${idRole}`);

        // Paso 1: Eliminar las asignaciones de privilegios del rol (usando el modelo RolePrivilege)
        await RolePrivilege.destroy({
            where: { idRole: idRole },
            transaction: transaction // Corrección: usar 'transaction' en minúscula
        });
        console.log(`${LOG_PREFIX_SERVICE} deleteRole - Asignaciones de RolePrivilege eliminadas para Rol ID: ${idRole}`);

        // Paso 2: Eliminar el rol mismo (usando la instancia del modelo Role)
        await roleInstance.destroy({ transaction: transaction }); // Corrección: usar 'transaction' en minúscula
        console.log(`${LOG_PREFIX_SERVICE} deleteRole - Rol ID: ${idRole} eliminado.`);

        await transaction.commit();
        console.log(`${LOG_PREFIX_SERVICE} deleteRole - Transacción commit para Rol ID: ${idRole}. Eliminación completada.`);
        // Devolver un mensaje de éxito o los datos relevantes.
        return { success: true, message: `Rol ID: ${idRole} eliminado correctamente.` };

    } catch (error) {
        // Asegurarse de que el rollback solo se llama si la transacción está activa
        if (transaction && !transaction.finished && (transaction.finished !== 'commit' && transaction.finished !== 'rollback')) {
            await transaction.rollback();
        }
        console.error(`${LOG_PREFIX_SERVICE} deleteRole - Error transaccional al eliminar Rol ID: ${idRole}`, error);
        // No sobrescribir el statusCode si ya viene del error (ej. ER_LOCK_WAIT_TIMEOUT)
        const errorMessage = (error.parent && error.parent.sqlMessage) ? 
                             `No se pudo eliminar el rol (ID: ${idRole}): ${error.parent.sqlMessage}` :
                             `No se pudo eliminar el rol (ID: ${idRole}): ${error.message}`;
        const finalError = new Error(errorMessage);
        finalError.statusCode = error.statusCode || 500; // Usar el statusCode original si existe
        if (error.parent && error.parent.code === 'ER_LOCK_WAIT_TIMEOUT') { // Específico para el timeout
            finalError.message = `No se pudo eliminar el rol (ID: ${idRole}): La operación en la base de datos tardó demasiado (timeout). Intente nuevamente.`;
        }
        throw finalError;
    }
};

const changeRoleState = async (idRoleParam, newStatus) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    if (typeof newStatus !== 'boolean') {
        throw new Error('El estado debe ser un valor booleano (true/false).');
    }

    console.log(`${LOG_PREFIX_SERVICE} changeRoleState - Solicitado para Rol ID: ${idRole}, Nuevo Estado: ${newStatus}`);

    const roleInstance = await Role.findByPk(idRole);
    if (!roleInstance) {
        console.error(`${LOG_PREFIX_SERVICE} changeRoleState - Rol ID: ${idRole} no encontrado.`);
        const error = new Error('Rol no encontrado.');
        error.statusCode = 404;
        throw error;
    }

    if (roleInstance.idRole === 1 && newStatus === false) { // Asumiendo que 1 es ADMIN_ROLE_ID
        console.warn(`${LOG_PREFIX_SERVICE} changeRoleState - Intento de desactivar Rol Admin ID: ${idRole}. Bloqueado.`);
        const error = new Error('El rol de Administrador no puede ser desactivado.');
        error.statusCode = 403; // Forbidden
        throw error;
    }

    const transaction = await sequelize.transaction();
    try {
        console.log(`${LOG_PREFIX_SERVICE} changeRoleState - Iniciando transacción para Rol ID: ${idRole}`);

        // Paso 1: Actualizar el estado del rol
        await roleInstance.update({ status: newStatus }, { transaction });
        console.log(`${LOG_PREFIX_SERVICE} changeRoleState - Estado del Rol ID: ${idRole} actualizado a ${newStatus}.`);

        // Paso 2: Si el rol se está desactivando (newStatus === false), desactivar usuarios asociados.
        if (newStatus === false) {
            if (!User) {
                console.error(`${LOG_PREFIX_SERVICE} changeRoleState - Modelo User es UNDEFINED. No se pueden desactivar usuarios.`);
                // Considera hacer rollback si esto es crítico
                // await transaction.rollback();
                // throw new Error("Configuración interna incorrecta: Modelo User no disponible para desactivar usuarios.");
            } else {
                console.log(`${LOG_PREFIX_SERVICE} changeRoleState - Rol ID: ${idRole} desactivado. Desactivando usuarios asociados activos...`);
                const [numAffectedUsers] = await User.update(
                    { status: false },
                    {
                        where: {
                            idRole: idRole,
                            status: true
                        },
                        transaction
                    }
                );
                console.log(`${LOG_PREFIX_SERVICE} changeRoleState - ${numAffectedUsers} usuarios asociados al Rol ID: ${idRole} han sido desactivados.`);
            }
        }

        await transaction.commit();
        console.log(`${LOG_PREFIX_SERVICE} changeRoleState - Transacción commit para Rol ID: ${idRole}.`);

        return roleInstance.toJSON(); // Devolver el rol actualizado en formato JSON

    } catch (error) {
        if (transaction && !transaction.finished && (transaction.finished !== 'commit' && transaction.finished !== 'rollback')) {
            await transaction.rollback();
        }
        console.error(`${LOG_PREFIX_SERVICE} changeRoleState - Error transaccional para Rol ID: ${idRole}. Rollback.`, error);
        throw new Error(error.message || `Error al cambiar el estado del rol.`);
    }
};

const getRolePrivileges = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    const role = await Role.findByPk(idRole);
    if (!role) {
        const error = new Error('Rol no encontrado.');
        error.statusCode = 404;
        throw error;
    }
    // Usar el modelo directamente para obtener los RolePrivilege y luego los Privilege
    const rolePrivileges = await RolePrivilege.findAll({
        where: { idRole: idRole },
        include: [{
            model: db.privilege, // Asegúrate que 'db.privilege' sea el modelo Privilege
            as: 'privilegeDetails', // El alias que definiste en RolePrivilege.belongsTo(Privilege, ...)
            attributes: ['idPrivilege', 'privilegeName', 'privilegeKey', 'idPermission']
        }]
    });

    return rolePrivileges.map(rp => {
        return {
            idRole: rp.idRole,
            idPrivilege: rp.privilegeDetails.idPrivilege,
            privilegeName: rp.privilegeDetails.privilegeName,
            privilegeKey: rp.privilegeDetails.privilegeKey,
            idPermission: rp.privilegeDetails.idPermission,
            // Puedes añadir más detalles del permiso si haces otro include para db.permission en db.privilege
        };
    });
};

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
        const role = await Role.findByPk(idRole);
        if (!role) {
            const error = new Error('Rol no encontrado.');
            error.statusCode = 404;
            throw error;
        }

        // Eliminar todas las asignaciones existentes para este rol
        await RolePrivilege.destroy({ where: { idRole: idRole }, transaction: t });
        console.log(`${LOG_PREFIX_SERVICE} assignPrivilegesToRole - Asignaciones de privilegios existentes eliminadas para Rol ID: ${idRole}.`);

        if (rolePrivilegesInput.length > 0) {
            // Validar que los privilegios existen (esto debería hacerse en una capa de validación antes o aquí)
            // Aquí asumimos que los idPrivilege son válidos por simplicidad del ejemplo.
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
            await RolePrivilege.bulkCreate(assignmentsToCreateInDb, { transaction: t });
            console.log(`${LOG_PREFIX_SERVICE} assignPrivilegesToRole - Nuevas asignaciones de privilegios creadas para Rol ID: ${idRole}.`);
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

const getRoleEffectivePermissions = async (idRoleParam) => {
    const idRole = parseInt(idRoleParam, 10);
    if (isNaN(idRole)) {
        throw new Error('El ID del rol debe ser un número.');
    }
    const role = await Role.findByPk(idRole);
    if (!role) {
        const error = new Error('Rol no encontrado.');
        error.statusCode = 404;
        throw error;
    }

    // Obtener todos los RolePrivilege para el rol, incluyendo los detalles del Privilegio y del Permiso asociado al Privilegio
    const rolePrivs = await RolePrivilege.findAll({
        where: { idRole: idRole },
        include: [{
            model: db.privilege, // Asumo que 'db.privilege' es el modelo Privilege
            as: 'privilegeDetails', // Alias de la asociación RolePrivilege -> Privilege
            required: true,
            include: [{
                model: db.permission, // Asumo que 'db.permission' es el modelo Permission
                as: 'permission',     // Alias de la asociación Privilege -> Permission
                required: true,
                attributes: ['permissionKey'] // Solo necesitamos la permissionKey
            }],
            attributes: ['privilegeKey'] // Solo necesitamos la privilegeKey
        }]
    });

    const effectivePermissions = {};
    rolePrivs.forEach(rp => {
        const permKey = rp.privilegeDetails.permission.permissionKey;
        const privKey = rp.privilegeDetails.privilegeKey;
        if (!effectivePermissions[permKey]) {
            effectivePermissions[permKey] = [];
        }
        if (!effectivePermissions[permKey].includes(privKey)) {
            effectivePermissions[permKey].push(privKey);
        }
    });
    return effectivePermissions;
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