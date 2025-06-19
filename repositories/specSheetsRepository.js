// Archivo: repositories/specSheetsRepository.js
// VERSIÓN CORREGIDA: Se eliminó 'unitOfMeasure' de la consulta del modelo Product.

const db = require("../models");
const { SpecSheet, Product, Supply, SpecSheetSupply, SpecSheetProcess, Process, PurchaseDetail } = db;

// --- Funciones sin cambios ---
const createSpecSheet = async (specSheetData, options = {}) => {
  const result = await SpecSheet.create(specSheetData, options);
  return result;
};

const updateSpecSheet = async (idSpecSheet, specSheetData, options = {}) => {
  const [affectedRows] = await SpecSheet.update(specSheetData, {
    where: { idSpecSheet: parseInt(idSpecSheet) },
    ...options
  });
  return affectedRows;
};

const deleteSpecSheet = async (idSpecSheet, options = {}) => {
  return SpecSheet.destroy({
    where: { idSpecSheet: parseInt(idSpecSheet) },
    ...options
  });
};

const getAllSpecSheets = async (filters = {}) => {
  return SpecSheet.findAll({
    include: [{ model: Product, as: "product" }],
    order: [['updatedAt', 'DESC']]
  });
};
// --- Fin de funciones sin cambios ---

const getSpecSheetById = async (idSpecSheet) => {
  const id = parseInt(idSpecSheet);
  if (isNaN(id) || id <= 0) {
    throw new Error("Repositorio: ID de Ficha Técnica inválido.");
  }
  
  try {
    const sheet = await SpecSheet.findByPk(id, {
      include: [
        {
          model: Product,
          as: "product",
          // ✅ --- CORRECCIÓN FINAL: Se elimina 'unitOfMeasure' ---
          // La tabla 'Products' no tiene esta columna. La unidad ya viene en la ficha.
          attributes: ["idProduct", "productName", "status"], 
        },
        {
          model: SpecSheetSupply,
          as: "specSheetSupplies",
          attributes: ['idSpecSheetSupply', 'quantity', 'unitOfMeasure', 'notes', 'idPurchaseDetail', 'idSupply'],
          include: [
            {
              model: Supply,
              as: "supply",
              attributes: ['idSupply', 'supplyName', 'unitOfMeasure']
            },
            {
              model: PurchaseDetail,
              as: 'purchaseDetail',
              attributes: ['unitPrice']
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
    console.error(`Repositorio[SpecSheet]: Error al obtener ficha por ID ${idSpecSheet}:`, error);
    throw error;
  }
};

const getSpecSheetsByProduct = async (idProductParam) => {
  const idProduct = parseInt(idProductParam);
  if (isNaN(idProduct) || idProduct <= 0) {
    throw new Error("Repositorio: ID de Producto inválido.");
  }
  
  return SpecSheet.findAll({
    where: { idProduct },
    include: [
      { 
        model: Product, 
        as: "product",
        // ✅ --- CORRECCIÓN FINAL (también aquí) ---
        attributes: ["idProduct", "productName", "status"]
      },
      { 
        model: SpecSheetSupply, 
        as: "specSheetSupplies",
        include: [{ model: Supply, as: "supply" }]
      },
      {
        model: SpecSheetProcess,
        as: "specSheetProcesses",
        include: [{ 
          model: Process, 
          as: "masterProcessData" 
        }]
      }
    ],
    order: [["status", "DESC"], ["dateEffective", "DESC"]],
  });
};

module.exports = {
  createSpecSheet,
  getAllSpecSheets,
  getSpecSheetById,
  updateSpecSheet,
  deleteSpecSheet,
  getSpecSheetsByProduct,
};