// Archivo: repositories/specSheetsRepository.js
// VERSIÓN CORREGIDA Y CONSISTENTE

const db = require("../models");
const { SpecSheet, Product, Supply, SpecSheetSupply, SpecSheetProcess, Process, PurchaseDetail } = db;

// --- Funciones sin cambios, ya estaban correctas ---
const createSpecSheet = async (specSheetData, options = {}) => {
  return SpecSheet.create(specSheetData, options);
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
// --- Fin de funciones sin cambios ---

const getAllSpecSheets = async (filters = {}) => {
  return SpecSheet.findAll({
    include: [{ 
        model: Product, 
        as: "product",
        attributes: ["idProduct", "productName"] // Solo traer lo necesario para una lista
    }],
    order: [['updatedAt', 'DESC']]
  });
};

const getSpecSheetById = async (idSpecSheet) => {
  const id = parseInt(idSpecSheet);
  if (isNaN(id) || id <= 0) {
    throw new Error("Repositorio: ID de Ficha Técnica inválido.");
  }
  
  return SpecSheet.findByPk(id, {
    include: [
      {
        model: Product,
        as: "product",
        // --- CAMBIO: 'profitMargin' eliminado de la consulta ---
        attributes: ["idProduct", "productName", "status", "sellingPrice"], 
      },
      {
        model: SpecSheetSupply,
        as: "specSheetSupplies",
        attributes: ['idSpecSheetSupply', 'quantity', 'unitOfMeasure', 'idPurchaseDetail', 'idSupply'],
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
        attributes: ['idSpecSheetProcess', 'processOrder', 'processNameOverride', 'processDescriptionOverride'],
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
        attributes: ["idProduct", "productName"]
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