// Archivo: services/specSheetsService.js

const specSheetRepository = require("../repositories/specSheetsRepository");
const specSheetSupplyRepository = require("../repositories/specSheetSupplyRepository");
const specSheetProcessRepository = require("../repositories/specSheetProcessRepository");
const db = require('../models');
// --- CAMBIO 1: Importar el modelo Process ---
const { Product, SpecSheet, Process } = db; 
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

// Formatea minutos a H:MM
const formatMinutesToHHMM = (minutes) => {
    const m = Math.max(0, Math.floor(parseFloat(minutes) || 0));
    const hrs = Math.floor(m / 60);
    const mins = m % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}`;
};

/**
 * CAMBIO 2: Función para asegurar que los procesos manuales se guarden en el catálogo maestro.
 */
const syncMasterProcesses = async (processesArray, transaction) => {
    const processedItems = [];
    
    for (const [index, proc] of processesArray.entries()) {
        let idProcess = (proc.idProcess && !isNaN(parseInt(proc.idProcess))) ? parseInt(proc.idProcess) : null;
        const nameOverride = proc.processNameOverride?.trim();
        const time = proc.estimatedTimeMinutes; // Extraemos el tiempo para usarlo en ambos lados

        // CASO 1: Es un proceso existente (tiene idProcess)
        if (idProcess) {
            // ACTUALIZAR EL MAESTRO: Si quieres que el catálogo global se actualice con el tiempo enviado
            await Process.update(
                { estimatedTimeMinutes: time }, 
                { where: { idProcess }, transaction }
            );
        } 
        // CASO 2: Es un proceso nuevo escrito a mano (no tiene idProcess)
        else if (nameOverride) {
            // Buscar o crear en el catálogo maestro
            let [masterProcess, created] = await Process.findOrCreate({
                where: { processName: nameOverride },
                defaults: {
                    processName: nameOverride,
                    description: proc.processDescriptionOverride || 'Creado desde Ficha Técnica',
                    estimatedTimeMinutes: time, // <--- GUARDAR EN TABLA 'processes' (NUEVO)
                    status: true
                },
                transaction
            });
            
            // Si el proceso YA EXISTÍA pero se encontró por nombre, actualizamos su tiempo
            if (!created) {
                await masterProcess.update({ estimatedTimeMinutes: time }, { transaction });
            }

            idProcess = masterProcess.idProcess;
        }

        // Guardar la información para la tabla 'spec_sheet_processes' (la de la ficha)
        processedItems.push({
            idProcess,
            processOrder: proc.processOrder || (index + 1),
            processNameOverride: nameOverride,
            processDescriptionOverride: proc.processDescriptionOverride || null,
            estimatedTimeMinutes: time // <--- GUARDAR EN TABLA 'spec_sheet_processes'
        });
    }
    return processedItems;
};

/**
 * Calcula costos, actualiza el costo total de la ficha y el costo del producto.
 */
const updateProductAndSpecSheetCosts = async (specSheetId, transaction) => {
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

    if (!specSheet) return;

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

    await SpecSheet.update(
        { totalCost: totalCostOfRecipe.toFixed(2) },
        { where: { idSpecSheet: specSheetId }, transaction }
    );
    
    if (specSheet.product) {
        await Product.update(
            { sellingPrice: totalCostOfRecipe.toFixed(2) },
            { where: { idProduct: specSheet.idProduct }, transaction }
        );
    }
};


// --- CRUD OPERATIONS ---

const createSpecSheet = async (specSheetData) => {
    const t = await db.sequelize.transaction();
    try {
        const { specSheetProcesses, specSheetSupplies, ...coreData } = specSheetData;
        const mappedData = mapFrontendToBackendSpecSheet(coreData);

        // 1. Crear cabecera
        const newSheet = await specSheetRepository.createSpecSheet(mappedData, { transaction: t });
        const idSpecSheet = newSheet.idSpecSheet;

        // 2. CAMBIO 3: Sincronizar procesos manuales con el catálogo global y luego guardar en la ficha
        if (specSheetProcesses && specSheetProcesses.length > 0) {
            const processesToSave = await syncMasterProcesses(specSheetProcesses, t);
            const linkedProcesses = processesToSave.map(p => ({ ...p, idSpecSheet }));
            await specSheetProcessRepository.bulkCreate(linkedProcesses, { transaction: t });
        }

        // 3. Guardar Ingredientes
        if (specSheetSupplies && specSheetSupplies.length > 0) {
            const suppliesToSave = specSheetSupplies.map(sup => ({ ...sup, idSpecSheet }));
            await specSheetSupplyRepository.bulkCreate(suppliesToSave, { transaction: t });
        }

        if (mappedData.status === true) {
            await updateProductAndSpecSheetCosts(idSpecSheet, t);
        }

        await t.commit();
        return getSpecSheetById(idSpecSheet);
    } catch (error) {
        if (t) await t.rollback();
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
        if (!existingSheet) throw new NotFoundError(`Ficha técnica ID ${id} no encontrada.`);

        if (mappedData.status === true && !existingSheet.status) {
            await SpecSheet.update(
                { status: false, endDate: new Date() },
                { where: { idProduct: existingSheet.idProduct, status: true, idSpecSheet: { [Op.ne]: id } }, transaction: t }
            );
            mappedData.endDate = null;
        }
  
        await specSheetRepository.updateSpecSheet(id, mappedData, { transaction: t });
        
        // Limpiar antiguos
        await specSheetSupplyRepository.destroyBySpecSheetId(id, t);
        await specSheetProcessRepository.destroyBySpecSheetId(id, t);
      
        // Re-crear insumos
        if (specSheetSupplies && specSheetSupplies.length > 0) {
            const supplies = specSheetSupplies.map(item => ({...item, idSpecSheet: id}));
            await specSheetSupplyRepository.bulkCreate(supplies, { transaction: t });
        }
  
        // CAMBIO 3: Sincronizar procesos manuales también en el UPDATE
        if (specSheetProcesses && specSheetProcesses.length > 0) {
            const processesToSave = await syncMasterProcesses(specSheetProcesses, t);
            const linkedProcesses = processesToSave.map(p => ({ ...p, idSpecSheet: id }));
            await specSheetProcessRepository.bulkCreate(linkedProcesses, { transaction: t });
        }
  
        if (mappedData.status === true) {
            await updateProductAndSpecSheetCosts(id, t);
        }

        await t.commit();
        return getSpecSheetById(id);
    } catch (error) {
        if (t) await t.rollback();
        console.error(`Service[UpdateSpecSheet] ID ${id}:`, error);
        throw error;
    }
};

// ... Resto de funciones (getSpecSheetById, getAll, delete, etc) se mantienen iguales ...

const getSpecSheetById = async (idSpecSheet) => {
    const specSheet = await specSheetRepository.getSpecSheetById(idSpecSheet);
    if (!specSheet) throw new NotFoundError(`Ficha técnica ID ${idSpecSheet} no encontrada.`);
    
    const specSheetJson = specSheet.toJSON();

    // Calcular costos por insumo
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

    // Calcular tiempo total de procesos (en minutos) y formato H:MM
    let totalEstimatedTimeMinutes = 0;
    if (specSheetJson.specSheetProcesses && specSheetJson.specSheetProcesses.length > 0) {
        specSheetJson.specSheetProcesses.forEach(proc => {
            // Si el tiempo está en la fila de la ficha, usarlo; si no, intentar usar el maestro
            let time = parseFloat(proc.estimatedTimeMinutes);
            if (isNaN(time) || time === 0) {
                time = parseFloat(proc.masterProcessData?.estimatedTimeMinutes) || 0;
            }
            proc.estimatedTimeMinutes = time;
            totalEstimatedTimeMinutes += time;
        });
    }
    specSheetJson.totalEstimatedTimeMinutes = totalEstimatedTimeMinutes;
    specSheetJson.totalEstimatedTime = formatMinutesToHHMM(totalEstimatedTimeMinutes);

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
        if (status === true) await updateProductAndSpecSheetCosts(id, t);
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