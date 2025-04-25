// repositories/roleRepository.js
// --- CORREGIDO: Importar directamente el modelo ---
const Role = require('../models/role'); // Quita las llaves {}

/**
 * Crea un nuevo rol en la base de datos.
 * @param {object} roleData - Datos del rol a crear (ej: { roleName, status }).
 * @param {object} [options={}] - Opciones adicionales de Sequelize (ej: { transaction: t }).
 * @returns {Promise<Role>} - La instancia del rol creado.
 */
const createRole = async (roleData, options = {}) => {
    // Asegurarse de que solo se pasen los campos relevantes de Role
    const dataToCreate = {
        roleName: roleData.roleName,
        status: roleData.status !== undefined ? roleData.status : true // Default a true si no se especifica
    };
    // Ahora 'Role' debería ser la clase/función del modelo y .create() funcionará
    return Role.create(dataToCreate, options);
};

/**
 * Obtiene todos los roles de la base de datos.
 * @returns {Promise<Array<Role>>} - Un array con todas las instancias de roles.
 */
const getAllRoles = async () => {
    try {
        // Ahora 'Role' debería ser la clase/función del modelo y .findAll() funcionará
        const roles = await Role.findAll();
        return roles;
    } catch (error) {
        console.error("Repository Error in getAllRoles:", error);
        throw error; // Propagar el error para que el servicio lo maneje
    }
};

/**
 * Obtiene un rol específico por su ID.
 * @param {number} idRole - El ID del rol a buscar.
 * @returns {Promise<Role|null>} - La instancia del rol encontrado o null si no existe.
 */
const getRoleById = async (idRole) => {
    // Ahora 'Role' debería ser la clase/función del modelo y .findByPk() funcionará
    return Role.findByPk(idRole);
};

/**
 * Actualiza los datos de un rol existente (solo nombre y estado).
 * @param {number} idRole - El ID del rol a actualizar.
 * * @param {object} roleData - Datos a actualizar (ej: { roleName, status }).
 * @returns {Promise<Array<number>>} - Un array con el número de filas afectadas (debería ser [1] en éxito).
 */
const updateRole = async (idRole, roleData) => {
    const dataToUpdate = {};
    if (roleData.roleName !== undefined) dataToUpdate.roleName = roleData.roleName;
    if (roleData.status !== undefined) dataToUpdate.status = roleData.status;
    if (Object.keys(dataToUpdate).length === 0) {
         console.warn(`Repository: updateRole called for ID ${idRole} with no valid data to update.`);
         return [0];
     }
    // Ahora 'Role' debería ser la clase/función del modelo y .update() funcionará
    return Role.update(dataToUpdate, { where: { idRole } });
};

/**
 * Elimina un rol de la base de datos por su ID.
 * @param {number} idRole - El ID del rol a eliminar.
 * @returns {Promise<number>} - El número de filas eliminadas (debería ser 1 en éxito).
 */
const deleteRole = async (idRole) => {
    // Ahora 'Role' debería ser la clase/función del modelo y .destroy() funcionará
    return Role.destroy({ where: { idRole } });
};

/**
 * Actualiza únicamente el estado (status) de un rol.
 * @param {number} idRole - El ID del rol cuyo estado se cambiará.
 * @param {boolean} status - El nuevo estado (true o false).
 * @returns {Promise<Array<number>>} - Un array con el número de filas afectadas.
 */
const changeRoleState = async (idRole, status) => {
     if (typeof status !== 'boolean') {
         throw new Error("El estado proporcionado debe ser un valor booleano.");
     }
     // Ahora 'Role' debería ser la clase/función del modelo y .update() funcionará
    return Role.update({ status }, { where: { idRole } });
};

// --- El module.exports sigue igual ---
module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    changeRoleState,
};