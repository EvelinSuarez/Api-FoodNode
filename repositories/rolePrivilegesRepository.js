// Copia y pega ESTE CÓDIGO COMPLETO en tu archivo:
// C:\Users\daniela\Documents\Api-FoodNode\repositories\rolePrivilegesRepository.js

// Asegúrate de importar TODOS los modelos necesarios
const { RolePrivilege, Privilege, Permission } = require("../models"); // Asegúrate de que los nombres coincidan con los definidos en tu modelo

/**
 * Encuentra todas las asignaciones de privilegios para un rol específico,
 * incluyendo la información del módulo (Permission) y del privilegio (Privilege) asociados.
 * Devuelve un array de objetos con las claves string del módulo y del privilegio.
 * @param {number | string} idRole - El ID del rol.
 * @returns {Promise<Array<object>>} - Un array de objetos planos, cada uno con { modulo: 'permissionKeyValue', privilegio: 'privilegeKeyValue' }.
 */
const findStructuredPermissionsByRoleId = async (idRole) => {
  console.log(`[Repo] Buscando permisos estructurados para Rol ID: ${idRole}`);
  try {
     const roleIdInt = parseInt(idRole, 10);
     if (isNaN(roleIdInt)) {
         console.error(`[Repo] ID de rol inválido: ${idRole}`);
         throw new Error("ID de rol inválido.");
     }

     // Realiza la consulta a RolePrivilege incluyendo Permission y Privilege
     const results = await RolePrivilege.findAll({
        where: { idRole: roleIdInt },
        include: [
            {
                model: Permission,
                as: 'permission',                // ¡Verifica alias en tu asociación RolePrivilege <-> Permission!
                // --- USA EL NOMBRE REAL DE LA COLUMNA ---
                attributes: ['permissionKey'],     // <-- Columna de la tabla permissions
                required: true
            },
            {
                model: Privilege,
                as: 'privilege',                 // ¡Verifica alias en tu asociación RolePrivilege <-> Privilege!
                // --- USA EL NOMBRE REAL DE LA COLUMNA ---
                attributes: ['privilegeKey'],      // <-- Columna de la tabla privileges
                required: true
            }
        ],
        raw: true, // Devuelve objetos planos JS
        nest: true // Anida correctamente los resultados de los includes
     });

     console.log(`[Repo] Resultados crudos de BD para Rol ID ${roleIdInt}:`, results);
     // `results` ahora será un array como:
     // [
     //   { permission: { permissionKey: 'usuarios' }, privilege: { privilegeKey: 'view' } },
     //   { permission: { permissionKey: 'usuarios' }, privilege: { privilegeKey: 'create' } },
     //   ...
     // ]

     // --- Mapea usando los nombres de columna CORRECTOS ---
     const structuredPermissions = results.map(entry => {
         // --- Usa los mismos nombres de columna reales aquí ---
         const moduleKey = entry.permission?.permissionKey;   // <-- Accede usando el nombre de columna correcto
         const privilegeKey = entry.privilege?.privilegeKey; // <-- Accede usando el nombre de columna correcto

         if (!moduleKey || !privilegeKey) {
             console.warn(`[Repo] Entrada incompleta encontrada: ${JSON.stringify(entry)}`);
             return null; // Marcar para filtrar luego
         }
         // Devuelve el objeto en el formato esperado por authService
         return {
             modulo: moduleKey,
             privilegio: privilegeKey
         };
     }).filter(Boolean); // Filtra cualquier entrada nula por datos incompletos

     console.log(`[Repo] Permisos estructurados mapeados para Rol ID ${roleIdInt}:`, structuredPermissions);
     return structuredPermissions; // Devuelve el array mapeado: [{ modulo: 'usuarios', privilegio: 'view' }, ...]

  } catch(error) {
      console.error(`[Repo] Error en findStructuredPermissionsByRoleId para rol ${idRole}:`, error);
      throw error; // Propaga el error
  }
};

// --- (Las funciones deleteByRoleId y bulkCreate permanecen igual) ---
const deleteByRoleId = async (idRole, transaction = null) => {
    try {
        const roleIdInt = parseInt(idRole, 10);
        if (isNaN(roleIdInt)) { throw new Error("ID de rol inválido proporcionado a deleteByRoleId."); }
        const options = { where: { idRole: roleIdInt } };
        if (transaction) { options.transaction = transaction; }
        return RolePrivilege.destroy(options);
    } catch (error) {
        console.error(`Repository Error in deleteByRoleId for role ${idRole}:`, error);
        throw error;
    }
};
const bulkCreate = async (assignments, transaction = null) => {
    if (!Array.isArray(assignments)) { throw new Error("Se esperaba un array para 'assignments' en bulkCreate."); }
    if (assignments.length === 0) { return []; }
    const isValidStructure = assignments.every(a => typeof a === 'object' && a !== null && a.idRole !== undefined && a.idPermission !== undefined && a.idPrivilege !== undefined );
    if (!isValidStructure) { throw new Error("Estructura inválida en 'assignments'. Se esperan objetos con idRole, idPermission, idPrivilege."); }
    try {
        const options = { ignoreDuplicates: false };
        if (transaction) { options.transaction = transaction; }
        return RolePrivilege.bulkCreate(assignments, options);
    } catch (error) {
        console.error("Repository Error in bulkCreate:", error);
        throw error;
    }
};


// --- Exporta la función CORREGIDA ---
module.exports = {
  findStructuredPermissionsByRoleId, // <-- Asegúrate que authService importa este nombre
  deleteByRoleId,
  bulkCreate,
};