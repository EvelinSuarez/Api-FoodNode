// repositories/productionOrderDetailRepository.js
const { ProductionOrderDetail, ProductionOrder, Process, Employee, sequelize } = require('../models');
const { Op } = require('sequelize');

const addStep = async (stepData, transaction) => { // stepData ya tiene idProductionOrder
    return ProductionOrderDetail.create(stepData, { transaction });
};

const findStepsByOrderId = async (idProductionOrder) => {
    return ProductionOrderDetail.findAll({
        where: { idProductionOrder },
        include: [
            { model: Process, as: 'masterProcess', attributes: ['idProcess', 'processName'] },
            { model: Employee, as: 'assignedEmployee', attributes: ['idEmployee', 'firstName', 'lastName'] } // O fullName
        ],
        order: [['processOrder', 'ASC']]
    });
};

const findStepByIdWithDetails = async (idProductionOrderDetail) => {
    return ProductionOrderDetail.findByPk(idProductionOrderDetail, {
        include: [
            { model: ProductionOrder, as: 'productionOrder', attributes: ['idProductionOrder', 'status'] }, // Incluir info básica de la orden
            { model: Process, as: 'masterProcess' },
            { model: Employee, as: 'assignedEmployee' }
        ]
    });
};

// findStepById y updateStep ya están en productionOrderRepository, se pueden reutilizar o duplicar aquí si se prefiere separación.
// Por ahora, asumimos que productionOrderService los llama desde productionOrderRepository.

const deleteStepById = async (idProductionOrderDetail, transaction) => {
    const deletedCount = await ProductionOrderDetail.destroy({
        where: { idProductionOrderDetail },
        transaction
    });
    return deletedCount > 0;
};


const findStepsByEmployee = async (idEmployee) => {
    return ProductionOrderDetail.findAll({
        where: { idEmployeeAssigned: idEmployee },
        include: [
            { model: ProductionOrder, as: 'productionOrder', include: [{model: Product, as: 'productOrdered', attributes:['productName']}] },
            { model: Process, as: 'masterProcess' }
        ],
        order: [['idProductionOrder', 'ASC'], ['processOrder', 'ASC']]
    });
};

const findAllActiveSteps = async () => {
    return ProductionOrderDetail.findAll({
        where: { status: 'IN_PROGRESS' }, // O cualquier otro criterio para "activo"
        include: [
            { model: ProductionOrder, as: 'productionOrder', include: [{model: Product, as: 'productOrdered', attributes:['productName']}] },
            { model: Process, as: 'masterProcess' },
            { model: Employee, as: 'assignedEmployee' }
        ],
        order: [['startDate', 'ASC']]
    });
};


module.exports = {
    addStep,
    findStepsByOrderId,
    findStepByIdWithDetails,
    deleteStepById,
    findStepsByEmployee,
    findAllActiveSteps,
};