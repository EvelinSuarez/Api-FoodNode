/**
 * Repositorio para la tabla de unión SpecSheetSupply.
 * Gestiona todas las interacciones con la base de datos para la relación
 * entre Fichas Técnicas (SpecSheet) e Insumos (Supply).
 */

// Importaciones de los modelos y la instancia de sequelize
const db = require("../models");
const { SpecSheetSupply, SpecSheet, Supply } = db;

/**
 * Crea un nuevo registro de insumo en una ficha técnica.
 * @param {object} data - Datos para el nuevo registro (idSpecSheet, idSupply, quantity, etc.).
 * @param {object} transaction - La transacción de Sequelize, si existe.
 * @returns {Promise<SpecSheetSupply>} El registro creado.
 */
const create = async (data, transaction = null) => {
  try {
    return await SpecSheetSupply.create(data, { transaction });
  } catch (error) {
    // Manejo de errores específicos para una mejor retroalimentación
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new db.exports.BadRequestError("Este insumo ya ha sido añadido a esta ficha técnica.");
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      throw new db.exports.BadRequestError(`Error de referencia: idSpecSheet o idSupply no es válido.`);
    }
    console.error("Repo[SpecSheetSupply]: Error al crear:", error);
    throw error; // Re-lanza el error para que el servicio lo maneje
  }
};

/**
 * Busca un registro de SpecSheetSupply por su clave primaria.
 * @param {number} idSpecSheetSupply - El ID del registro.
 * @returns {Promise<SpecSheetSupply|null>} El registro encontrado o null.
 */
const findById = async (idSpecSheetSupply) => {
  return SpecSheetSupply.findByPk(parseInt(idSpecSheetSupply), {
    include: [
      { model: SpecSheet, as: "specSheet", attributes: ['idSpecSheet', 'specSheetCode', 'status'] },
      { model: Supply, as: "supply", attributes: ['idSupply', 'supplyName', 'unitOfMeasure'] },
    ],
  });
};

/**
 * Actualiza un registro de SpecSheetSupply.
 * @param {number} idSpecSheetSupply - El ID del registro a actualizar.
 * @param {object} dataToUpdate - Los datos a actualizar.
 * @param {object} transaction - La transacción de Sequelize, si existe.
 * @returns {Promise<Array<number>>} Un array con el número de filas afectadas.
 */
const update = async (idSpecSheetSupply, dataToUpdate, transaction = null) => {
  try {
    const [affectedRows] = await SpecSheetSupply.update(dataToUpdate, {
      where: { idSpecSheetSupply: parseInt(idSpecSheetSupply) },
      transaction
    });
    return [affectedRows];
  } catch (error) {
    console.error("Repo[SpecSheetSupply]: Error al actualizar:", error);
    throw error;
  }
};

/**
 * Elimina un registro de SpecSheetSupply por su ID.
 * @param {number} idSpecSheetSupply - El ID del registro a eliminar.
 * @param {object} transaction - La transacción de Sequelize, si existe.
 * @returns {Promise<number>} El número de filas eliminadas.
 */
const destroy = async (idSpecSheetSupply, transaction = null) => {
  try {
    return await SpecSheetSupply.destroy({
      where: { idSpecSheetSupply: parseInt(idSpecSheetSupply) },
      transaction
    });
  } catch (error) {
    console.error("Repo[SpecSheetSupply]: Error al eliminar:", error);
    throw error;
  }
};

/**
 * Busca todos los insumos asociados a una ficha técnica.
 * @param {number} idSpecSheet - El ID de la ficha técnica.
 * @returns {Promise<Array<SpecSheetSupply>>} Una lista de insumos de la ficha.
 */
const findAllBySpecSheetId = async (idSpecSheet) => {
  return SpecSheetSupply.findAll({
    where: { idSpecSheet: parseInt(idSpecSheet) },
    include: [
      { model: Supply, as: "supply", attributes: ['idSupply', 'supplyName', 'unitOfMeasure', 'cost'] },
    ],
    order: [['createdAt', 'ASC']]
  });
};

/**
 * Busca todas las fichas técnicas que utilizan un insumo específico.
 * @param {number} idSupply - El ID del insumo.
 * @returns {Promise<Array<SpecSheetSupply>>} Una lista de fichas que usan el insumo.
 */
const findAllBySupplyId = async (idSupply) => {
  return SpecSheetSupply.findAll({
    where: { idSupply: parseInt(idSupply) },
    include: [
      { model: SpecSheet, as: "specSheet", attributes: ['idSpecSheet', 'specSheetCode', 'productNameSnapshot', 'status'] },
    ],
  });
};

/**
 * Crea múltiples registros de insumos para una ficha en una sola operación (bulk).
 * @param {Array<object>} items - Un array de objetos con los datos de los insumos.
 * @param {object} options - Opciones adicionales para bulkCreate, como la transacción.
 * @returns {Promise<Array<SpecSheetSupply>>} Los registros creados.
 */
const bulkCreate = async (items, options = {}) => {
  try {
    if (!items || items.length === 0) return [];
    
    // Asegura que las opciones de transacción se pasen correctamente
    const bulkCreateOptions = {
      validate: true,
      ...options
    };

    return await SpecSheetSupply.bulkCreate(items, bulkCreateOptions);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map(e => `Campo '${e.path}': ${e.message} (valor: ${e.value})`).join("; ");
      throw new db.exports.BadRequestError(`Validación fallida en insumos de ficha (bulk): ${messages}`);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
        throw new db.exports.BadRequestError(`Uno o más insumos ya existen en la ficha técnica (bulk).`);
    }
    console.error("Repo[SpecSheetSupply]: Error al crear en bulk:", error);
    throw error;
  }
};

/**
 * ===================================================================
 * ===                FUNCIÓN QUE CAUSABA EL ERROR                 ===
 * ===================================================================
 * Elimina TODOS los registros de insumos asociados a una ficha técnica.
 * Esta función es clave para la lógica de actualización de una ficha completa.
 * @param {number} idSpecSheet - El ID de la ficha técnica cuyos insumos se eliminarán.
 * @param {object} transaction - La transacción de Sequelize, si existe.
 * @returns {Promise<number>} El número de filas eliminadas.
 */
const destroyBySpecSheetId = async (idSpecSheet, transaction = null) => {
    try {
        // CORRECCIÓN APLICADA:
        // La opción 'transaction' debe estar dentro del mismo objeto que la cláusula 'where'.
        // Sequelize espera un único objeto de opciones para este método.
        return await SpecSheetSupply.destroy({
            where: { idSpecSheet: parseInt(idSpecSheet) },
            transaction: transaction 
        });
    } catch (error) {
        // Log de error más descriptivo
        console.error(`Repo[SpecSheetSupply]: Error al eliminar por idSpecSheet ${idSpecSheet}:`, error);
        throw error;
    }
};


// Exportar todas las funciones del repositorio para que puedan ser usadas en los servicios.
module.exports = {
  create,
  findById,
  update,
  destroy,
  findAllBySpecSheetId,
  findAllBySupplyId,
  bulkCreate,
  destroyBySpecSheetId,
};