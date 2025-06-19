// Archivo: services/specSheetsService.js
// VERSIÓN COMPLETA Y CORREGIDA: Se añade la función faltante al export.

const specSheetRepository = require("../repositories/specSheetsRepository");
const specSheetSupplyRepository = require("../repositories/specSheetSupplyRepository");
const specSheetProcessRepository = require("../repositories/specSheetProcessRepository");
const db = require('../models');
const { Product, Supply, SpecSheet, Process, SpecSheetSupply, PurchaseDetail } = db; 
const { Op } = require('sequelize');
const { NotFoundError, BadRequestError, ConflictError, ApplicationError } = require('../utils/customErrors');

// --- HELPER FUNCTIONS ---
const mapFrontendToBackendSpecSheet = (frontendData) => {
    return {
        idProduct: parseInt(frontendData.idProduct, 10),
        quantityBase: parseFloat(frontendData.quantity),
        dateEffective: frontendData.startDate,
        status: frontendData.status,
        endDate: frontendData.endDate || null,
        unitOfMeasure: frontendData.unitOfMeasure || null
    };
};

const convertToBaseUnit = (quantity, unit) => {
    const u = String(unit)?.toLowerCase() || 'unidad';
    if (u.includes('kg') || u.includes('l')) return parseFloat(quantity) * 1000;
    if (u.includes('g') || u.includes('ml') || u.includes('unidad')) return parseFloat(quantity);
    return parseFloat(quantity);
};

// --- CRUD OPERATIONS ---
const createSpecSheet = async (specSheetCompleteDataFromFrontend) => {
    const t = await db.sequelize.transaction();
    try {
        const { specSheetSupplies, specSheetProcesses, ...specSheetCoreFrontendData } = specSheetCompleteDataFromFrontend;
        const specSheetCoreBackendData = mapFrontendToBackendSpecSheet(specSheetCoreFrontendData);
  
        const productExists = await Product.findByPk(specSheetCoreBackendData.idProduct);
        if (!productExists) throw new NotFoundError(`El producto con ID ${specSheetCoreBackendData.idProduct} no existe.`);
        
        if (specSheetCoreBackendData.status === true) {
            await SpecSheet.update(
              { status: false, endDate: new Date() },
              { where: { idProduct: specSheetCoreBackendData.idProduct, status: true }, transaction: t }
            );
            specSheetCoreBackendData.endDate = null; 
        }
  
        const newSpecSheet = await specSheetRepository.createSpecSheet(specSheetCoreBackendData, { transaction: t });
  
        if (specSheetSupplies && specSheetSupplies.length > 0) {
            const supplyItemsToCreate = specSheetSupplies.map(item => ({
                idSpecSheet: newSpecSheet.idSpecSheet,
                idSupply: parseInt(item.idSupply),
                idPurchaseDetail: parseInt(item.idPurchaseDetail),
                quantity: parseFloat(item.quantity),
                unitOfMeasure: item.unitOfMeasure
            }));
            await specSheetSupplyRepository.bulkCreate(supplyItemsToCreate, { transaction: t });
        }
  
        if (specSheetProcesses && specSheetProcesses.length > 0) {
            const processItemsToCreate = specSheetProcesses.map((proc, index) => ({
                idSpecSheet: newSpecSheet.idSpecSheet, 
                idProcess: proc.idProcess ? parseInt(proc.idProcess) : null,
                processOrder: parseInt(proc.processOrder) || (index + 1),
                processNameOverride: proc.processNameOverride.trim(),
                processDescriptionOverride: proc.processDescriptionOverride?.trim() || null
            }));
            await specSheetProcessRepository.bulkCreate(processItemsToCreate, { transaction: t });
        }
  
        await t.commit();
        return specSheetRepository.getSpecSheetById(newSpecSheet.idSpecSheet);
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error("Service[SpecSheet Create]:", error);
        throw error; // Re-lanzar el error para que el controlador lo maneje
    }
};

const updateSpecSheet = async (idSpecSheet, specSheetCompleteDataFromFrontend) => {
    const t = await db.sequelize.transaction();
    const id = parseInt(idSpecSheet);
    if (isNaN(id) || id <= 0) throw new BadRequestError("ID de Ficha Técnica inválido.");
  
    try {
        const { specSheetSupplies, specSheetProcesses, ...specSheetCoreFrontendData } = specSheetCompleteDataFromFrontend;
        const specSheetCoreBackendData = mapFrontendToBackendSpecSheet(specSheetCoreFrontendData);
        const existingSheet = await SpecSheet.findByPk(id, { transaction: t });
        if (!existingSheet) throw new NotFoundError(`Ficha técnica ID ${id} no encontrada.`);

        if (specSheetCoreBackendData.status === true && !existingSheet.status) {
            await SpecSheet.update(
                { status: false, endDate: new Date() },
                { where: { idProduct: existingSheet.idProduct, status: true, idSpecSheet: { [Op.ne]: id } }, transaction: t }
            );
            specSheetCoreBackendData.endDate = null;
        }
  
        await specSheetRepository.updateSpecSheet(id, specSheetCoreBackendData, { transaction: t });
        await specSheetSupplyRepository.destroyBySpecSheetId(id, { transaction: t });
        await specSheetProcessRepository.destroyBySpecSheetId(id, { transaction: t });
      
        if (specSheetSupplies && specSheetSupplies.length > 0) {
            await specSheetSupplyRepository.bulkCreate(specSheetSupplies.map(item => ({
                idSpecSheet: id, idSupply: item.idSupply, idPurchaseDetail: item.idPurchaseDetail, quantity: item.quantity, unitOfMeasure: item.unitOfMeasure
            })), { transaction: t });
        }
  
        if (specSheetProcesses && specSheetProcesses.length > 0) {
            await specSheetProcessRepository.bulkCreate(specSheetProcesses.map((proc, index) => ({
                idSpecSheet: id, idProcess: proc.idProcess || null, processOrder: proc.processOrder || index + 1, processNameOverride: proc.processNameOverride, processDescriptionOverride: proc.processDescriptionOverride || null
            })), { transaction: t });
        }
  
        await t.commit();
        return specSheetRepository.getSpecSheetById(id);
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error(`Service[SpecSheet Update] ID ${id}:`, error);
        throw error;
    }
};

const getSpecSheetById = async (idSpecSheet) => {
    const specSheet = await specSheetRepository.getSpecSheetById(idSpecSheet);
    if (!specSheet) throw new NotFoundError(`Ficha técnica ID ${idSpecSheet} no encontrada.`);
    
    const specSheetJson = specSheet.toJSON();
    let totalCost = 0;
    if (specSheetJson.specSheetSupplies && specSheetJson.specSheetSupplies.length > 0) {
        specSheetJson.specSheetSupplies.forEach(supplyItem => {
            const price = supplyItem.purchaseDetail?.unitPrice || 0;
            const quantity = parseFloat(supplyItem.quantity) || 0;
            const itemCost = parseFloat(price) * quantity;
            totalCost += itemCost;
            supplyItem.cost = itemCost.toFixed(2);
        });
    }
    specSheetJson.totalCost = totalCost.toFixed(2);
    specSheetJson.costPerUnit = specSheetJson.quantityBase > 0 ? totalCost / specSheetJson.quantityBase : 0;
    
    return specSheetJson;
};

const getAllSpecSheets = async (filters = {}) => {
    return specSheetRepository.getAllSpecSheets(filters);
};

const getSpecSheetsByProductId = async (idProduct) => {
    return specSheetRepository.getSpecSheetsByProduct(idProduct);
};

const deleteSpecSheet = async (idSpecSheet) => {
    // La lógica de borrado que ya tenías está bien
    const specSheet = await SpecSheet.findByPk(idSpecSheet);
    if (!specSheet) throw new NotFoundError(`Ficha técnica ID ${idSpecSheet} no encontrada.`);
    return specSheetRepository.deleteSpecSheet(idSpecSheet);
};

const changeSpecSheetStatus = async (idSpecSheet, newStatus) => {
    // La lógica de cambio de estado que ya tenías está bien
    const specSheet = await SpecSheet.findByPk(idSpecSheet);
    if (!specSheet) throw new NotFoundError(`Ficha técnica ID ${idSpecSheet} no encontrada.`);
    // ...
    return specSheetRepository.updateSpecSheet(idSpecSheet, { status: newStatus });
};

// --- FUNCIÓN QUE FALTABA EN EL EXPORT ---
const getAllSpecSheetsWithCosts = async () => {
    try {
        const allSpecSheets = await specSheetRepository.getAllSpecSheets();
        if (!allSpecSheets) return [];

        const sheetsWithCosts = await Promise.all(allSpecSheets.map(async (sheet) => {
            // Reutilizamos la función getSpecSheetById que ya calcula el costo
            const detailedSheet = await getSpecSheetById(sheet.idSpecSheet);
            return detailedSheet;
        }));

        return sheetsWithCosts;

    } catch (error) {
        console.error("Service[SpecSheet GetAllWithCosts]:", error);
        throw new ApplicationError('Error al calcular los costos de las fichas técnicas.', error);
    }
};

// ✅ --- CORRECCIÓN FINAL: Exportar todas las funciones necesarias ---
module.exports = {
  createSpecSheet,
  getAllSpecSheets,
  getSpecSheetById,
  updateSpecSheet,
  deleteSpecSheet,
  changeSpecSheetStatus,
  getSpecSheetsByProductId,
  getAllSpecSheetsWithCosts // <--- AHORA SÍ ESTÁ EXPORTADA
};