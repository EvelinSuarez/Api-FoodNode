// Archivo: repositories/productionOrderRepository.js
// VERSIÓN CORREGIDA FINAL: Se añade el include para SpecSheetProcess dentro de SpecSheet.

const {
    ProductionOrder,
    ProductionOrderDetail,
    Product,
    SpecSheet,
    Employee,
    Provider,
    Supply,
    Process, // <-- Asegúrate que Process esté importado
    SpecSheetSupply,
    SpecSheetProcess, // <-- Asegúrate que SpecSheetProcess esté importado
    sequelize
} = require('../models');
const { Op } = require('sequelize');

// --- CONFIGURACIONES DE INCLUDE REUTILIZABLES (CON TODAS LAS CORRECCIONES) ---

const detailedIncludeOptions = [
    { model: Product, as: 'product' },
    { 
        model: Employee, 
        as: 'employeeRegistered',
        attributes: ['idEmployee', 'fullName'] 
    },
    { 
        model: Provider, 
        as: 'provider',
        attributes: ['idProvider', 'company']
    },
    {
        model: SpecSheet,
        as: 'specSheet',
        include: [
            {
                model: SpecSheetSupply,
                as: 'specSheetSupplies',
                include: [{ model: Supply, as: 'supply' }]
            },
            // <<<--- CORRECCIÓN AÑADIDA AQUÍ --- >>>
            {
                model: SpecSheetProcess,
                as: 'specSheetProcesses',
                include: [{
                    model: Process,
                    as: 'masterProcessData' 
                }]
            }
        ]
    },
    {
        model: ProductionOrderDetail,
        as: 'productionOrderDetails',
        include: [
            { 
                model: Employee, 
                as: 'employeeAssigned',
                attributes: ['idEmployee', 'fullName'] 
            }
        ]
    }
];

const simpleIncludeOptions = [
    { model: Product, as: 'product', attributes: ['idProduct', 'productName'] },
    {
        model: Employee,
        as: 'employeeRegistered',
        attributes: ['idEmployee', 'fullName']
    },
    {
        model: Provider,
        as: 'provider',
        attributes: ['idProvider', 'company']
    }
];


// --- FUNCIONES DEL REPOSITORIO ---

const findOrderByIdWithDetails = async (idProductionOrder) => {
    return ProductionOrder.findByPk(idProductionOrder, {
        include: detailedIncludeOptions
    });
};

const findOrderByIdSimple = async (idProductionOrder, transaction = null) => {
    return ProductionOrder.findByPk(idProductionOrder, {
        include: simpleIncludeOptions,
        transaction
    });
};

const createOrderWithDetails = async (orderData, stepDetailsData, transaction) => {
    const newOrder = await ProductionOrder.create(orderData, { transaction });
    if (stepDetailsData && stepDetailsData.length > 0) {
        const stepsToCreate = stepDetailsData.map(step => ({ ...step, idProductionOrder: newOrder.idProductionOrder }));
        await ProductionOrderDetail.bulkCreate(stepsToCreate, { transaction });
    }
    return findOrderByIdSimple(newOrder.idProductionOrder, transaction);
};

const findAllOrders = async (queryOptions = {}) => {
    const { limit, offset, orderClause, whereClause } = queryOptions;
    return ProductionOrder.findAndCountAll({
        where: whereClause,
        include: detailedIncludeOptions,
        limit,
        offset,
        order: orderClause || [['idProductionOrder', 'DESC']],
        distinct: true
    });
};

const deleteOrderDetailsByOrderId = async (idProductionOrder, transaction) => {
    return ProductionOrderDetail.destroy({ where: { idProductionOrder: idProductionOrder }, transaction });
};

const updateOrder = async (idProductionOrder, dataToUpdate, transaction) => {
    const [affectedRows] = await ProductionOrder.update(dataToUpdate, { where: { idProductionOrder }, transaction });
    return affectedRows > 0;
};

const findStepById = async (idProductionOrderDetail, transaction) => {
    return ProductionOrderDetail.findByPk(idProductionOrderDetail, { transaction });
};

const updateStep = async (idProductionOrderDetail, stepData, transaction) => {
    const [affectedRows] = await ProductionOrderDetail.update(stepData, { where: { idProductionOrderDetail }, transaction });
    return affectedRows > 0;
};

const addConsumedSupplies = async (idProductionOrder, supplies, transaction) => {
    return Promise.resolve();
};

const deleteOrderById = async (idProductionOrder, transaction) => {
    await deleteOrderDetailsByOrderId(idProductionOrder, transaction);
    const deletedCount = await ProductionOrder.destroy({ where: { idProductionOrder }, transaction });
    return deletedCount > 0;
};

const findOrderById = async (idProductionOrder, transaction) => {
    return ProductionOrder.findByPk(idProductionOrder, { transaction });
};

module.exports = {
    createOrderWithDetails,
    findOrderByIdWithDetails,
    findOrderByIdSimple,
    findAllOrders,
    updateOrder,
    findStepById,
    updateStep,
    addConsumedSupplies,
    deleteOrderById,
    findOrderById,
    deleteOrderDetailsByOrderId
};