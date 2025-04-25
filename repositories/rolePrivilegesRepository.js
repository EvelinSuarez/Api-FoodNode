// Copia y pega ESTE CÓDIGO COMPLETO en tu archivo:
// C:\Users\daniela\Documents\Api-FoodNode\repositories\rolePrivilegesRepository.js

// Asegúrate de importar AMBOS modelos necesarios
const { RolePrivilege, Privilege } = require("../models"); // <-- IMPORTANTE: Importa Privilege

/**
 * Encuentra todas las asignaciones de privilegios para un rol específico,
 * incluyendo la información del privilegio asociado. // <-- Descripción actualizada
 * @param {number} idRole - El ID del rol.
 * @returns {Promise<Array<RolePrivilege>>} - Array de instancias de RolePrivilege con Privilege incluido.
 */
const findByRoleId = async (idRole) => {
  console.log(`🔍 Buscando privilegios en Repo para Rol ID: ${idRole}`); // Log para depuración
  try {
     const roleIdInt = parseInt(idRole, 10);
     if (isNaN(roleIdInt)) {
         console.error(`❌ ID de rol inválido en findByRoleId: ${idRole}`);
         throw new Error("ID de rol inválido proporcionado a findByRoleId.");
     }
     // Guarda el resultado para loguearlo antes de devolverlo
     const privilegesFound = await RolePrivilege.findAll({
        where: { idRole: roleIdInt },
        // NO limites los attributes de RolePrivilege aquí si quieres usar include correctamente
        include: [{ // <-- ESTA es la parte CLAVE que faltaba/estaba mal
            model: Privilege,                   // Indica qué modelo incluir
            as: 'privilege',                  // USA EL ALIAS CORRECTO DE TU ASOCIACIÓN (¡VERIFÍCALO!)
            attributes: ['privilegeName']       // Qué atributos traer del modelo Privilege
        }],
        // NO uses raw: true cuando trabajas con includes para objetos anidados
     });
     console.log(` P Resultado de Repo.findByRoleId: ${JSON.stringify(privilegesFound, null, 2)}`); // Log detallado del resultado
     return privilegesFound;
  } catch(error) {
      console.error(`❌ Repository Error en findByRoleId for role ${idRole}:`, error);
      throw error; // Propaga el error
  }
};

/**
 * Elimina todas las asignaciones de privilegios para un rol específico.
 * (Esta función parece estar bien, la dejamos como estaba)
 * @param {number} idRole - El ID del rol cuyas asignaciones se eliminarán.
 * @param {object} [transaction=null] - Un objeto de transacción Sequelize opcional.
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
     return RolePrivilege.destroy(options);
  } catch(error) {
      console.error(`Repository Error in deleteByRoleId for role ${idRole}:`, error);
      throw error;
  }
};

/**
 * Crea múltiples asignaciones de privilegios a roles de forma masiva.
 * (Esta función parece estar bien, la dejamos como estaba)
 * @param {Array<object>} assignments - Un array de objetos, cada uno con { idRole, idPermission, idPrivilege }.
 * @param {object} [transaction=null] - Un objeto de transacción Sequelize opcional.
 * @returns {Promise<Array<RolePrivilege>>} - Un array con las instancias de RolePrivileges creadas.
 */
const bulkCreate = async (assignments, transaction = null) => {
  if (!Array.isArray(assignments)) {
    throw new Error("Se esperaba un array para 'assignments' en bulkCreate.");
  }
  if (assignments.length === 0) { return []; }
  const isValidStructure = assignments.every(a =>
      typeof a === 'object' && a !== null &&
      a.idRole !== undefined && a.idPermission !== undefined && a.idPrivilege !== undefined
  );
   if (!isValidStructure) {
       throw new Error("Estructura inválida en 'assignments'. Se esperan objetos con idRole, idPermission, idPrivilege.");
   }
  try {
     const options = { ignoreDuplicates: false };
     if (transaction) { options.transaction = transaction; }
     return RolePrivilege.bulkCreate(assignments, options);
  } catch (error) {
      console.error("Repository Error in bulkCreate:", error);
      throw error;
  }
};


// Exporta las funciones necesarias
module.exports = {
  findByRoleId, // La función corregida
  deleteByRoleId,
  bulkCreate,
};