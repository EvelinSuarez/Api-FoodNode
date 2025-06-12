// Archivo: services/productionOrderService.js
// VERSIÓN CORREGIDA FINAL

const productionOrderRepo = require('../repositories/productionOrderRepository');
const {
    ProductionOrder,
    SpecSheet,
    SpecSheetProcess,
    Product,
    Employee,
    Provider,
    Process,
    ProductionOrderDetail,
    sequelize
} = require('../models');
const { NotFoundError, BadRequestError, ApplicationError } = require('../utils/customErrors');
const { Op } = require('sequelize');


const createProductionOrder = async (orderData) => {
    console.log('[SERVICE - createProductionOrder] Datos recibidos:', JSON.stringify(orderData, null, 2));
    const t = await sequelize.transaction();
    try {
        const {
            idProduct,
            status,
            idSpecSheet: providedSpecSheetId,
            idEmployeeRegistered,
            initialAmount,
            inputInitialWeight,
            inputInitialWeightUnit,
            productNameSnapshot: providedProductNameSnapshot,
            observations,
            idProvider,
        } = orderData;
        
        if (idProduct && ['PENDING', 'SETUP'].includes(status)) {
             const conflictingOrder = await ProductionOrder.findOne({
                where: {
                    idProduct: idProduct,
                    status: { [Op.notIn]: ['COMPLETED', 'CANCELLED'] },
                },
                transaction: t
            });

            if (conflictingOrder) {
                await t.rollback();
                throw new BadRequestError(`No se puede crear la orden. Ya existe una orden activa (ID: ${conflictingOrder.idProductionOrder}) para este producto.`);
            }
        }

        let productNameSnapshotToUse = providedProductNameSnapshot;

        if ((!productNameSnapshotToUse || productNameSnapshotToUse.trim() === "") && idProduct) {
            const product = await Product.findByPk(idProduct, { transaction: t });
            if (!product) {
                await t.rollback();
                throw new NotFoundError(`Producto con ID ${idProduct} no encontrado al crear orden.`);
            }
            productNameSnapshotToUse = product.productName;
        } else if (!productNameSnapshotToUse || productNameSnapshotToUse.trim() === "") {
            productNameSnapshotToUse = "(Orden Pendiente de Producto)";
        }

        const newOrderPayload = {
            idProduct: idProduct ? parseInt(idProduct) : null,
            idSpecSheet: providedSpecSheetId ? parseInt(providedSpecSheetId) : null,
            idEmployeeRegistered: idEmployeeRegistered ? parseInt(idEmployeeRegistered) : null,
            initialAmount: initialAmount != null ? parseFloat(initialAmount) : 0,
            productNameSnapshot: productNameSnapshotToUse,
            status: status || 'PENDING',
            inputInitialWeight: (inputInitialWeight !== undefined && inputInitialWeight !== null && inputInitialWeight.toString().trim() !== "" && !isNaN(parseFloat(inputInitialWeight)))
                                ? parseFloat(inputInitialWeight)
                                : null,
            inputInitialWeightUnit: null,
            observations: observations || null,
            idProvider: idProvider ? parseInt(idProvider) : null,
            finalQuantityProduct: null,
            finishedProductWeight: null,
            finishedProductWeightUnit: null,
            inputFinalWeightUnused: null,
            inputFinalWeightUnusedUnit: null,
        };

        if (newOrderPayload.inputInitialWeight !== null && newOrderPayload.inputInitialWeight > 0) {
            newOrderPayload.inputInitialWeightUnit = inputInitialWeightUnit || 'kg';
        } else {
            newOrderPayload.inputInitialWeightUnit = null;
        }
        
        console.log('[SERVICE - createProductionOrder] Payload para el repositorio (cabecera):', JSON.stringify(newOrderPayload, null, 2));
        
        // Se usa create, no createOrderWithDetails
        const createdOrder = await ProductionOrder.create(newOrderPayload, { transaction: t });
        
        await t.commit();
        console.log('[SERVICE - createProductionOrder] Transacción committed.');
        
        // <<<--- CORRECCIÓN 2: Se usa findOrderByIdWithDetails para devolver la orden completa --- >>>
        return productionOrderRepo.findOrderByIdWithDetails(createdOrder.idProductionOrder);

    } catch (error) {
        console.error("[SERVICE - createProductionOrder] Error capturado:", error.name, error.message);
        if (t && !t.finished) {
             try { await t.rollback(); console.log('[SERVICE - createProductionOrder] Rollback ejecutado.'); }
             catch (rbError) { console.error('[SERVICE - createProductionOrder] Error en Rollback:', rbError);}
        }
        if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ApplicationError) throw error;
        throw new ApplicationError(`Error al crear la orden de producción: ${error.message}`);
    }
};

// ... (El resto de las funciones como updateProductionOrder, getAllProductionOrders, etc., no cambian y ya están correctas)
// ... (Pega aquí el resto de tus funciones de servicio del backend)
const getAllProductionOrders = async (queryFilters = {}) => {
    const { status, status_not_in, idProduct, idEmployeeRegistered, page, limit, sortBy, sortOrder } = queryFilters;
    let whereClause = {};
    if (status) {
        const statuses = status.split(',').map(s => s.trim().toUpperCase());
        whereClause.status = { [Op.in]: statuses };
    }
    if (status_not_in) {
        const statusesNotIn = status_not_in.split(',').map(s => s.trim().toUpperCase());
        whereClause.status = { ...whereClause.status, [Op.notIn]: statusesNotIn };
    }
    if (idProduct) whereClause.idProduct = parseInt(idProduct);
    if (idEmployeeRegistered) whereClause.idEmployeeRegistered = parseInt(idEmployeeRegistered);

    const queryOptions = { whereClause };
    if (limit && page) {
        queryOptions.limit = parseInt(limit);
        queryOptions.offset = (parseInt(page) - 1) * queryOptions.limit;
    }
    if (sortBy && sortOrder) {
        queryOptions.orderClause = [[sortBy, sortOrder.toUpperCase()]];
    }
    return productionOrderRepo.findAllOrders(queryOptions);
};

const getProductionOrderById = async (idProductionOrder) => {
    const order = await productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    if (!order) {
        throw new NotFoundError(`Orden de producción con ID ${idProductionOrder} no encontrada.`);
    }
    return order;
};

const getActiveOrdersByProductId = async (productId) => {
    if (!productId || isNaN(parseInt(productId))) {
        return [];
    }
    return ProductionOrder.findAll({
        where: {
            idProduct: parseInt(productId),
            status: {
                [Op.notIn]: ['COMPLETED', 'CANCELLED']
            }
        },
        attributes: ['idProductionOrder', 'status']
    });
};

const updateProductionOrder = async (idProductionOrder, dataToUpdate) => {
    console.log(`[SERVICE - updateProductionOrder] Iniciando para Orden ID: ${idProductionOrder}. Payload:`, JSON.stringify(dataToUpdate, null, 2));
    const t = await sequelize.transaction();
    try {
        const order = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!order) {
            await t.rollback();
            throw new NotFoundError(`Orden de producción ID ${idProductionOrder} no encontrada.`);
        }

        const targetStatus = dataToUpdate.status || order.status;
        const targetProductId = dataToUpdate.hasOwnProperty('idProduct') ? dataToUpdate.idProduct : order.idProduct;

        if (['IN_PROGRESS', 'SETUP_COMPLETED', 'PAUSED'].includes(targetStatus) && targetProductId) {
            const conflictingOrder = await ProductionOrder.findOne({
                where: {
                    idProduct: targetProductId,
                    status: { [Op.notIn]: ['COMPLETED', 'CANCELLED'] },
                    idProductionOrder: { [Op.ne]: idProductionOrder }
                },
                transaction: t
            });

            if (conflictingOrder) {
                await t.rollback();
                throw new BadRequestError(`Ya existe una orden activa (ID: ${conflictingOrder.idProductionOrder}) para este producto. No puede iniciar una nueva hasta que la anterior sea completada o cancelada.`);
            }
        }

        if ((order.status === 'COMPLETED' || order.status === 'CANCELLED') &&
            Object.keys(dataToUpdate).some(key => !['observations'].includes(key))) {
            await t.rollback();
            throw new BadRequestError('Solo se pueden modificar observaciones de una orden completada o cancelada.');
        }

        const updatePayload = { ...dataToUpdate };

        if (dataToUpdate.idProduct !== undefined && String(dataToUpdate.idProduct) !== String(order.idProduct)) {
            console.log(`[SERVICE] Producto cambiado. Anterior: ${order.idProduct}, Nuevo: ${dataToUpdate.idProduct}`);
            if (dataToUpdate.idProduct === null || dataToUpdate.idProduct === '') {
                updatePayload.productNameSnapshot = "(Orden Pendiente de Producto)";
                updatePayload.idSpecSheet = null;
                await productionOrderRepo.deleteOrderDetailsByOrderId(idProductionOrder, t);
            } else {
                const product = await Product.findByPk(dataToUpdate.idProduct, { transaction: t });
                if (!product) { await t.rollback(); throw new NotFoundError(`Producto ID ${dataToUpdate.idProduct} no encontrado.`); }
                updatePayload.productNameSnapshot = product.productName;
                if (dataToUpdate.idSpecSheet === undefined) updatePayload.idSpecSheet = null;
                await productionOrderRepo.deleteOrderDetailsByOrderId(idProductionOrder, t);
            }
        }

        const newSpecSheetId = dataToUpdate.idSpecSheet !== undefined
            ? (dataToUpdate.idSpecSheet === '' || dataToUpdate.idSpecSheet === null ? null : parseInt(dataToUpdate.idSpecSheet))
            : order.idSpecSheet;

        const specSheetActuallyChanged = dataToUpdate.idSpecSheet !== undefined && newSpecSheetId !== order.idSpecSheet;
        
        let shouldSyncProductionOrderDetails = specSheetActuallyChanged;
        if (!shouldSyncProductionOrderDetails && newSpecSheetId &&
            ['SETUP_COMPLETED', 'IN_PROGRESS'].includes(dataToUpdate.status || order.status) &&
            !['SETUP_COMPLETED', 'IN_PROGRESS', 'PAUSED', 'ALL_STEPS_COMPLETED'].includes(order.status)
        ) {
            shouldSyncProductionOrderDetails = true;
        }

        if (newSpecSheetId && shouldSyncProductionOrderDetails) {
            const currentTargetProductId = updatePayload.idProduct !== undefined ? (updatePayload.idProduct === '' ? null : updatePayload.idProduct) : order.idProduct;
            if (!currentTargetProductId) { await t.rollback(); throw new BadRequestError("Se requiere un producto para asignar una ficha técnica.");}
            
            const specSheet = await SpecSheet.findOne({
                where: { idSpecSheet: newSpecSheetId, idProduct: currentTargetProductId, status: true },
                transaction: t
            });
            if (!specSheet) { await t.rollback(); throw new BadRequestError(`Ficha técnica ID ${newSpecSheetId} no es válida, no está activa o no pertenece al producto.`);}
            updatePayload.idSpecSheet = specSheet.idSpecSheet;

            const specProcesses = await SpecSheetProcess.findAll({
                where: { idSpecSheet: specSheet.idSpecSheet },
                order: [['processOrder', 'ASC']],
                include: [{ model: Process, as: 'masterProcessData' }],
                transaction: t
            });
            
            await productionOrderRepo.deleteOrderDetailsByOrderId(idProductionOrder, t);
            
            if (specProcesses && specProcesses.length > 0) {
                const stepDetailsData = specProcesses.map(sp => ({
                    idProductionOrder: parseInt(idProductionOrder),
                    idProcess: (sp.idProcess || sp.masterProcessData?.idProcess) ? parseInt(sp.idProcess || sp.masterProcessData.idProcess) : null,
                    processOrder: sp.processOrder,
                    processNameSnapshot: sp.processNameOverride || sp.masterProcessData?.processName || 'Proceso Desconocido',
                    processDescriptionSnapshot: sp.processDescriptionOverride || sp.masterProcessData?.description || 'Sin descripción.',
                    estimatedTimeMinutes: sp.estimatedTimeMinutes ?? sp.masterProcessData?.estimatedTimeMinutes,
                    status: 'PENDING'
                }));
                await ProductionOrderDetail.bulkCreate(stepDetailsData, { transaction: t, validate: true });
            }
        } else if (newSpecSheetId === null && order.idSpecSheet !== null) {
            await productionOrderRepo.deleteOrderDetailsByOrderId(idProductionOrder, t);
            updatePayload.idSpecSheet = null;
        }

        if (dataToUpdate.hasOwnProperty('inputInitialWeight')) {
            const newWeight = dataToUpdate.inputInitialWeight;
            if (newWeight !== null && newWeight !== '' && !isNaN(parseFloat(newWeight)) && parseFloat(newWeight) >= 0) {
                updatePayload.inputInitialWeight = parseFloat(newWeight);
                updatePayload.inputInitialWeightUnit = (parseFloat(newWeight) === 0) ? null : (dataToUpdate.inputInitialWeightUnit || order.inputInitialWeightUnit || 'kg');
            } else {
                updatePayload.inputInitialWeight = null;
                updatePayload.inputInitialWeightUnit = null;
            }
        }

        Object.keys(updatePayload).forEach(key => {
            if (key !== 'observations' && updatePayload[key] === '') updatePayload[key] = null;
        });
        if (updatePayload.observations === '') updatePayload.observations = null;

        await productionOrderRepo.updateOrder(idProductionOrder, updatePayload, t);
        
        await t.commit();
        console.log(`[SERVICE - updateProductionOrder] Transacción committed para Orden ID: ${idProductionOrder}.`);

        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);

    } catch (error) {
        console.error("[SERVICE - updateProductionOrder] Error capturado:", error.name, error.message);
        if (t && !t.finished) {
            try { await t.rollback(); console.log('[SERVICE - updateProductionOrder] Rollback ejecutado.'); }
            catch (rbError) { console.error('[SERVICE - updateProductionOrder] Error en Rollback:', rbError); }
        }
        if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ApplicationError) throw error;
        throw new ApplicationError(`Error al actualizar la orden de producción: ${error.message}`);
    }
};

const updateProductionOrderStep = async (idProductionOrder, idProductionOrderDetail, stepData) => {
    const t = await sequelize.transaction();
    try {
        const order = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!order) { await t.rollback(); throw new NotFoundError(`Orden ID ${idProductionOrder} no encontrada.`); }
        
        if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
            await t.rollback();
            throw new BadRequestError(`No se pueden actualizar pasos de una orden ${order.status}.`);
        }
        if (['PENDING', 'SETUP'].includes(order.status) && stepData.status !== 'SKIPPED') {
            await t.rollback();
            throw new BadRequestError(`La orden debe estar al menos en 'SETUP_COMPLETED' para gestionar pasos.`);
        }

        const step = await ProductionOrderDetail.findByPk(idProductionOrderDetail, { transaction: t });
        if (!step || parseInt(step.idProductionOrder) !== parseInt(idProductionOrder)) {
            await t.rollback();
            throw new NotFoundError(`Paso ID ${idProductionOrderDetail} no encontrado o no pertenece a la orden.`);
        }
        
        const allowedFields = ['idEmployeeAssigned', 'startDate', 'endDate', 'status', 'observations'];
        const filteredStepData = Object.keys(stepData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => { obj[key] = stepData[key] === '' ? null : stepData[key]; return obj; }, {});
        
        if (Object.keys(filteredStepData).length === 0) {
             await t.rollback();
             throw new BadRequestError("No se proporcionaron datos válidos para actualizar.");
        }
        
        await productionOrderRepo.updateStep(idProductionOrderDetail, filteredStepData, t);

        let orderStatusChanged = false;
        let newOrderStatus = order.status;

        if (filteredStepData.status === 'IN_PROGRESS' && ['SETUP_COMPLETED', 'PAUSED'].includes(order.status)) {
            newOrderStatus = 'IN_PROGRESS';
            orderStatusChanged = true;
        } else if (filteredStepData.status === 'COMPLETED') {
            const allSteps = await ProductionOrderDetail.findAll({ where: { idProductionOrder }, transaction: t });
            const allStepsNowCompletedOrSkipped = allSteps.every(s => (s.idProductionOrderDetail.toString() === idProductionOrderDetail.toString() ? filteredStepData.status === 'COMPLETED' : s.status === 'COMPLETED' || s.status === 'SKIPPED'));
            
            if (allStepsNowCompletedOrSkipped && !['ALL_STEPS_COMPLETED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
                newOrderStatus = 'ALL_STEPS_COMPLETED';
                orderStatusChanged = true;
            }
        }
        
        if (orderStatusChanged) {
            await productionOrderRepo.updateOrder(idProductionOrder, { status: newOrderStatus }, t);
        }
        
        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    } catch (error) {
        if (t && !t.finished) { try { await t.rollback(); } catch (rbError) {} }
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al actualizar el paso: ${error.message}`);
    }
};

const finalizeProductionOrder = async (idProductionOrder, finalizeData) => {
    const t = await sequelize.transaction();
    try {
        const order = await productionOrderRepo.findOrderById(idProductionOrder, t);
        if (!order) {
            await t.rollback();
            throw new NotFoundError(`Orden ID ${idProductionOrder} no encontrada.`);
        }
        
        // 1. Desestructurar TODOS los campos esperados del frontend
        const {
            finalQuantityProduct,
            finishedProductWeight,
            finishedProductWeightUnit,
            inputFinalWeightUnused,
            inputFinalWeightUnusedUnit,
            observations
        } = finalizeData;

        // 2. Construir el payload de actualización de forma segura
        const updateData = {
            status: 'COMPLETED',
            // Usa las observaciones de finalización; si no hay, mantiene las existentes.
            observations: observations || order.observations 
        };

        // 3. Procesar y añadir cada campo numérico y su unidad condicionalmente
        if (finalQuantityProduct !== null && finalQuantityProduct !== undefined) {
            updateData.finalQuantityProduct = parseFloat(finalQuantityProduct);
        }

        if (finishedProductWeight !== null && finishedProductWeight !== undefined && String(finishedProductWeight).trim() !== '') {
            const weight = parseFloat(finishedProductWeight);
            if (!isNaN(weight) && weight >= 0) {
                updateData.finishedProductWeight = weight;
                // La unidad solo se guarda si el peso es mayor que 0
                updateData.finishedProductWeightUnit = weight > 0 ? (finishedProductWeightUnit || 'kg') : null;
            }
        } else {
             updateData.finishedProductWeight = null;
             updateData.finishedProductWeightUnit = null;
        }

        if (inputFinalWeightUnused !== null && inputFinalWeightUnused !== undefined && String(inputFinalWeightUnused).trim() !== '') {
            const unusedWeight = parseFloat(inputFinalWeightUnused);
            if (!isNaN(unusedWeight) && unusedWeight >= 0) {
                updateData.inputFinalWeightUnused = unusedWeight;
                // La unidad solo se guarda si el peso es mayor que 0
                updateData.inputFinalWeightUnusedUnit = unusedWeight > 0 ? (inputFinalWeightUnusedUnit || 'kg') : null;
            }
        } else {
            updateData.inputFinalWeightUnused = null;
            updateData.inputFinalWeightUnusedUnit = null;
        }

        console.log(`[SERVICE - finalizeProductionOrder] Payload final para actualizar:`, updateData);
        
        // 4. Llamar al repositorio con el objeto de actualización completo
        await productionOrderRepo.updateOrder(idProductionOrder, updateData, t);
        
        await t.commit();
        
        // 5. Devolver la orden completa y actualizada
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);

    } catch (error) {
        if (t && !t.finished) {
            try { await t.rollback(); } catch (rbError) { console.error("Error en rollback de finalización:", rbError); }
        }
        // Propagar el error para que el controlador lo maneje
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al finalizar la orden de producción: ${error.message}`);
    }
};

const changeProductionOrderStatus = async (idProductionOrder, newStatus, observationsForChange) => {
    const t = await sequelize.transaction();
    try {
        const order = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!order) { await t.rollback(); throw new NotFoundError(`Orden ID ${idProductionOrder} no encontrada.`); }

        const updatePayload = { status: newStatus };
        if (observationsForChange) {
            updatePayload.observations = (order.observations || '') + `\n[Cambio a ${newStatus}]: ${observationsForChange}`;
        }

        await productionOrderRepo.updateOrder(idProductionOrder, updatePayload, t);
        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    } catch (error) {
        if (t && !t.finished) { try { await t.rollback(); } catch (rbError) {} }
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al cambiar estado: ${error.message}`);
    }
};

const deleteProductionOrder = async (idProductionOrder) => {
    const t = await sequelize.transaction();
    try {
        const order = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!order) { await t.rollback(); throw new NotFoundError(`Orden ID ${idProductionOrder} no encontrada.`); }
        
        if (['IN_PROGRESS', 'COMPLETED'].includes(order.status)) {
            await t.rollback();
            throw new BadRequestError(`No se puede eliminar una orden en estado: ${order.status}.`);
        }

        await productionOrderRepo.deleteOrderById(idProductionOrder, t);
        await t.commit();
        return { message: "Orden de producción eliminada exitosamente." };
    } catch (error) {
        if (t && !t.finished) { try { await t.rollback(); } catch (rbError) {} }
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al eliminar: ${error.message}`);
    }
};

module.exports = {
    createProductionOrder,
    getAllProductionOrders,
    getProductionOrderById,
    getActiveOrdersByProductId,
    updateProductionOrder,
    updateProductionOrderStep,
    finalizeProductionOrder,
    changeProductionOrderStatus,
    deleteProductionOrder,
};