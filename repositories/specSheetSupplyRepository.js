// repositories/specSheetSupplyRepository.js
const db = require("../models");
const { SpecSheetSupply, SpecSheet, Supply, sequelize } = db;
const { Op } = require('sequelize');

const create = async (data, transaction = null) => {
  try {
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

const findById = async (idSpecSheetSupply) => {
  return SpecSheetSupply.findByPk(parseInt(idSpecSheetSupply), {
    include: [
      { model: SpecSheet, as: "specSheet", attributes: ['idSpecSheet', 'specSheetCode', 'status'] },
      { model: Supply, as: "supply", attributes: ['idSupply', 'supplyName', 'unitOfMeasure'] },
    ],
  });
};

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
      { model: Supply, as: "supply", attributes: ['idSupply', 'supplyName', 'unitOfMeasure'] },
    ],
    order: [['createdAt', 'ASC']]
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

const bulkCreate = async (items, options = {}) => {
  try {
    if (!items || items.length === 0) return [];
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

// ===================================================================
// ===                FUNCIÓN CORREGIDA AQUÍ                     ===
// ===================================================================
const destroyBySpecSheetId = async (idSpecSheet, transaction = null) => {
    try {
        // La transacción debe ser una propiedad DENTRO del objeto de opciones.
        return await SpecSheetSupply.destroy({
            where: { idSpecSheet: parseInt(idSpecSheet) },
            transaction: transaction // <-- LA CORRECCIÓN
        });
    } catch (error) {
        console.error(`Repo[SpecSheetSupply]: Error al eliminar por idSpecSheet ${idSpecSheet}:`, error);
        throw error;
    }
};

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