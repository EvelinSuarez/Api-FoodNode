// repositories/productionOrderRepository.js
const { ProductionOrder, ProductionOrderDetail, Product, SpecSheet, Employee, 
    Provider, Process, Supply, ProductionOrderSupply, sequelize } = require('../models');
const { Op } = require('sequelize');

const createOrderWithDetails = async (orderData, stepDetailsData, transaction) => {
    const newOrder = await ProductionOrder.create(orderData, { transaction });
    if (stepDetailsData && stepDetailsData.length > 0) {
        const stepsToCreate = stepDetailsData.map(step => ({
            ...step,
            idProductionOrder: newOrder.idProductionOrder // Enlazar al ID de la orden recién creada
        }));
        await ProductionOrderDetail.bulkCreate(stepsToCreate, { transaction });
    }
    // Devolver la orden con sus pasos recién creados
    return ProductionOrder.findByPk(newOrder.idProductionOrder, {
        include: [{ model: ProductionOrderDetail, as: 'productionOrderDetails' }],
        transaction
    });
};

const findOrderByIdWithDetails = async (idProductionOrder) => {
    return ProductionOrder.findByPk(idProductionOrder, {
        include: [
            { model: Product, as: 'product' },
            { model: SpecSheet, as: 'specSheet' }, // Podrías incluir los detalles de la ficha aquí también
            { model: Employee, as: 'employeeRegistered' },
            { model: Provider, as: 'provider' },
            {
                model: ProductionOrderDetail,
                as: 'productionOrderDetails',
                include: [
                    { model: Process, as: 'processDetails' },
                    { model: Employee, as: 'employeeAssigned' }
                ],
                order: [['processOrder', 'ASC']] // Ordenar los pasos
            },
            {
                model: ProductionOrderSupply, // Insumos consumidos
                as: 'productionOrderSupplies',
                include: [{ model: Supply, as: 'supply' }]
            }
        ]
    });
};

const deleteOrderDetailsByOrderId = async (idProductionOrder, transaction) => {
    console.log(`[ProductionOrderRepo] Deleting order details (ProductionOrderDetail) for order ID: ${idProductionOrder}`);
    return ProductionOrderDetail.destroy({ // Usa el modelo ProductionOrderDetail directamente
        where: { idProductionOrder: idProductionOrder },
        transaction
    });
};

const findAllOrders = async (/* queryOptions = {} */) => {
    // const { limit, offset, whereClause } = queryOptions; // Para paginación y filtros
    return ProductionOrder.findAll({
        // where: whereClause,
        // limit,
        // offset,
        include: [ // Incluir info básica para el listado
            { model: Product, as: 'product', attributes: ['idProduct', 'productName'] },
            { model: Employee, as: 'employeeRegistered', attributes: ['idEmployee', 'fullName'] } // O fullName si lo tienes
        ],
        order: [['dateTimeCreation', 'DESC']]
    });
};

const updateOrderGeneral = async (idProductionOrder, dataToUpdate, transaction) => {
    const [affectedRows] = await ProductionOrder.update(dataToUpdate, {
        where: { idProductionOrder },
        transaction
    });
    return affectedRows > 0;
};

const findStepById = async (idProductionOrderDetail, transaction) => {
    return ProductionOrderDetail.findByPk(idProductionOrderDetail, { transaction });
};

const updateStep = async (idProductionOrderDetail, stepData, transaction) => {
    const [affectedRows] = await ProductionOrderDetail.update(stepData, {
        where: { idProductionOrderDetail },
        transaction
    });
    return affectedRows > 0;
};

const addConsumedSupplies = async (idProductionOrder, supplies, transaction) => {
    if (!supplies || supplies.length === 0) return;
    const suppliesToCreate = supplies.map(s => ({
        idProductionOrder,
        idSupply: s.idSupply,
        quantityConsumed: s.quantityConsumed,
        notes: s.notes
    }));
    // Opción 1: Borrar existentes y añadir nuevos (si se actualizan los consumos)
    // await ProductionOrderSupply.destroy({ where: { idProductionOrder }, transaction });
    // await ProductionOrderSupply.bulkCreate(suppliesToCreate, { transaction });
    // Opción 2: Solo añadir nuevos (si es un registro incremental)
    return ProductionOrderSupply.bulkCreate(suppliesToCreate, { transaction });
};


const deleteOrderById = async (idProductionOrder, transaction) => {
    // ProductionOrderDetails se borran en cascada si se definió onDelete: 'CASCADE'
    // También podrías necesitar borrar ProductionOrderSupply si no está en cascada
    await ProductionOrderSupply.destroy({ where: { idProductionOrder }, transaction });
    const deletedCount = await ProductionOrder.destroy({
        where: { idProductionOrder },
        transaction
    });
    return deletedCount > 0;
};

const findOrderById = async (idProductionOrder, transaction) => {
    return ProductionOrder.findByPk(idProductionOrder, { transaction });
};


module.exports = {
    createOrderWithDetails,
    findOrderByIdWithDetails,
    findAllOrders,
    updateOrderGeneral,
    findStepById,
    updateStep,
    addConsumedSupplies,
    deleteOrderById,
    findOrderById, // Para uso interno del servicio, sin detalles
    deleteOrderDetailsByOrderId
};