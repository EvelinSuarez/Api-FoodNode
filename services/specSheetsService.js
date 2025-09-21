// Archivo: services/specSheetsService.js
// --- VERSIÓN FINAL: El costo del producto es IGUAL al costo total de la receta ---

const specSheetRepository = require("../repositories/specSheetsRepository");
const specSheetSupplyRepository = require("../repositories/specSheetSupplyRepository");
const specSheetProcessRepository = require("../repositories/specSheetProcessRepository");
const db = require('../models');
const { Product, SpecSheet } = db; 
const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

// --- HELPER FUNCTIONS ---

const mapFrontendToBackendSpecSheet = (frontendData) => {
    return {
        idProduct: parseInt(frontendData.idProduct, 10),
        quantityBase: parseFloat(frontendData.quantityBase),
        unitOfMeasure: frontendData.unitOfMeasure,
        portions: parseInt(frontendData.portions, 10),
        dateEffective: frontendData.dateEffective,
        endDate: frontendData.endDate || null,
        status: frontendData.status,
    };
};

const convertToBaseUnit = (quantity, unit) => {
    const qty = parseFloat(quantity);
    if (isNaN(qty)) return 0;
    const u = String(unit)?.toLowerCase() || 'g';
    if (u.includes('kg') || u.includes('l')) return qty * 1000;
    if (u.includes('lb')) return qty * 453.592;
    if (u.includes('oz')) return qty * 28.3495;
    if (u.includes('mg')) return qty / 1000;
    return qty;
};

/**
 * Calcula costos, actualiza el costo total de la ficha y el costo del producto.
 * @param {number} specSheetId - El ID de la ficha técnica.
 * @param {object} transaction - La transacción de Sequelize.
 */
const updateProductAndSpecSheetCosts = async (specSheetId, transaction) => {
    // 1. Obtenemos la ficha y sus relaciones dentro de la transacción
    const specSheet = await SpecSheet.findByPk(specSheetId, {
        include: [
            { model: db.Product, as: 'product' },
            {
                model: db.SpecSheetSupply,
                as: 'specSheetSupplies',
                include: [
                    { model: db.Supply, as: 'supply' },
                    { model: db.PurchaseDetail, as: 'purchaseDetail' }
                ]
            }
        ],
        transaction
    });

    if (!specSheet) {
        console.warn(`[CostUpdate] Ficha ${specSheetId} no encontrada.`);
        return;
    }

    // 2. Calculamos el costo total de la receta
    let totalCostOfRecipe = 0;
    if (specSheet.specSheetSupplies && specSheet.specSheetSupplies.length > 0) {
        specSheet.specSheetSupplies.forEach(supplyItem => {
            const price = supplyItem.purchaseDetail?.unitPrice || 0;
            const recipeQty = parseFloat(supplyItem.quantity) || 0;
            const purchaseUnit = supplyItem.supply?.unitOfMeasure;
            const recipeUnit = supplyItem.unitOfMeasure;
            const recipeQtyInBase = convertToBaseUnit(recipeQty, recipeUnit);
            const purchaseUnitInBase = convertToBaseUnit(1, purchaseUnit);
            const costMultiplier = purchaseUnitInBase > 0 ? recipeQtyInBase / purchaseUnitInBase : 0;
            totalCostOfRecipe += parseFloat(price) * costMultiplier;
        });
    }

    // 3. Guardar el costo total en la propia Ficha Técnica
    await SpecSheet.update(
        { totalCost: totalCostOfRecipe.toFixed(2) },
        { where: { idSpecSheet: specSheetId }, transaction }
    );
    console.log(`[CostUpdate] Costo total de la Ficha ID ${specSheetId} actualizado a ${totalCostOfRecipe.toFixed(2)}.`);
    
    // 4. --- CAMBIO CLAVE ---
    // El costo del producto ahora es directamente el costo total de la receta.
    const newProductCost = totalCostOfRecipe;

    // 5. Actualizamos el campo 'sellingPrice' (que representa el costo total) en la tabla 'Products'.
    if (specSheet.product) {
        await Product.update(
            { sellingPrice: newProductCost.toFixed(2) },
            { where: { idProduct: specSheet.idProduct }, transaction }
        );
        console.log(`[CostUpdate] Costo del Producto ID ${specSheet.idProduct} actualizado a ${newProductCost.toFixed(2)}.`);
    }
};


// --- CRUD OPERATIONS ---

const createSpecSheet = async (specSheetData) => {
    const t = await db.sequelize.transaction();
    try {
        const { specSheetSupplies, specSheetProcesses, ...coreData } = specSheetData;
        const mappedData = mapFrontendToBackendSpecSheet(coreData);

        const productExists = await Product.findByPk(mappedData.idProduct, { transaction: t });
        if (!productExists) throw new NotFoundError(`El producto con ID ${mappedData.idProduct} no existe.`);
        
        if (mappedData.status === true) {
            await SpecSheet.update(
              { status: false, endDate: new Date() },
              { where: { idProduct: mappedData.idProduct, status: true }, transaction: t }
            );
            mappedData.endDate = null;
        }
  
        const newSheet = await specSheetRepository.createSpecSheet(mappedData, { transaction: t });
  
        if (specSheetSupplies && specSheetSupplies.length > 0) {
            const supplyItemsToCreate = specSheetSupplies.map(item => ({...item, idSpecSheet: newSheet.idSpecSheet}));
            await specSheetSupplyRepository.bulkCreate(supplyItemsToCreate, { transaction: t });
        }
  
        if (specSheetProcesses && specSheetProcesses.length > 0) {
            const processItemsToCreate = specSheetProcesses.map(proc => ({
                ...proc,
                idProcess: (proc.idProcess && !isNaN(parseInt(proc.idProcess))) ? parseInt(proc.idProcess) : null,
                idSpecSheet: newSheet.idSpecSheet
            }));
            await specSheetProcessRepository.bulkCreate(processItemsToCreate, { transaction: t });
        }
  
        if (newSheet.status === true) {
            await updateProductAndSpecSheetCosts(newSheet.idSpecSheet, t);
        }

        await t.commit();
        return getSpecSheetById(newSheet.idSpecSheet);
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error("Service[CreateSpecSheet]:", error);
        throw error;
    }
};

const updateSpecSheet = async (id, specSheetData) => {
    const t = await db.sequelize.transaction();
    try {
        const { specSheetSupplies, specSheetProcesses, ...coreData } = specSheetData;
        const mappedData = mapFrontendToBackendSpecSheet(coreData);
        
        const existingSheet = await SpecSheet.findByPk(id, { transaction: t });
        if (!existingSheet) {
            throw new NotFoundError(`Ficha técnica ID ${id} no encontrada.`);
        }

        // Lógica para activar/desactivar fichas
        if (mappedData.status === true && !existingSheet.status) {
            await SpecSheet.update(
                { status: false, endDate: new Date() },
                { where: { idProduct: existingSheet.idProduct, status: true, idSpecSheet: { [Op.ne]: id } }, transaction: t }
            );
            mappedData.endDate = null;
        }
  
        // Actualizar los datos principales de la ficha
        await specSheetRepository.updateSpecSheet(id, mappedData, { transaction: t });
        
        // =================================================================
        // ===                 AQUÍ ESTÁ LA CORRECCIÓN                   ===
        // =================================================================
        // Se pasa la transacción 't' directamente como segundo argumento.
        await specSheetSupplyRepository.destroyBySpecSheetId(id, t); // <-- CORRECCIÓN AQUÍ
        await specSheetProcessRepository.destroyBySpecSheetId(id, t); // <-- CORRECCIÓN AQUÍ
      
        // Crear los nuevos insumos
        if (specSheetSupplies && specSheetSupplies.length > 0) {
            const supplyItemsToCreate = specSheetSupplies.map(item => ({...item, idSpecSheet: id}));
            await specSheetSupplyRepository.bulkCreate(supplyItemsToCreate, { transaction: t });
        }
  
        // Crear los nuevos procesos
        if (specSheetProcesses && specSheetProcesses.length > 0) {
            const processItemsToCreate = specSheetProcesses.map(proc => ({
                ...proc,
                idProcess: (proc.idProcess && !isNaN(parseInt(proc.idProcess))) ? parseInt(proc.idProcess) : null,
                idSpecSheet: id
            }));
            await specSheetProcessRepository.bulkCreate(processItemsToCreate, { transaction: t });
        }
  
        // Actualizar costos si la ficha está activa
        if (mappedData.status === true) {
            await updateProductAndSpecSheetCosts(id, t);
        }

        await t.commit();
        return getSpecSheetById(id);
    } catch (error) {
        if (t && !t.finished) {
            await t.rollback();
        }
        console.error(`Service[UpdateSpecSheet] ID ${id}:`, error);
        throw error; // Re-lanzar el error para que el controlador lo maneje
    }
};

const getSpecSheetById = async (idSpecSheet) => {
    const specSheet = await specSheetRepository.getSpecSheetById(idSpecSheet);
    if (!specSheet) throw new NotFoundError(`Ficha técnica ID ${idSpecSheet} no encontrada.`);
    
    const specSheetJson = specSheet.toJSON();
    let calculatedTotalCost = 0;

    if (specSheetJson.specSheetSupplies && specSheetJson.specSheetSupplies.length > 0) {
        specSheetJson.specSheetSupplies.forEach(supplyItem => {
            const price = supplyItem.purchaseDetail?.unitPrice || 0;
            const recipeQty = parseFloat(supplyItem.quantity) || 0;
            const purchaseUnit = supplyItem.supply?.unitOfMeasure;
            const recipeUnit = supplyItem.unitOfMeasure;
            
            const recipeQtyInBase = convertToBaseUnit(recipeQty, recipeUnit);
            const purchaseUnitInBase = convertToBaseUnit(1, purchaseUnit);
            
            const costMultiplier = purchaseUnitInBase > 0 ? recipeQtyInBase / purchaseUnitInBase : 0;
            const itemCost = parseFloat(price) * costMultiplier;
            
            calculatedTotalCost += itemCost;
            supplyItem.cost = itemCost.toFixed(2);
        });
    }
    
    specSheetJson.totalCost = calculatedTotalCost.toFixed(2);
    
    const finalQuantity = parseFloat(specSheetJson.quantityBase);
    const portions = parseInt(specSheetJson.portions, 10);

    specSheetJson.costPerUnit = finalQuantity > 0 ? (calculatedTotalCost / finalQuantity).toFixed(2) : '0.00';
    specSheetJson.costPerPortion = portions > 0 ? (calculatedTotalCost / portions).toFixed(2) : '0.00';
    
    return specSheetJson;
};

const getAllSpecSheets = (filters = {}) => specSheetRepository.getAllSpecSheets(filters);

const getSpecSheetsByProductId = (id) => specSheetRepository.getSpecSheetsByProduct(id);

const deleteSpecSheet = async (id) => {
    const sheet = await SpecSheet.findByPk(id);
    if (!sheet) throw new NotFoundError(`Ficha técnica ID ${id} no encontrada.`);
    return specSheetRepository.deleteSpecSheet(id);
};

const changeSpecSheetStatus = async (id, status) => {
    if (status === undefined) throw new BadRequestError("El estado es requerido.");
    const sheet = await SpecSheet.findByPk(id);
    if (!sheet) throw new NotFoundError(`Ficha técnica ID ${id} no encontrada.`);

    const t = await db.sequelize.transaction();
    try {
        await specSheetRepository.updateSpecSheet(id, { status }, { transaction: t });
        
        if (status === true) {
            await updateProductAndSpecSheetCosts(id, t);
        }
        await t.commit();
    } catch(error) {
        if (t && !t.finished) await t.rollback();
        throw error;
    }
};

const getAllSpecSheetsWithCosts = async () => {
    const allSheets = await specSheetRepository.getAllSpecSheets();
    if (!allSheets || allSheets.length === 0) return [];
    return Promise.all(allSheets.map(sheet => getSpecSheetById(sheet.idSpecSheet)));
};


module.exports = {
  createSpecSheet,
  updateSpecSheet,
  getSpecSheetById,
  getAllSpecSheets,
  getSpecSheetsByProductId,
  deleteSpecSheet,
  changeSpecSheetStatus,
  getAllSpecSheetsWithCosts
};