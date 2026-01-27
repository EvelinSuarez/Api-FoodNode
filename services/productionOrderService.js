
const productionOrderRepo = require('../repositories/productionOrderRepository');
const {
    ProductionOrder, SpecSheet, SpecSheetProcess, SpecSheetSupply, Supply,
    Product, Employee, Provider, Process, ProductionOrderDetail, sequelize
} = require('../models');
const { NotFoundError, BadRequestError, ApplicationError } = require('../utils/customErrors');
const { Op } = require('sequelize');

// Función de utilidad para convertir unidades, puede estar en otro archivo si prefieres
const convertToBaseUnit = (quantity, unit) => {
    const qty = parseFloat(quantity);
    if (isNaN(qty)) return 0;
    const u = String(unit)?.toLowerCase() || 'g';
    if (u.includes('kg')) return qty * 1000;
    return qty; // Asume gramos si no es kg
};


const _calculateAndVerifySupplyNeedsByWeight = async (data, transaction = null) => {
    // Usamos nombres genéricos y aceptamos varias posibilidades para evitar el error de "undefined"
    const idSpecSheet = data.idSpecSheet;
    
    // Intentamos leer de 'targetProductionWeight' O de 'inputInitialWeight'
    const rawWeight = data.targetProductionWeight || data.inputInitialWeight || 0;
    const rawUnit = data.targetProductionWeightUnit || data.inputInitialWeightUnit || 'kg';
    
    const targetProductionWeight = parseFloat(rawWeight);
    const targetProductionWeightUnit = String(rawUnit);

    const specSheet = await SpecSheet.findOne({
        where: { idSpecSheet },
        include: [{ 
            model: SpecSheetSupply, 
            as: 'specSheetSupplies', 
            include: [{ model: Supply, as: 'supply' }] 
        }],
        transaction
    });

    if (!specSheet) throw new Error("Ficha técnica no encontrada.");

    // Cálculo del multiplicador (Scale Factor)
    const targetWeightGrams = convertToBaseUnit(targetProductionWeight, targetProductionWeightUnit);
    const recipeYieldGrams = parseFloat(specSheet.quantityBase) || 1000;
    
    // Log para verificar que ya no sea 0
    console.log(`[DEBUG] Peso calculado: ${targetWeightGrams}g (Base: ${targetProductionWeight} ${targetProductionWeightUnit})`);
    
    const scaleFactor = targetWeightGrams / recipeYieldGrams;

    const neededSuppliesDetails = [];
    let isSufficient = true;

    for (const specSupply of specSheet.specSheetSupplies) {
        const supplyItem = specSupply.supply;
        if (!supplyItem) continue;

        const quantityInRecipeGrams = parseFloat(specSupply.quantity) || 0;
        const totalNeededGrams = quantityInRecipeGrams * scaleFactor;

        // Detectar unidad en DB (Seguimos usando tu columna unitOfMeasure)
        const dbUnit = (supplyItem.unitOfMeasure || '').toLowerCase();
        const isKg = dbUnit.includes('kg') || dbUnit.includes('kilo');

        // Valor a restar: Si la DB es KG, dividimos gramos por 1000
        const requiredForDB = isKg ? totalNeededGrams / 1000 : totalNeededGrams;
        const currentStock = parseFloat(supplyItem.stock) || 0;
        
        const supplySufficient = currentStock >= requiredForDB;
        if (!supplySufficient) isSufficient = false;

        neededSuppliesDetails.push({
            idSupply: supplyItem.idSupply,
            name: supplyItem.supplyName,
            neededNumeric: requiredForDB, // Valor real para el decrement
            sufficient: supplySufficient
        });
    }

    return { sufficient: isSufficient, details: neededSuppliesDetails };
};

const createProductionOrder = async (orderData) => {
    const t = await sequelize.transaction();
    try {
        const {
            idProduct, status, idSpecSheet, idEmployeeRegistered, initialAmount,
            targetProductionWeight, targetProductionWeightUnit, productNameSnapshot, observations, idProvider
        } = orderData;
        
        const newOrderPayload = {
            idProduct: orderData.idProduct ? parseInt(orderData.idProduct) : null,
            idSpecSheet: orderData.idSpecSheet ? parseInt(orderData.idSpecSheet) : null,
            idEmployeeRegistered: orderData.idEmployeeRegistered ? parseInt(orderData.idEmployeeRegistered) : null,
            initialAmount: orderData.initialAmount || 0,
            inputInitialWeight: orderData.targetProductionWeight || null, 
            inputInitialWeightUnit: orderData.targetProductionWeightUnit || 'kg',
            productNameSnapshot: orderData.productNameSnapshot || "",
            status: orderData.status || 'PENDING',
            observations: orderData.observations || null,
            idProvider: orderData.idProvider || null,
        };
        
        const createdOrder = await ProductionOrder.create(newOrderPayload, { transaction: t });

        if (newOrderPayload.status === 'SETUP_COMPLETED' && newOrderPayload.idSpecSheet) {
            const specSheet = await SpecSheet.findOne({
                where: { idSpecSheet: newOrderPayload.idSpecSheet, status: true },
                include: [{ 
                    model: SpecSheetProcess, 
                    as: 'specSheetProcesses', 
                    include: [{ model: Process, as: 'masterProcessData' }] 
                }],
                transaction: t
            });

            if (!specSheet || !specSheet.specSheetProcesses || specSheet.specSheetProcesses.length === 0) {
                throw new BadRequestError(`La ficha técnica ID ${newOrderPayload.idSpecSheet} no es válida.`);
            }

            // --- CAMBIO 1: Actualizar el tiempo total en la cabecera de la orden ---
            await createdOrder.update({ 
                totalEstimatedTime: specSheet.totalEstimatedTime || 0 
            }, { transaction: t });

            const specProcesses = specSheet.specSheetProcesses.sort((a, b) => a.processOrder - b.processOrder);

            const stepDetailsData = [];
            for (const sp of specProcesses) {
                const processIdFromSp = sp.idProcess || (sp.masterProcessData && sp.masterProcessData.idProcess);
                let masterProcess = sp.masterProcessData;

                if (!masterProcess) {
                    masterProcess = await Process.findByPk(processIdFromSp, { transaction: t });
                }

                stepDetailsData.push({
                    idProductionOrder: createdOrder.idProductionOrder,
                    idProcess: masterProcess.idProcess,
                    processOrder: sp.processOrder,
                    processNameSnapshot: sp.processNameOverride || masterProcess.processName,
                    processDescriptionSnapshot: sp.processDescriptionOverride || masterProcess.description,
                    
                    // --- CAMBIO 2: Copiar el tiempo estimado de cada paso ---
                    estimatedTimeMinutes: sp.estimatedTimeMinutes || 0, 
                    
                    status: 'PENDING'
                });
            }

            await ProductionOrderDetail.bulkCreate(stepDetailsData, { transaction: t, validate: true });
        }
        
        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(createdOrder.idProductionOrder);

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error("Error detallado en createProductionOrder:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al crear la orden de producción: ${error.message}`);
    }
};

const startProductionAndDeductSupplies = async (idProductionOrder, idEmployeeAssigned) => {
    const t = await sequelize.transaction();
    try {
        const order = await ProductionOrder.findByPk(idProductionOrder, { transaction: t, lock: t.LOCK.UPDATE });
        if (!order) throw new Error("Orden no encontrada.");

        // Pasamos TODO el objeto 'order' para que la función encuentre lo que necesita
        const stockCheck = await _calculateAndVerifySupplyNeedsByWeight(order, t);

        if (!stockCheck.sufficient) {
            throw new Error("No hay stock suficiente para iniciar la producción.");
        }

        for (const item of stockCheck.details) {
            console.log(`[LOG] RESTA FINAL: Insumo ${item.name} -> Cantidad: ${item.neededNumeric}`);

            if (item.neededNumeric > 0) {
                await Supply.decrement('stock', {
                    by: item.neededNumeric,
                    where: { idSupply: item.idSupply },
                    transaction: t
                });
            }
        }

        await order.update({ status: 'IN_PROGRESS' }, { transaction: t });
        
        await ProductionOrderDetail.update(
            { status: 'IN_PROGRESS', startDate: new Date(), idEmployeeAssigned: idEmployeeAssigned },
            { where: { idProductionOrder: idProductionOrder, processOrder: 1 }, transaction: t }
        );

        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    } catch (error) {
        if (t) await t.rollback();
        throw error;
    }
};

const checkStockForWeight = async (checkData) => {
    return _calculateAndVerifySupplyNeedsByWeight(checkData);
};

const finalizeProductionOrder = async (idProductionOrder, finalizeData) => {
    const t = await sequelize.transaction();
    try {
        const order = await productionOrderRepo.findOrderByIdWithDetails(idProductionOrder, t);
        if (!order) throw new NotFoundError(`Orden ID ${idProductionOrder} no encontrada.`);

        const { finalQuantityProduct, finishedProductWeight, finishedProductWeightUnit, observations } = finalizeData;
        const productionQuantity = parseFloat(finalQuantityProduct);
        if (isNaN(productionQuantity) || productionQuantity <= 0) {
            throw new BadRequestError("La cantidad final producida debe ser un número positivo.");
        }

        if (order.idProduct) {
            await Product.increment('currentStock', {
                by: productionQuantity,
                where: { idProduct: order.idProduct },
                transaction: t
            });
        }
        
        await productionOrderRepo.updateOrder(idProductionOrder, {
            status: 'COMPLETED',
            finalQuantityProduct: productionQuantity,
            finishedProductWeight: finishedProductWeight !== null ? parseFloat(finishedProductWeight) : null,
            finishedProductWeightUnit: finishedProductWeight !== null ? finishedProductWeightUnit : null,
            observations: observations || order.observations
        }, t);

        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    } catch (error) {
        await t.rollback();
        throw new ApplicationError(`Error al finalizar la orden: ${error.message}`);
    }
};

const getAllProductionOrders = async (queryFilters = {}) => {
    return productionOrderRepo.findAllOrders(queryFilters);
};

const getProductionOrderById = async (idProductionOrder) => {
    const order = await productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    if (!order) {
        throw new NotFoundError(`Orden de producción con ID ${idProductionOrder} no encontrada.`);
    }
    return order;
};

const updateProductionOrder = async (idProductionOrder, dataToUpdate) => {
    const t = await sequelize.transaction();
    try {
        const order = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!order) {
            throw new NotFoundError(`Orden ID ${idProductionOrder} no encontrada para actualizar.`);
        }
        await productionOrderRepo.updateOrder(idProductionOrder, dataToUpdate, t);
        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        throw new ApplicationError(`Error al actualizar la orden: ${error.message}`);
    }
};

const changeProductionOrderStatus = async (idProductionOrder, newStatus, observationsForChange) => {
    const t = await sequelize.transaction();
    try {
        const order = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!order) {
            await t.rollback();
            throw new NotFoundError(`Orden ID ${idProductionOrder} no encontrada.`);
        }
        
        await productionOrderRepo.updateOrder(idProductionOrder, {
            status: newStatus,
            observations: (order.observations || '') + `\n[Cambio a ${newStatus}]: ${observationsForChange}`
        }, t);
        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        throw new ApplicationError(`Error al cambiar estado: ${error.message}`);
    }
};

const updateProductionOrderStep = async (idProductionOrder, idProductionOrderDetail, stepData) => {
    const t = await sequelize.transaction();
    try {
        const order = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!order) {
            await t.rollback();
            throw new NotFoundError(`Orden ID ${idProductionOrder} no encontrada.`);
        }
        
        // --- NUEVA LÓGICA: Registro automático de tiempos ---
        const now = new Date();
        if (stepData.status === 'IN_PROGRESS' && !stepData.startDate) {
            stepData.startDate = now; // Guarda el inicio real si no viene del frontend
        } else if (stepData.status === 'COMPLETED' && !stepData.endDate) {
            stepData.endDate = now;   // Guarda el fin real si no viene del frontend
        }
        // ----------------------------------------------------

        await productionOrderRepo.updateStep(idProductionOrderDetail, stepData, t);
        
        let orderStatusChanged = false;
        let newOrderStatus = order.status;

        if (stepData.status === 'IN_PROGRESS' && ['SETUP_COMPLETED', 'PAUSED'].includes(order.status)) {
            newOrderStatus = 'IN_PROGRESS';
            orderStatusChanged = true;
        } else if (stepData.status === 'COMPLETED') {
            const allSteps = await ProductionOrderDetail.findAll({ where: { idProductionOrder }, transaction: t });
            const allCompleted = allSteps.every(s => s.status === 'COMPLETED' || s.status === 'SKIPPED');
            if (allCompleted) {
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
        if (t && !t.finished) await t.rollback();
        throw new ApplicationError(`Error al actualizar el paso: ${error.message}`);
    }
};

const deleteProductionOrder = async (idProductionOrder) => {
    const t = await sequelize.transaction();
    try {
        const order = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!order) {
            await t.rollback();
            throw new NotFoundError(`Orden ID ${idProductionOrder} no encontrada.`);
        }
        if (['IN_PROGRESS', 'COMPLETED'].includes(order.status)) {
            await t.rollback();
            throw new BadRequestError(`No se puede eliminar una orden en estado: ${order.status}. Considere cancelarla.`);
        }
        await productionOrderRepo.deleteOrderById(idProductionOrder, t);
        await t.commit();
        return { message: "Orden de producción eliminada." };
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        throw new ApplicationError(`Error al eliminar: ${error.message}`);
    }
};

const getActiveOrdersByProductId = async (productId) => {
    if (!productId || isNaN(parseInt(productId))) {
        return [];
    }
    return ProductionOrder.findAll({
        where: {
            idProduct: parseInt(productId),
            status: { [Op.notIn]: ['COMPLETED', 'CANCELLED'] }
        },
        attributes: ['idProductionOrder', 'status']
    });
};

module.exports = {
    createProductionOrder,
    startProductionAndDeductSupplies,
    checkStockForWeight,
    finalizeProductionOrder,
    getAllProductionOrders,
    getProductionOrderById,
    updateProductionOrder,
    changeProductionOrderStatus,
    updateProductionOrderStep,
    deleteProductionOrder,
    getActiveOrdersByProductId,
};