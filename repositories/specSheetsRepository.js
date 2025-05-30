const db = require("../models");
const { SpecSheet, Product, Supply, SpecSheetSupply, SpecSheetProcess, Process } = db;

const createSpecSheet = async (specSheetData, options = {}) => {
  try {
    const { idSpecSheet, ...dataToCreate } = specSheetData; // Excluir idSpecSheet si se envía por error
    if (!dataToCreate.idProduct) {
      throw new Error("Repositorio: idProduct es requerido para crear una ficha técnica.");
    }
    // Si SpecSheet tiene unitOfMeasure y es requerido:
    if (dataToCreate.unitOfMeasure === undefined || dataToCreate.unitOfMeasure === null || dataToCreate.unitOfMeasure === '') {
       // throw new Error("Repositorio: unitOfMeasure es requerido para la ficha técnica."); // Descomentar si es obligatorio
    }

    const result = await SpecSheet.create(dataToCreate, options); // options debe incluir transaction si aplica
    return result;
  } catch (error) {
    console.error("Repositorio[SpecSheet]: Error al crear SpecSheet:", error.message, error.errors || '');
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((e) => `Campo '${e.path}': ${e.message} (valor: ${e.value})`).join("; ");
      throw new Error(`Validación fallida en SpecSheet: ${messages}`);
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw new Error(`Error de clave foránea: ${error.fields ? error.fields.join(', ') : ''} no es válido. Detalles: ${error.parent?.detail || error.message}`);
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error(`Error de restricción única: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

const getAllSpecSheets = async (filters = {}) => {
  const whereClause = {};
  if (filters.status !== undefined) whereClause.status = filters.status;
  if (filters.idProduct) whereClause.idProduct = filters.idProduct;

  return SpecSheet.findAll({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["idProduct", "productName", "status" /*, "unitOfMeasure" // Descomentar si Product tiene unitOfMeasure y lo quieres aquí */]
      },
    ],
    order: [['updatedAt', 'DESC'], ['idSpecSheet', 'DESC']]
  });
};

const getSpecSheetById = async (idSpecSheet) => {
  const id = parseInt(idSpecSheet);
  if (isNaN(id) || id <= 0) throw new Error("ID de Ficha Técnica inválido.");
  try {
    const sheet = await SpecSheet.findByPk(id, {
      include: [
        {
          model: Product,
          as: "product",
          // Si Product no tiene unitOfMeasure, no lo pidas aquí.
          // Si SpecSheet tiene unitOfMeasure, ya vendrá con los campos de SpecSheet.
          attributes: ["idProduct", "productName", "status"],
        },
        {
          model: SpecSheetSupply,
          as: "specSheetSupplies",
          attributes: ['idSpecSheetSupply', 'quantity', 'unitOfMeasure', 'notes'],
          include: [
            {
              model: Supply,
              as: "supply",
              attributes: ['idSupply', 'supplyName', 'unitOfMeasure']
            }
          ],
          order: [['createdAt', 'ASC']]
        },
        {
          model: SpecSheetProcess,
          as: "specSheetProcesses",
          attributes: ['idSpecSheetProcess', 'processOrder', 'processNameOverride', 'processDescriptionOverride', 'estimatedTimeMinutes'],
          include: [
            {
              model: Process,
              as: 'masterProcessData',
              attributes: ['idProcess', 'processName']
            }
          ],
          order: [['processOrder', 'ASC']]
        }
      ]
    });
    return sheet;
  } catch (error) {
    console.error(`Repositorio[SpecSheet]: Error al obtener ficha por ID ${idSpecSheet}:`, error.message);
    throw error;
  }
};

const updateSpecSheet = async (idSpecSheet, specSheetData, options = {}) => {
  const id = parseInt(idSpecSheet);
  if (isNaN(id) || id <= 0) throw new Error("ID de Ficha Técnica inválido para actualizar.");

  const updateOptions = {
    where: { idSpecSheet: id },
    ...options // Propaga la transacción y otras opciones
  };
  
  const [affectedRows] = await SpecSheet.update(specSheetData, updateOptions);
  return affectedRows;
};

const deleteSpecSheet = async (idSpecSheet, options = {}) => {
  const id = parseInt(idSpecSheet);
  if (isNaN(id) || id <= 0) throw new Error("ID de Ficha Técnica inválido para eliminar.");

  const deleteOptions = {
    where: { idSpecSheet: id },
    ...options
  };
  return SpecSheet.destroy(deleteOptions);
};

// Esta función ya no es necesaria si el servicio usa updateSpecSheet para todo.
// Se puede eliminar o mantener si se prevé un uso muy específico.
/*
const changeStatusInRepo = async (idSpecSheet, status, endDate, options = {}) => {
    const id = parseInt(idSpecSheet);
    if (isNaN(id) || id <= 0) throw new Error("ID de Ficha inválida para cambiar estado.");
    if (typeof status !== 'boolean') throw new Error("El estado debe ser booleano.");
    const dataToUpdate = { status };
    if (endDate !== undefined) dataToUpdate.endDate = endDate;
    const updateOptions = { where: { idSpecSheet: id }, ...options };
    const [affectedRows] = await SpecSheet.update(dataToUpdate, updateOptions);
    return affectedRows;
};
*/

const getSpecSheetsByProduct = async (idProductParam) => {
  const idProduct = parseInt(idProductParam);
  if (isNaN(idProduct) || idProduct <= 0) throw new Error("ID de Producto inválido.");
  try {
    return SpecSheet.findAll({
      where: { idProduct },
      include: [
        {
          model: Product,
          as: "product",
          // Si Product no tiene unitOfMeasure, no lo pidas.
          // Si SpecSheet tiene su propio unitOfMeasure, ya vendrá con los campos de SpecSheet.
          attributes: ["idProduct", "productName", "status"],
        },
        {
          model: SpecSheetSupply,
          as: "specSheetSupplies",
          attributes: ['idSpecSheetSupply', 'quantity', 'unitOfMeasure', 'notes'],
          include: [
            {
              model: Supply,
              as: "supply",
              attributes: ['idSupply', 'supplyName', 'unitOfMeasure']
            }
          ]
        },
        {
          model: SpecSheetProcess,
          as: "specSheetProcesses",
          attributes: ['idSpecSheetProcess', 'processOrder', 'processNameOverride', 'processDescriptionOverride', 'estimatedTimeMinutes'],
          include: [
            {
              model: Process,
              as: 'masterProcessData',
              attributes: ['idProcess', 'processName']
            }
          ],
          order: [['processOrder', 'ASC']]
        }
      ],
      order: [["status", "DESC"], ["dateEffective", "DESC"], ["idSpecSheet", "DESC"]],
    });
  } catch (error) {
    console.error(`Repositorio[SpecSheet]: Error en getSpecSheetsByProduct para producto ID ${idProduct}:`, error.message);
    throw error;
  }
};

module.exports = {
  createSpecSheet,
  getAllSpecSheets,
  getSpecSheetById,
  updateSpecSheet,
  deleteSpecSheet,
  // changeStatusInRepo, // Comentado/eliminado si el servicio no la usa
  getSpecSheetsByProduct,
};