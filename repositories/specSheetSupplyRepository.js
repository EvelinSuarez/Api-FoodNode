// repositories/specSheetSupplyRepository.js
const db = require("../models");
const { SpecSheetSupply, SpecSheet, Supply, sequelize } = db; // Usar Supply
const { Op } = require('sequelize');

const create = async (data, transaction = null) => {
  try {
    // data: { idSpecSheet, idSupply, quantity, measurementUnit, notes }
    return await SpecSheetSupply.create(data, { transaction });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new db.exports.BadRequestError("Este insumo ya ha sido añadido a esta ficha técnica.");
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      throw new db.exports.BadRequestError(`Error de referencia: idSpecSheet o idSupply no es válido.`);
    }
    console.error("Repo[SpecSheetSupply]: Error al crear:", error);
    throw error;
  }
};

// const findAll = async () => { // Opcional, para el getAllSpecSheetSupplies
//   return SpecSheetSupply.findAll({
//     include: [
//       { model: SpecSheet, as: "specSheetDetails", attributes: ['idSpecSheet', 'specSheetCode'] }, // Ajusta alias
//       { model: Supply, as: "supplyDetails", attributes: ['idSupply', 'supplyName', 'measurementUnit'] }, // Ajusta alias
//     ],
//     order: [['updatedAt', 'DESC']]
//   });
// };

const findById = async (idSpecSheetSupply) => {
  return SpecSheetSupply.findByPk(parseInt(idSpecSheetSupply), {
    include: [
      { model: SpecSheet, as: "specSheet", attributes: ['idSpecSheet', 'specSheetCode', 'status'] }, // Asegúrate que 'specSheet' sea el alias correcto
      { model: Supply, as: "supply", attributes: ['idSupply', 'supplyName', 'measurementUnit'] }, // Asegúrate que 'supply' sea el alias correcto
    ],
  });
};

const update = async (idSpecSheetSupply, dataToUpdate, transaction = null) => {
  // dataToUpdate: { quantity, measurementUnit, notes }
  // idSpecSheet e idSupply no se actualizan aquí.
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

const findAllBySpecSheetId = async (idSpecSheet) => {
  return SpecSheetSupply.findAll({
    where: { idSpecSheet: parseInt(idSpecSheet) },
    include: [
      { model: Supply, as: "supply", attributes: ['idSupply', 'supplyName', 'measurementUnit'/*, 'currentStock' (opcional)*/] },
    ],
    order: [['createdAt', 'ASC']] // O por algún otro criterio relevante
  });
};

const findAllBySupplyId = async (idSupply) => {
  return SpecSheetSupply.findAll({
    where: { idSupply: parseInt(idSupply) },
    include: [
      { model: SpecSheet, as: "specSheet", attributes: ['idSpecSheet', 'specSheetCode', 'productNameSnapshot', 'status'] },
    ],
  });
};

// Funciones para bulk operations usadas por specSheetsService
const bulkCreate = async (items, options = {}) => { // Cambiado: transaction = null  ->  options = {}
  try {
    if (!items || items.length === 0) return [];
    // Asegurarse de que 'validate: true' se combine con las opciones existentes
    const bulkCreateOptions = {
      validate: true,
      ...options // Propaga todas las opciones pasadas, incluyendo 'transaction'
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

const destroyBySpecSheetId = async (idSpecSheet, transaction = null) => {
    try {
        return await SpecSheetSupply.destroy({
            where: { idSpecSheet: parseInt(idSpecSheet) },
            transaction
        });
    } catch (error) {
        console.error(`Repo[SpecSheetSupply]: Error al eliminar por idSpecSheet ${idSpecSheet}:`, error);
        throw error;
    }
};

module.exports = {
  create,
  // findAll, // Opcional
  findById,
  update,
  destroy,
  findAllBySpecSheetId,
  findAllBySupplyId,
  bulkCreate,
  destroyBySpecSheetId,
};