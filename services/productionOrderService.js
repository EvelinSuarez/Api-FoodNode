// RUTA: /services/productionOrderService.js
// VERSIÓN TOTALMENTE COMPLETA Y FINAL (Lógica por Peso)

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


// --- FUNCIÓN PRIVADA MODIFICADA: AHORA CALCULA BASADO EN PESO ---
const _calculateAndVerifySupplyNeedsByWeight = async (data, transaction = null) => {
    const { idSpecSheet, targetProductionWeight, targetProductionWeightUnit } = data;

    const specSheet = await SpecSheet.findOne({
        where: { idSpecSheet },
        include: [{ model: SpecSheetSupply, as: 'specSheetSupplies', include: [{ model: Supply, as: 'supply' }] }],
        transaction
    });

    if (!specSheet || !specSheet.specSheetSupplies || specSheet.specSheetSupplies.length === 0) {
        return { sufficient: false, message: "La ficha técnica no tiene insumos definidos.", details: [] };
    }

    const targetWeightGrams = convertToBaseUnit(targetProductionWeight, targetProductionWeightUnit);
    const recipeYieldGrams = parseFloat(specSheet.quantityBase);

    if (isNaN(targetWeightGrams) || targetWeightGrams <= 0) {
        return { sufficient: false, message: "El peso a producir es inválido.", details: [] };
    }
    if (isNaN(recipeYieldGrams) || recipeYieldGrams <= 0) {
        return { sufficient: false, message: `El rendimiento base (quantityBase) de la ficha técnica ID ${idSpecSheet} es inválido o cero.`, details: [] };
    }

    const scaleFactor = targetWeightGrams / recipeYieldGrams;

    const neededSuppliesDetails = [];
    let isSufficient = true;

    for (const specSupply of specSheet.specSheetSupplies) {
        const supplyItem = specSupply.supply;
        if (!supplyItem) {
            neededSuppliesDetails.push({ name: `Insumo ID ${specSupply.idSupply}`, sufficient: false, message: 'Insumo no encontrado.' });
            isSufficient = false;
            continue;
        }

        const quantityInRecipeGrams = parseFloat(specSupply.quantity);
        const totalQuantityNeededGrams = quantityInRecipeGrams * scaleFactor;
        
        const requiredInStockUnit = totalQuantityNeededGrams / 1000; // de gramos a kg
        const currentStock = Number(supplyItem.stock);
        const supplySufficient = currentStock >= requiredInStockUnit;

        if (!supplySufficient) { isSufficient = false; }

        neededSuppliesDetails.push({
            idSupply: supplyItem.idSupply,
            name: supplyItem.supplyName,
            needed: `${requiredInStockUnit.toFixed(3)} ${supplyItem.measurementUnit || 'kg'}`,
            available: `${currentStock.toFixed(3)} ${supplyItem.measurementUnit || 'kg'}`,
            sufficient: supplySufficient,
            neededNumeric: requiredInStockUnit
        });
    }
    
    const overallMessage = isSufficient ? "Stock suficiente para la producción." : "Stock insuficiente. Revisa los detalles de los insumos requeridos.";

    return { sufficient: isSufficient, message: overallMessage, details: neededSuppliesDetails };
};

const createProductionOrder = async (orderData) => {
    const t = await sequelize.transaction();
    try {
        const {
            idProduct, status, idSpecSheet, idEmployeeRegistered, initialAmount,
            targetProductionWeight, targetProductionWeightUnit, productNameSnapshot, observations, idProvider
        } = orderData;
        
        const newOrderPayload = {
            idProduct: idProduct ? parseInt(idProduct) : null,
            idSpecSheet: idSpecSheet ? parseInt(idSpecSheet) : null,
            idEmployeeRegistered: idEmployeeRegistered ? parseInt(idEmployeeRegistered) : null,
            initialAmount: initialAmount != null ? parseFloat(initialAmount) : 0,
            productNameSnapshot: productNameSnapshot || "(Producto pendiente)",
            status: status || 'PENDING',
            targetProductionWeight: (targetProductionWeight != null && !isNaN(parseFloat(targetProductionWeight))) ? parseFloat(targetProductionWeight) : null,
            targetProductionWeightUnit: targetProductionWeightUnit || 'kg',
            observations: observations || null,
            idProvider: idProvider ? parseInt(idProvider) : null,
        };
        
        const createdOrder = await ProductionOrder.create(newOrderPayload, { transaction: t });

        if (newOrderPayload.status === 'SETUP_COMPLETED' && newOrderPayload.idSpecSheet) {
            const specSheet = await SpecSheet.findOne({
                where: { idSpecSheet: newOrderPayload.idSpecSheet, status: true },
                include: [{ model: SpecSheetProcess, as: 'specSheetProcesses', include: [{ model: Process, as: 'masterProcessData' }] }],
                transaction: t
            });

            if (!specSheet || !specSheet.specSheetProcesses || specSheet.specSheetProcesses.length === 0) {
                throw new BadRequestError(`La ficha técnica ID ${newOrderPayload.idSpecSheet} no es válida o no tiene procesos.`);
            }

            const specProcesses = specSheet.specSheetProcesses.sort((a, b) => a.processOrder - b.processOrder);
            const stepDetailsData = specProcesses.map(sp => ({
                idProductionOrder: createdOrder.idProductionOrder,
                idProcess: sp.masterProcessData.idProcess,
                processOrder: sp.processOrder,
                processNameSnapshot: sp.processNameOverride || sp.masterProcessData.processName,
                processDescriptionSnapshot: sp.processDescriptionOverride || sp.masterProcessData.description,
                status: 'PENDING'
            }));
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
        if (!order) throw new NotFoundError(`Orden ID ${idProductionOrder} no encontrada.`);
        if (order.status !== 'SETUP_COMPLETED') {
            throw new BadRequestError(`La orden no se puede iniciar, su estado es '${order.status}'.`);
        }

        const stockCheck = await _calculateAndVerifySupplyNeedsByWeight({ 
            idSpecSheet: order.idSpecSheet, 
            targetProductionWeight: order.targetProductionWeight,
            targetProductionWeightUnit: order.targetProductionWeightUnit
        }, t);

        if (!stockCheck.sufficient) {
            const insufficientItem = stockCheck.details.find(d => !d.sufficient);
            throw new BadRequestError(`Stock insuficiente para '${insufficientItem.name}'. Requerido: ${insufficientItem.needed}, Disponible: ${insufficientItem.available}.`);
        }

        for (const supplyDetail of stockCheck.details) {
            await Supply.decrement('stock', {
                by: supplyDetail.neededNumeric,
                where: { idSupply: supplyDetail.idSupply },
                transaction: t
            });
        }

        await order.update({ status: 'IN_PROGRESS' }, { transaction: t });
        await ProductionOrderDetail.update(
            { status: 'IN_PROGRESS', startDate: new Date(), idEmployeeAssigned: idEmployeeAssigned },
            { where: { idProductionOrder: idProductionOrder, processOrder: 1 }, transaction: t }
        );

        await t.commit();
        return productionOrderRepo.findOrderByIdWithDetails(idProductionOrder);

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error("Error detallado en startProductionAndDeductSupplies:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al iniciar la producción: ${error.message}`);
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