// Archivo: services/specSheetsService.js
// VERSIÓN COMPLETA: Este archivo ya está estructurado correctamente para llamar al repositorio.
// La corrección principal se hizo en el repositorio que esta función utiliza.

const specSheetRepository = require("../repositories/specSheetsRepository");
const specSheetSupplyRepository = require("../repositories/specSheetSupplyRepository");
const specSheetProcessRepository = require("../repositories/specSheetProcessRepository");
const db = require('../models');
const { Product, Supply, SpecSheet, Process } = db;
const { Op } = require('sequelize');
const { NotFoundError, BadRequestError, ConflictError, ApplicationError } = require('../utils/customErrors');

// --- HELPER FUNCTION ---
const mapFrontendToBackendSpecSheet = (frontendData) => {
    const backendData = {
        idProduct: parseInt(frontendData.idProduct, 10),
        quantityBase: parseFloat(frontendData.quantity),
        dateEffective: frontendData.startDate,
        status: frontendData.status !== undefined ? frontendData.status : true,
        versionName: frontendData.versionName || null,
        description: frontendData.description || null,
        endDate: frontendData.endDate || null,
        unitOfMeasure: frontendData.unitOfMeasure || null
    };
    Object.keys(backendData).forEach(key => {
        if (backendData[key] === undefined) delete backendData[key];
        if (key === 'quantityBase' && isNaN(backendData[key])) delete backendData[key];
        if (key === 'idProduct' && isNaN(backendData[key])) delete backendData[key];
    });
    return backendData;
};

// --- CRUD OPERATIONS ---
const createSpecSheet = async (specSheetCompleteDataFromFrontend) => {
  const t = await db.sequelize.transaction();
  try {
    const { supplies, processes, ...specSheetCoreFrontendData } = specSheetCompleteDataFromFrontend;
    const specSheetCoreBackendData = mapFrontendToBackendSpecSheet(specSheetCoreFrontendData);

    if (!specSheetCoreBackendData.idProduct) {
        await t.rollback();
        throw new BadRequestError("El ID del producto es requerido.");
    }
    const productExists = await Product.findByPk(specSheetCoreBackendData.idProduct, { transaction: t });
    if (!productExists) {
      await t.rollback();
      throw new NotFoundError(`El producto con ID ${specSheetCoreBackendData.idProduct} no existe.`);
    }
    if (!productExists.status) {
      await t.rollback();
      throw new BadRequestError(`El producto ID ${specSheetCoreBackendData.idProduct} no está activo.`);
    }

    if (specSheetCoreBackendData.quantityBase === undefined || isNaN(specSheetCoreBackendData.quantityBase) || specSheetCoreBackendData.quantityBase <= 0) {
        await t.rollback();
        throw new BadRequestError("La cantidad base es requerida y debe ser un número positivo.");
    }
    if (!specSheetCoreBackendData.dateEffective) {
        await t.rollback();
        throw new BadRequestError("La fecha efectiva es requerida.");
    }
    if (!specSheetCoreBackendData.unitOfMeasure) {
        await t.rollback();
        throw new BadRequestError("La unidad de medida para la cantidad base de la ficha es requerida.");
    }

    if (specSheetCoreBackendData.status === true) {
      await SpecSheet.update(
        { status: false, endDate: new Date() },
        { where: { idProduct: specSheetCoreBackendData.idProduct, status: true }, transaction: t }
      );
      specSheetCoreBackendData.endDate = null; 
    } else if (specSheetCoreBackendData.status === false && !specSheetCoreBackendData.endDate) {
        specSheetCoreBackendData.endDate = new Date();
    }

    const newSpecSheet = await specSheetRepository.createSpecSheet(specSheetCoreBackendData, { transaction: t });

    if (supplies && supplies.length > 0) {
      const specSheetSupplyItems = [];
      for (const item of supplies) {
        const supplyExists = await Supply.findByPk(parseInt(item.idSupply), { attributes: ['idSupply', 'supplyName', 'status'], transaction: t });
        if (!supplyExists) { await t.rollback(); throw new NotFoundError(`Insumo ID ${item.idSupply} no existe.`); }
        if (!supplyExists.status) { await t.rollback(); throw new BadRequestError(`Insumo "${supplyExists.supplyName}" (ID: ${item.idSupply}) no está activo.`);}
        
        if (!item.idPurchaseDetail) {
            await t.rollback();
            throw new BadRequestError(`El insumo "${supplyExists.supplyName}" debe tener un lote de compra (idPurchaseDetail) asociado.`);
        }
        
        specSheetSupplyItems.push({
          idSpecSheet: newSpecSheet.idSpecSheet,
          idSupply: parseInt(item.idSupply),
          idPurchaseDetail: parseInt(item.idPurchaseDetail),
          quantity: parseFloat(item.quantity),
          unitOfMeasure: item.unitOfMeasure,
          notes: item.notes || null,
        });
      }
      if (specSheetSupplyItems.length > 0) {
        await specSheetSupplyRepository.bulkCreate(specSheetSupplyItems, { transaction: t });
      }
    }

    if (processes && processes.length > 0) {
      const specSheetProcessItems = [];
      for (const [index, proc] of processes.entries()) {
        if (proc.idProcess) {
          const masterProcessExists = await Process.findByPk(parseInt(proc.idProcess), { transaction: t });
          if (!masterProcessExists) { await t.rollback(); throw new NotFoundError(`Proceso maestro ID ${proc.idProcess} no existe.`); }
        } else if (!proc.processNameOverride || proc.processNameOverride.trim() === '') {
          await t.rollback(); throw new BadRequestError(`Nombre (processNameOverride) requerido para procesos sin ID maestro (paso ${index + 1}).`);
        }
        specSheetProcessItems.push({
          idSpecSheet: newSpecSheet.idSpecSheet, idProcess: proc.idProcess ? parseInt(proc.idProcess) : null,
          processOrder: parseInt(proc.processOrder) || (index + 1),
          processNameOverride: proc.processNameOverride.trim(),
          processDescriptionOverride: proc.processDescriptionOverride?.trim() || null,
          estimatedTimeMinutes: proc.estimatedTimeMinutes ? parseInt(proc.estimatedTimeMinutes) : null,
        });
      }
      if (specSheetProcessItems.length > 0) {
        await specSheetProcessRepository.bulkCreate(specSheetProcessItems, { transaction: t });
      }
    }

    await t.commit();
    return specSheetRepository.getSpecSheetById(newSpecSheet.idSpecSheet);

  } catch (error) {
    if (t && !t.finished) {
      try { await t.rollback(); } catch (rbError) { console.error("Service[SpecSheet Create]: Error rollback:", rbError); }
    }
    console.error("Service[SpecSheet Create]:", error.message, error.stack ? error.stack : '');
    if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ConflictError || error instanceof ApplicationError) {
      throw error;
    }
    throw new ApplicationError(`Error creando ficha técnica: ${error.message}`, error);
  }
};

const getAllSpecSheets = async (filters = {}) => {
  try {
    return await specSheetRepository.getAllSpecSheets(filters);
  } catch (error) {
    console.error("Service[SpecSheet GetAll]:", error.message);
    throw new ApplicationError('Error al obtener fichas técnicas.', error);
  }
};

const getSpecSheetById = async (idSpecSheet) => {
  const id = parseInt(idSpecSheet);
  if (isNaN(id) || id <= 0) throw new BadRequestError("ID de Ficha Técnica inválido.");
  
  const specSheet = await specSheetRepository.getSpecSheetById(id);
  if (!specSheet) {
    throw new NotFoundError(`Ficha técnica ID ${id} no encontrada.`);
  }
  return specSheet;
};

const updateSpecSheet = async (idSpecSheet, specSheetCompleteDataFromFrontend) => {
  const t = await db.sequelize.transaction();
  const id = parseInt(idSpecSheet);
  if (isNaN(id) || id <= 0) throw new BadRequestError("ID de Ficha Técnica inválido para actualizar.");

  try {
    const { supplies, processes, ...specSheetCoreFrontendData } = specSheetCompleteDataFromFrontend;
    const specSheetCoreBackendData = mapFrontendToBackendSpecSheet(specSheetCoreFrontendData);

    const existingSheet = await SpecSheet.findByPk(id, { transaction: t });
    if (!existingSheet) {
      await t.rollback();
      throw new NotFoundError(`Ficha técnica ID ${id} no encontrada.`);
    }

    if (specSheetCoreBackendData.idProduct && specSheetCoreBackendData.idProduct !== existingSheet.idProduct) {
        const productExists = await Product.findByPk(specSheetCoreBackendData.idProduct, { transaction: t });
        if (!productExists) { await t.rollback(); throw new NotFoundError(`El nuevo producto con ID ${specSheetCoreBackendData.idProduct} no existe.`);}
        if (!productExists.status) { await t.rollback(); throw new BadRequestError(`El nuevo producto ID ${specSheetCoreBackendData.idProduct} no está activo.`);}
    }
    
    const finalIdProduct = specSheetCoreBackendData.idProduct || existingSheet.idProduct;

    if (specSheetCoreBackendData.status === true && (existingSheet.status === false || specSheetCoreBackendData.idProduct !== existingSheet.idProduct) ) {
      await SpecSheet.update(
        { status: false, endDate: new Date() },
        { 
          where: { 
            idProduct: finalIdProduct,
            status: true, 
            idSpecSheet: { [Op.ne]: id } 
          }, 
          transaction: t 
        }
      );
      specSheetCoreBackendData.endDate = null;
    } else if (specSheetCoreBackendData.status === false && existingSheet.status === true) {
      if (!specSheetCoreBackendData.endDate) specSheetCoreBackendData.endDate = new Date();
    }

    await specSheetRepository.updateSpecSheet(id, specSheetCoreBackendData, { transaction: t });

    await specSheetSupplyRepository.destroyBySpecSheetId(id, { transaction: t });
    if (supplies && supplies.length > 0) {
      const specSheetSupplyItems = [];
      for (const item of supplies) {
        const supplyExists = await Supply.findByPk(parseInt(item.idSupply), { attributes: ['idSupply', 'supplyName', 'status'], transaction: t });
        if (!supplyExists) { await t.rollback(); throw new NotFoundError(`Insumo ID ${item.idSupply} no existe.`); }
        if (!supplyExists.status) { await t.rollback(); throw new BadRequestError(`Insumo "${supplyExists.supplyName}" no está activo.`); }

        if (!item.idPurchaseDetail) {
            await t.rollback();
            throw new BadRequestError(`El insumo "${supplyExists.supplyName}" debe tener un lote de compra (idPurchaseDetail) asociado.`);
        }
        
        specSheetSupplyItems.push({
          idSpecSheet: id,
          idSupply: parseInt(item.idSupply),
          idPurchaseDetail: parseInt(item.idPurchaseDetail),
          quantity: parseFloat(item.quantity),
          unitOfMeasure: item.unitOfMeasure,
          notes: item.notes || null,
        });
      }
      if (specSheetSupplyItems.length > 0) {
        await specSheetSupplyRepository.bulkCreate(specSheetSupplyItems, { transaction: t });
      }
    }

    await specSheetProcessRepository.destroyBySpecSheetId(id, { transaction: t });
    if (processes && processes.length > 0) {
      const specSheetProcessItems = [];
      for (const [index, proc] of processes.entries()) {
        if (proc.idProcess) {
          const masterProcessExists = await Process.findByPk(parseInt(proc.idProcess), { transaction: t });
          if (!masterProcessExists) { await t.rollback(); throw new NotFoundError(`Proceso maestro ID ${proc.idProcess} no existe.`); }
        } else if (!proc.processNameOverride || proc.processNameOverride.trim() === '') {
          await t.rollback(); throw new BadRequestError(`Nombre (processNameOverride) requerido para procesos sin ID maestro (paso ${index+1}).`);
        }
        specSheetProcessItems.push({
          idSpecSheet: id, idProcess: proc.idProcess ? parseInt(proc.idProcess) : null,
          processOrder: parseInt(proc.processOrder) || (index + 1),
          processNameOverride: proc.processNameOverride.trim(),
          processDescriptionOverride: proc.processDescriptionOverride?.trim() || null,
          estimatedTimeMinutes: proc.estimatedTimeMinutes ? parseInt(proc.estimatedTimeMinutes) : null,
        });
      }
      if (specSheetProcessItems.length > 0) {
        await specSheetProcessRepository.bulkCreate(specSheetProcessItems, { transaction: t });
      }
    }

    await t.commit();
    return specSheetRepository.getSpecSheetById(id);

  } catch (error) {
    if (t && !t.finished) {
      try { await t.rollback(); } catch (rbError) { console.error("Service[SpecSheet Update]: Error rollback:", rbError); }
    }
    console.error(`Service[SpecSheet Update] ID ${id}:`, error.message, error.stack ? error.stack : '');
    if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ConflictError || error instanceof ApplicationError) {
      throw error;
    }
    throw new ApplicationError(`Error actualizando ficha técnica: ${error.message}`, error);
  }
};

const deleteSpecSheet = async (idSpecSheet) => {
  const t = await db.sequelize.transaction();
  const id = parseInt(idSpecSheet);
  if (isNaN(id) || id <= 0) throw new BadRequestError("ID de Ficha Técnica inválido para eliminar.");
  try {
    const specSheet = await SpecSheet.findByPk(id, { attributes: ['idSpecSheet'], transaction: t });
    if (!specSheet) {
      await t.rollback();
      throw new NotFoundError(`Ficha técnica ID ${id} no encontrada.`);
    }
    
    await specSheetSupplyRepository.destroyBySpecSheetId(id, { transaction: t });
    await specSheetProcessRepository.destroyBySpecSheetId(id, { transaction: t });

    const deletedRows = await specSheetRepository.deleteSpecSheet(id, { transaction: t });
    if (deletedRows === 0) {
      await t.rollback();
      throw new ApplicationError(`No se eliminó la ficha ID ${id}.`);
    }

    await t.commit();
    return { message: `Ficha técnica ID ${id} eliminada exitosamente.` };
  } catch (error) {
    if (t && !t.finished) {
      try { await t.rollback(); } catch (rbError) { console.error("Service[SpecSheet Delete]: Error rollback:", rbError); }
    }
    console.error(`Service[SpecSheet Delete] ID ${id}:`, error.message, error.stack ? error.stack : '');
    if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof ApplicationError) {
      throw error;
    }
    throw new ApplicationError(`Error eliminando ficha técnica: ${error.message}`, error);
  }
};

const changeSpecSheetStatus = async (idSpecSheet, newStatus) => {
  const id = parseInt(idSpecSheet);
  if (isNaN(id) || id <= 0) throw new BadRequestError("ID de Ficha Técnica inválido.");
  if (typeof newStatus !== 'boolean') throw new BadRequestError("El nuevo estado debe ser un valor booleano.");

  const t = await db.sequelize.transaction();
  try {
    const specSheetToUpdate = await SpecSheet.findByPk(id, { transaction: t });
    if (!specSheetToUpdate) {
      await t.rollback();
      throw new NotFoundError(`Ficha técnica ID ${id} no encontrada.`);
    }

    if (specSheetToUpdate.status === newStatus) {
      await t.rollback();
      console.log(`Service: Estado de ficha ID ${id} ya es ${newStatus}. No se realizaron cambios.`);
      return specSheetRepository.getSpecSheetById(id);
    }

    let dataForUpdate = { status: newStatus };

    if (newStatus === true) {
      await SpecSheet.update(
        { status: false, endDate: new Date() },
        {
          where: {
            idProduct: specSheetToUpdate.idProduct,
            status: true,
            idSpecSheet: { [Op.ne]: id }
          },
          transaction: t
        }
      );
      dataForUpdate.endDate = null;
    } else {
      const currentEndDate = specSheetToUpdate.endDate ? new Date(specSheetToUpdate.endDate) : null;
      dataForUpdate.endDate = (currentEndDate && currentEndDate <= new Date()) ? currentEndDate : new Date();
    }

    await specSheetRepository.updateSpecSheet(id, dataForUpdate, { transaction: t });

    await t.commit();
    return specSheetRepository.getSpecSheetById(id);
  } catch (error) {
    if (t && !t.finished) {
      try { await t.rollback(); } catch (rbError) { console.error("Service[SpecSheet ChangeStatus]: Error rollback:", rbError); }
    }
    console.error(`Service[SpecSheet ChangeStatus] ID ${id}:`, error.message, error.stack ? error.stack : '');
    if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ConflictError || error instanceof ApplicationError) {
      throw error;
    }
    throw new ApplicationError(`Error cambiando estado de ficha técnica: ${error.message}`, error);
  }
};

// --- FUNCIÓN CLAVE ---
// Esta función llama al repositorio, que es donde hemos puesto la consulta detallada.
// No necesita cambios porque la corrección está en la capa inferior (repositorio).
const getSpecSheetsByProductId = async (idProductParam) => {
  const idProduct = parseInt(idProductParam);
  if (isNaN(idProduct) || idProduct <= 0) {
    throw new BadRequestError("ID de Producto inválido.");
  }
  const product = await Product.findByPk(idProduct, { attributes: ['idProduct'] });
  if (!product) {
    throw new NotFoundError(`Producto ID ${idProduct} no encontrado.`);
  }

  try {
    const specSheets = await specSheetRepository.getSpecSheetsByProduct(idProduct);
    return specSheets;
  } catch (error) {
    console.error(`Service[SpecSheet GetByProduct] ID ${idProduct}:`, error.message);
    throw new ApplicationError('Error al obtener fichas técnicas por producto.', error);
  }
};

module.exports = {
  createSpecSheet,
  getAllSpecSheets,
  getSpecSheetById,
  updateSpecSheet,
  deleteSpecSheet,
  changeSpecSheetStatus,
  getSpecSheetsByProductId,
};