// services/productionOrderService.js
const productionOrderRepo = require('../repositories/productionOrderRepository');
const { SpecSheet, SpecSheetProcess, Product, Employee, Provider, Process, Supply, ProductionOrderDetail , sequelize } = require('../models');
const { NotFoundError, BadRequestError, ApplicationError } = require('../utils/customErrors');
const { Op } = require('sequelize');


const createProductionOrder = async (orderData) => {
    const t = await sequelize.transaction();
    try {
        // Extraer inputInitialWeight e inputInitialWeightUnit de orderData
        const {
            idProduct,
            idSpecSheet: providedSpecSheetId,
            idEmployeeRegistered,
            initialAmount,
            inputInitialWeight, // <--- Tomar de orderData
            inputInitialWeightUnit, // <--- Tomar de orderData
            status,
            ...restOfOrderData
        } = orderData;

        let productNameSnapshot = "(Orden Pendiente de Producto)";
        if (idProduct) {
            const product = await Product.findByPk(idProduct, { transaction: t });
            if (!product) {
                throw new NotFoundError(`Producto con ID ${idProduct} no encontrado.`);
            }
            productNameSnapshot = product.productName;
        } else if (status && status !== 'PENDING') {
            // Si no es PENDING, y no hay producto, es un error si el estado requiere producto.
            // Por ahora, permitimos crear en PENDING sin producto.
        }

        const newOrderPayload = {
            ...restOfOrderData, // Incluye observations, idProvider, etc.
            idProduct: idProduct || null,
            idSpecSheet: providedSpecSheetId || null, // Se validará y asignará si es necesario más adelante
            idEmployeeRegistered: idEmployeeRegistered || null, // Asegurar que se maneje si es null
            initialAmount: initialAmount != null ? parseFloat(initialAmount) : 0, // Default para drafts
            productNameSnapshot,
            status: status || 'PENDING', // Default status
            
            // --- MODIFICACIÓN AQUÍ ---
            // Usar los valores de orderData si existen, sino null.
            // Asegurar que inputInitialWeight sea un número o null.
            inputInitialWeight: inputInitialWeight != null && inputInitialWeight !== '' ? parseFloat(inputInitialWeight) : null,
            inputInitialWeightUnit: inputInitialWeightUnit || null,
            // --- FIN MODIFICACIÓN ---

            // Campos de finalización se dejan null
            finalQuantityProduct: null,
            finishedProductWeight: null,
            finishedProductWeightUnit: null,
            inputFinalWeightUnused: null,
            inputFinalWeightUnusedUnit: null,
        };

        // Crear solo la cabecera de la orden inicialmente
        const createdOrder = await productionOrderRepo.createOrderWithDetails(newOrderPayload, t);

        // Los detalles (pasos) se crearán/sincronizarán cuando se asigne/confirme una ficha técnica,
        // probablemente a través de `updateProductionOrder`.

        await t.commit();
        
        // Devolver la orden recién creada (aún sin detalles de proceso si no se proveyó ficha)
        return productionOrderRepo.findOrderByIdWithDetails(createdOrder.idProductionOrder);
    } catch (error) {
        await t.rollback();
        console.error("Error en service createProductionOrder:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al crear la orden de producción: ${error.message}`);
    }
};
const getAllProductionOrders = async (filters, pagination, sort) => {
    return productionOrderRepo.findAllOrders(filters, pagination, sort);
};

const getProductionOrderById = async (idProductionOrder) => {
    const order = await productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    if (!order) {
        throw new NotFoundError(`Orden de producción con ID ${idProductionOrder} no encontrada.`);
    }
    return order;
};

// Servicio unificado para actualizar la orden, maneja la sincronización de detalles si cambia la ficha.
const updateProductionOrder = async (idProductionOrder, dataToUpdate) => {
    const t = await sequelize.transaction();
    try {
        const order = await productionOrderRepo.findOrderById(idProductionOrder, t);
        if (!order) {
            throw new NotFoundError(`Orden de producción ID ${idProductionOrder} no encontrada.`);
        }
        if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
            // Permitir actualizar solo ciertos campos (ej. observaciones) si está completada/cancelada
            if (Object.keys(dataToUpdate).some(key => !['observations'].includes(key))) {
                 throw new BadRequestError('Solo se pueden modificar observaciones de una orden completada o cancelada.');
            }
        }

        const updatePayload = { ...dataToUpdate };

        // Si se actualiza el idProduct, actualizar productNameSnapshot
        if (dataToUpdate.idProduct && dataToUpdate.idProduct !== order.idProduct) {
            const product = await Product.findByPk(dataToUpdate.idProduct, { transaction: t });
            if (!product) throw new NotFoundError(`Producto ID ${dataToUpdate.idProduct} no encontrado.`);
            updatePayload.productNameSnapshot = product.productName;
            // Si cambia el producto, la ficha anterior podría ya no ser válida.
            // Considerar resetear idSpecSheet o revalidar. Por ahora, el frontend manejaría esto.
            if (updatePayload.idSpecSheet === undefined) updatePayload.idSpecSheet = null; // Resetear ficha si no se especifica una nueva
            await productionOrderRepo.deleteOrderDetailsByOrderId(idProductionOrder, t); // Borrar pasos antiguos
        } else if (dataToUpdate.idProduct === null && order.idProduct !== null) { // Si se deselecciona el producto
            updatePayload.productNameSnapshot = "(Orden Pendiente de Producto)";
            updatePayload.idSpecSheet = null;
            await productionOrderRepo.deleteOrderDetailsByOrderId(idProductionOrder, t);
        }


        // Sincronizar ProductionOrderDetails si se provee o cambia idSpecSheet
        // O si ya hay un idSpecSheet en la orden y se actualiza algo que lo requiera (ej. pasar a SETUP_COMPLETED)
        const newSpecSheetId = dataToUpdate.idSpecSheet !== undefined ? dataToUpdate.idSpecSheet : order.idSpecSheet;
        const specSheetChanged = newSpecSheetId !== null && newSpecSheetId !== order.idSpecSheet;
        const shouldSyncDetails = specSheetChanged || (newSpecSheetId && dataToUpdate.status === 'SETUP_COMPLETED' && order.status !== 'SETUP_COMPLETED');


        if (newSpecSheetId && shouldSyncDetails) {
            const specSheet = await SpecSheet.findOne({
                where: { idSpecSheet: newSpecSheetId, idProduct: updatePayload.idProduct || order.idProduct, status: true },
                transaction: t
            });
            if (!specSheet) {
                throw new BadRequestError(`Ficha técnica ID ${newSpecSheetId} no es válida, no pertenece al producto o no está activa.`);
            }
            updatePayload.idSpecSheet = specSheet.idSpecSheet; // Confirmar el ID de la ficha

            const specProcesses = await SpecSheetProcess.findAll({
                where: { idSpecSheet: specSheet.idSpecSheet },
                order: [['processOrder', 'ASC']],
                include: [{ model: Process, as: 'masterProcessData' }],
                transaction: t
            });

            // Borrar detalles antiguos antes de crear nuevos si la ficha cambió
            if (specSheetChanged) {
                await productionOrderRepo.deleteOrderDetailsByOrderId(idProductionOrder, t);
            }
            
            if (specProcesses && specProcesses.length > 0) {
                const stepDetailsData = specProcesses.map(sp => ({
                    idProductionOrder, // Se asigna aquí
                    idProcess: sp.idProcess,
                    processOrder: sp.processOrder,
                    processNameSnapshot: sp.processNameOverride || sp.masterProcessData?.processName || 'Nombre de Proceso Desconocido',
                    processDescriptionSnapshot: sp.processDescriptionOverride || sp.masterProcessData?.description || '',
                    status: 'PENDING'
                }));
                await ProductionOrderDetail.bulkCreate(stepDetailsData, { transaction: t });
            } else if (specSheetChanged) { // Si la nueva ficha no tiene procesos, asegurarse que no queden detalles antiguos
                await productionOrderRepo.deleteOrderDetailsByOrderId(idProductionOrder, t);
            }
        } else if (dataToUpdate.idSpecSheet === null && order.idSpecSheet !== null) { // Si se quita la ficha
            await productionOrderRepo.deleteOrderDetailsByOrderId(idProductionOrder, t);
            updatePayload.idSpecSheet = null;
        }

        // Aplicar las actualizaciones a la cabecera de la orden
        await productionOrderRepo.updateOrderGeneral(idProductionOrder, updatePayload, t);
        
        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    } catch (error) {
        await t.rollback();
        console.error("Error en service updateProductionOrder:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al actualizar la orden: ${error.message}`);
    }
};


const updateProductionOrderStep = async (idProductionOrder, idProductionOrderDetail, stepData) => {
    const t = await sequelize.transaction();
    try {
        const order = await productionOrderRepo.findOrderById(idProductionOrder, t);
        if (!order) throw new NotFoundError(`Orden de producción ID ${idProductionOrder} no encontrada.`);
        if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
            throw new BadRequestError('No se pueden actualizar pasos de una orden completada o cancelada.');
        }
        if (order.status === 'PENDING' || order.status === 'SETUP') {
             throw new BadRequestError(`La orden debe estar al menos en 'SETUP_COMPLETED' para gestionar pasos. Estado actual: ${order.status}`);
        }


        const step = await productionOrderRepo.findStepById(idProductionOrderDetail, t);
        if (!step || step.idProductionOrder !== parseInt(idProductionOrder)) {
            throw new NotFoundError(`Paso ID ${idProductionOrderDetail} no encontrado o no pertenece a la orden.`);
        }
        if (step.status === 'COMPLETED' && (stepData.status && stepData.status !== 'COMPLETED')) {
            // Podrías permitir reabrir un paso si tienes una lógica de permisos específica
            throw new BadRequestError('Un paso completado no puede cambiar su estado directamente de esta forma.');
        }
        
        const allowedFields = ['idEmployeeAssigned', 'startDate', 'endDate', 'status', 'observations'];
        const filteredStepData = Object.keys(stepData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = stepData[key];
                if (key === 'idEmployeeAssigned' && obj[key] === '') obj[key] = null;
                if ((key === 'startDate' || key === 'endDate') && obj[key] === '') obj[key] = null;
                return obj;
            }, {});
        
        if (Object.keys(filteredStepData).length === 0) {
             throw new BadRequestError("No se proporcionaron datos válidos para actualizar el paso.");
        }
        
        await productionOrderRepo.updateStep(idProductionOrderDetail, filteredStepData, t);

        // Lógica para actualizar el estado de la orden principal
        if (filteredStepData.status === 'IN_PROGRESS' && order.status === 'SETUP_COMPLETED') {
            await productionOrderRepo.updateOrder(idProductionOrder, { status: 'IN_PROGRESS' }, t);
        } else if (filteredStepData.status === 'COMPLETED') {
            const allSteps = await ProductionOrderDetail.findAll({ where: { idProductionOrder }, transaction: t });
            const allStepsNowCompleted = allSteps.every(s => s.idProductionOrderDetail === step.idProductionOrderDetail ? filteredStepData.status === 'COMPLETED' : s.status === 'COMPLETED');
            
            if (allStepsNowCompleted && order.status !== 'ALL_STEPS_COMPLETED' && order.status !== 'COMPLETED') {
                await productionOrderRepo.updateOrder(idProductionOrder, { status: 'ALL_STEPS_COMPLETED' }, t);
            }
        }
        
        await t.commit();
        // Devolver el paso actualizado, y quizás la orden si su estado cambió.
        // Por simplicidad, devolvemos el paso. El frontend puede recargar la orden si es necesario.
        return productionOrderRepo.findStepById(idProductionOrderDetail);
    } catch (error) {
        await t.rollback();
        console.error("Error en service updateProductionOrderStep:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al actualizar el paso: ${error.message}`);
    }
};

const finalizeProductionOrder = async (idProductionOrder, finalizeData) => {
    const t = await sequelize.transaction();
    try {
        const order = await productionOrderRepo.findOrderById(idProductionOrder, t);
        if (!order) throw new NotFoundError(`Orden de producción ID ${idProductionOrder} no encontrada.`);
        
        const validPreviousStates = ['ALL_STEPS_COMPLETED', 'IN_PROGRESS'];
        // Si la orden no tiene pasos (ficha sin procesos), también podría finalizarse desde SETUP_COMPLETED
        const stepsCount = await ProductionOrderDetail.count({where: {idProductionOrder}, transaction: t});
        if (stepsCount === 0 && (order.status === 'SETUP_COMPLETED' || order.status === 'SETUP' || order.status === 'PENDING')) {
            // Ok, puede finalizar
        } else if (!validPreviousStates.includes(order.status)) {
            throw new BadRequestError(`La orden no está en un estado válido para ser finalizada (actual: ${order.status}). Debe estar en ${validPreviousStates.join(' o ')}.`);
        }
        
        if (stepsCount > 0) {
            const incompleteSteps = await ProductionOrderDetail.count({
                where: { idProductionOrder, status: { [Op.notIn]: ['COMPLETED', 'SKIPPED'] } },
                transaction: t
            });
            if (incompleteSteps > 0) {
                throw new BadRequestError('No se puede finalizar la orden, hay pasos pendientes o en progreso.');
            }
        }

        const { finalQuantityProduct, finishedProductWeight, finishedProductWeightUnit, inputFinalWeightUnused, inputFinalWeightUnusedUnit, consumedSupplies } = finalizeData;
        const updateData = {
            finalQuantityProduct,
            finishedProductWeight: finishedProductWeight != null ? finishedProductWeight : null,
            finishedProductWeightUnit: finishedProductWeightUnit || null,
            inputFinalWeightUnused: inputFinalWeightUnused != null ? inputFinalWeightUnused : null,
            inputFinalWeightUnusedUnit: inputFinalWeightUnusedUnit || null,
            status: 'COMPLETED'
        };
        await productionOrderRepo.updateOrder(idProductionOrder, updateData, t);

        if (consumedSupplies && consumedSupplies.length > 0) {
            const supplyIds = consumedSupplies.map(s => s.idSupply);
            const existingSuppliesCount = await Supply.count({ where: { idSupply: { [Op.in]: supplyIds } }, transaction: t });
            if (existingSuppliesCount !== supplyIds.length) {
                throw new BadRequestError('Uno o más IDs de insumos consumidos no son válidos.');
            }
            await productionOrderRepo.syncConsumedSupplies(idProductionOrder, consumedSupplies, t);
        } else {
            // Si no se envían consumedSupplies, ¿borramos los existentes o los dejamos?
            // Por consistencia, si se permite editar, borrarlos si no se envían.
            await productionOrderRepo.syncConsumedSupplies(idProductionOrder, [], t);
        }

        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    } catch (error) {
        await t.rollback();
        console.error("Error en service finalizeProductionOrder:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al finalizar la orden: ${error.message}`);
    }
};

const changeProductionOrderStatus = async (idProductionOrder, newStatus, observationsForChange) => {
    const t = await sequelize.transaction();
    try {
        const order = await productionOrderRepo.findOrderById(idProductionOrder, t);
        if (!order) throw new NotFoundError(`Orden de producción ID ${idProductionOrder} no encontrada.`);

        if (newStatus === 'COMPLETED') {
            throw new BadRequestError('Para marcar como COMPLETADA, use la funcionalidad de finalización de orden.');
        }
        if (order.status === 'COMPLETED' && newStatus !== 'CANCELLED') {
             throw new BadRequestError('Una orden completada solo puede ser cancelada (o requerir un proceso de reapertura especial).');
        }
        if (order.status === 'CANCELLED' && !['PENDING', 'SETUP'].includes(newStatus)) { // Ejemplo: Cancelada solo puede reabrirse a PENDING/SETUP
            throw new BadRequestError('Una orden cancelada solo puede ser reabierta a un estado inicial.');
        }
        // Aquí puedes añadir más lógica de transición de estados si es necesario.
        // Ej. Si pasa a PAUSED, ¿qué validaciones se necesitan?
        // Ej. Si pasa de IN_PROGRESS a SETUP_COMPLETED (retroceso).

        const updatePayload = { status: newStatus };
        if (observationsForChange) { // Guardar la observación del cambio de estado si se provee
            updatePayload.observations = `${order.observations || ''}\n[Cambio a ${newStatus}]: ${observationsForChange}`.trim();
        }

        await productionOrderRepo.updateOrder(idProductionOrder, updatePayload, t);
        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    } catch (error) {
        await t.rollback();
        console.error("Error en service changeProductionOrderStatus:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al cambiar el estado: ${error.message}`);
    }
};

const deleteProductionOrder = async (idProductionOrder) => {
    const t = await sequelize.transaction();
    try {
        const order = await productionOrderRepo.findOrderById(idProductionOrder, t);
        if (!order) {
            throw new NotFoundError(`Orden de producción ID ${idProductionOrder} no encontrada.`);
        }
        if (['IN_PROGRESS', 'COMPLETED', 'ALL_STEPS_COMPLETED'].includes(order.status)) {
             throw new BadRequestError(`No se puede eliminar una orden que está ${order.status}. Considere cancelarla primero.`);
        }

        // Asegurar que los detalles y consumos se borren si no hay onDelete: CASCADE
        await ProductionOrderDetail.destroy({ where: {idProductionOrder }, transaction: t });
        await ProductionOrderSupply.destroy({ where: {idProductionOrder }, transaction: t });

        await productionOrderRepo.deleteOrderById(idProductionOrder, t); // El repo ya no necesita borrar detalles si la FK tiene CASCADE
        
        await t.commit();
        return { message: "Orden de producción eliminada exitosamente." };
    } catch (error) {
        await t.rollback();
        console.error("Error en service deleteProductionOrder:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al eliminar la orden: ${error.message}`);
    }
};

module.exports = {
    createProductionOrder,
    getAllProductionOrders,
    getProductionOrderById,
    updateProductionOrder, // Renombrado
    updateProductionOrderStep,
    finalizeProductionOrder,
    changeProductionOrderStatus,
    deleteProductionOrder,
};