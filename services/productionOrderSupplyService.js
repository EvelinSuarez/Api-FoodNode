// services/productionOrderSupplyService.js
const productionOrderSupplyRepo = require('../repositories/productionOrderSupplyRepository');
const { ProductionOrder, Supply, sequelize } = require('../models'); // Asegúrate de que Supply esté importado
const { NotFoundError, BadRequestError, ApplicationError } = require('../utils/customErrors');
const { Op } = require('sequelize');

/**
 * Añade uno o más registros de insumos consumidos a una orden de producción.
 * NOTA: Esta implementación actualmente solo crea nuevos registros.
 * Para una funcionalidad de "actualizar si existe la combinación orden+insumo",
 * se necesitaría lógica adicional para buscar y luego decidir si crear o actualizar.
 */
const addOrUpdateConsumedSupplies = async (idProductionOrder, consumedSuppliesData) => {
    const t = await sequelize.transaction();
    try {
        // 1. Validar la orden de producción
        const productionOrder = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!productionOrder) {
            throw new NotFoundError(`Orden de producción con ID ${idProductionOrder} no encontrada.`);
        }
        if (productionOrder.status === 'COMPLETED' || productionOrder.status === 'CANCELLED') {
            throw new BadRequestError('No se pueden añadir consumos a una orden completada o cancelada.');
        }

        // 2. Validar cada insumo y preparar datos
        const suppliesToProcess = [];
        for (const supplyData of consumedSuppliesData) {
            const supply = await Supply.findByPk(supplyData.idSupply, { transaction: t });
            if (!supply) {
                throw new BadRequestError(`Insumo con ID ${supplyData.idSupply} no encontrado o no activo.`);
            }
            // Aquí podrías añadir lógica para verificar si el insumo está activo (si tienes un campo 'status' en Supply)

            suppliesToProcess.push({
                idSupply: supply.idSupply,
                quantityConsumed: supplyData.quantityConsumed,
                // Si unitOfMeasureConsumedSnapshot no se envía, se podría tomar de supply.unitOfMeasure
                unitOfMeasureConsumedSnapshot: supplyData.unitOfMeasureConsumedSnapshot || supply.unitOfMeasure,
                consumptionDate: supplyData.consumptionDate || new Date(),
                notes: supplyData.notes,
            });

            // TODO: Considerar la lógica de actualización de stock aquí.
            // Ejemplo:
            // if (supply.currentStock < supplyData.quantityConsumed) {
            //   throw new BadRequestError(`Stock insuficiente para el insumo ${supply.supplyName}.`);
            // }
            // await supply.decrement('currentStock', { by: supplyData.quantityConsumed, transaction: t });
        }

        if (suppliesToProcess.length === 0) {
            throw new BadRequestError("No se proporcionaron datos de insumos válidos para registrar.");
        }

        // 3. Crear los registros de consumo
        const addedRecords = await productionOrderSupplyRepo.bulkCreateConsumedSupplies(
            idProductionOrder,
            suppliesToProcess,
            t
        );

        await t.commit();
        // Devolver los registros creados con datos del insumo si es necesario (el repo no lo hace por defecto en bulkCreate)
        // Podrías hacer un find posterior si necesitas devolverlos con 'supplyData'
        return addedRecords;

    } catch (error) {
        await t.rollback();
        console.error("Error en service addOrUpdateConsumedSupplies:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al registrar insumos consumidos: ${error.message}`);
    }
};

const getConsumedSuppliesByOrderId = async (idProductionOrder) => {
    // La validación de existencia de ProductionOrder la hace el middleware
    const consumedSupplies = await productionOrderSupplyRepo.findConsumedSuppliesByOrderId(idProductionOrder);
    if (!consumedSupplies || consumedSupplies.length === 0) {
        // El controlador puede decidir si esto es un 404 o simplemente un 200 con array vacío.
        // Por consistencia con otros "get all", un array vacío es común para un 200.
        // Si se quiere un 404 si no hay NINGUNO, se puede agregar aquí.
    }
    return consumedSupplies;
};

const getConsumedSupplyRecordById = async (idProductionOrderSupply) => {
    const consumedSupply = await productionOrderSupplyRepo.findConsumedSupplyRecordById(idProductionOrderSupply);
    if (!consumedSupply) {
        throw new NotFoundError(`Registro de consumo con ID ${idProductionOrderSupply} no encontrado.`);
    }
    return consumedSupply;
};

const updateConsumedSupplyRecord = async (idProductionOrder, idProductionOrderSupply, dataToUpdate) => {
    const t = await sequelize.transaction();
    try {
        // 1. Validar la orden de producción (estado)
        const productionOrder = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!productionOrder) { // Aunque el middleware lo valida, es buena práctica re-chequear dentro del servicio.
            throw new NotFoundError(`Orden de producción con ID ${idProductionOrder} no encontrada.`);
        }
        if (productionOrder.status === 'COMPLETED' || productionOrder.status === 'CANCELLED') {
            throw new BadRequestError('No se pueden modificar consumos de una orden completada o cancelada.');
        }

        // 2. Validar que el registro de consumo exista y pertenezca a la orden
        const existingRecord = await productionOrderSupplyRepo.findRecordByOrderAndId(idProductionOrder, idProductionOrderSupply, t);
        if (!existingRecord) {
            throw new NotFoundError(`Registro de consumo ID ${idProductionOrderSupply} no encontrado o no pertenece a la orden ID ${idProductionOrder}.`);
        }

        // TODO: Lógica de ajuste de stock si 'quantityConsumed' cambia.
        // const oldQuantity = existingRecord.quantityConsumed;
        // const newQuantity = dataToUpdate.quantityConsumed;
        // if (newQuantity !== undefined && newQuantity !== oldQuantity) {
        //   const supply = await Supply.findByPk(existingRecord.idSupply, { transaction: t });
        //   const difference = newQuantity - oldQuantity; // Positivo si aumenta consumo, negativo si disminuye
        //   if (supply.currentStock < difference) { // Solo si aumenta el consumo y no hay stock
        //     throw new BadRequestError(`Stock insuficiente para ajustar el consumo del insumo ${supply.supplyName}.`);
        //   }
        //   await supply.decrement('currentStock', { by: difference, transaction: t });
        // }

        // 3. Filtrar campos actualizables (ya hecho parcialmente por validaciones, pero es buena práctica)
        const allowedUpdates = ['quantityConsumed', 'unitOfMeasureConsumedSnapshot', 'consumptionDate', 'notes'];
        const finalDataToUpdate = {};
        for (const key of allowedUpdates) {
            if (dataToUpdate.hasOwnProperty(key)) {
                finalDataToUpdate[key] = dataToUpdate[key];
            }
        }

        if (Object.keys(finalDataToUpdate).length === 0) {
            throw new BadRequestError("No se proporcionaron datos válidos para actualizar.");
        }

        // 4. Actualizar el registro
        const success = await productionOrderSupplyRepo.updateRecord(idProductionOrderSupply, finalDataToUpdate, t);
        if (!success) {
            // Esto no debería pasar si findRecordByOrderAndId lo encontró, pero es un seguro.
            throw new ApplicationError('No se pudo actualizar el registro de consumo.');
        }

        await t.commit();
        return productionOrderSupplyRepo.findConsumedSupplyRecordById(idProductionOrderSupply); // Devolver el registro actualizado
    } catch (error) {
        await t.rollback();
        console.error("Error en service updateConsumedSupplyRecord:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al actualizar el registro de consumo: ${error.message}`);
    }
};

const deleteConsumedSupplyRecord = async (idProductionOrder, idProductionOrderSupply) => {
    const t = await sequelize.transaction();
    try {
        // 1. Validar la orden de producción (estado)
        const productionOrder = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!productionOrder) {
            throw new NotFoundError(`Orden de producción con ID ${idProductionOrder} no encontrada.`);
        }
        if (productionOrder.status === 'COMPLETED' || productionOrder.status === 'CANCELLED') {
            throw new BadRequestError('No se pueden eliminar consumos de una orden completada o cancelada.');
        }

        // 2. Validar que el registro de consumo exista y pertenezca a la orden
        const recordToDelete = await productionOrderSupplyRepo.findRecordByOrderAndId(idProductionOrder, idProductionOrderSupply, t);
        if (!recordToDelete) {
            throw new NotFoundError(`Registro de consumo ID ${idProductionOrderSupply} no encontrado o no pertenece a la orden ID ${idProductionOrder}.`);
        }

        // TODO: Lógica de ajuste de stock (reintegrar la cantidad consumida).
        // const supply = await Supply.findByPk(recordToDelete.idSupply, { transaction: t });
        // await supply.increment('currentStock', { by: recordToDelete.quantityConsumed, transaction: t });

        // 3. Eliminar el registro
        const deleted = await productionOrderSupplyRepo.deleteRecordById(idProductionOrderSupply, t);
        if (!deleted) {
            throw new ApplicationError('No se pudo eliminar el registro de consumo.');
        }

        await t.commit();
        // No se devuelve nada en un delete exitoso (HTTP 204)
    } catch (error) {
        await t.rollback();
        console.error("Error en service deleteConsumedSupplyRecord:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al eliminar el registro de consumo: ${error.message}`);
    }
};


module.exports = {
    addOrUpdateConsumedSupplies,
    getConsumedSuppliesByOrderId,
    getConsumedSupplyRecordById,
    updateConsumedSupplyRecord,
    deleteConsumedSupplyRecord,
};