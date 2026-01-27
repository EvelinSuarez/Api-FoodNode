const { ProductionOrder, ProductionOrderDetail, SpecSheet, Employee, sequelize } = require('../models');
const { Op } = require('sequelize');

async function findAllOrders(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.idProduct) where.idProduct = parseInt(filters.idProduct);
    if (filters.q) where.productNameSnapshot = { [Op.like]: `%${filters.q}%` };

    const limit = filters.limit ? parseInt(filters.limit) : 25;
    const offset = filters.offset ? parseInt(filters.offset) : 0;

    return ProductionOrder.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
            { 
                model: Employee, 
                as: 'employeeRegistered', // Asegúrate que este sea el alias en tu modelo
                attributes: ['idEmployee', 'fullName'] 
            },
            { model: SpecSheet, as: 'specSheet' },
             { 
                model: ProductionOrderDetail, 
                as: 'productionOrderDetails',
                include: [
                    { 
                        model: Employee, 
                        as: 'employeeAssigned', // Asegúrate que este alias coincida con tu modelo
                        attributes: ['idEmployee', 'fullName'] 
                    }
                ]
            }
        ]
    });
}

async function findOrderByIdWithDetails(idProductionOrder, transaction = null) {
    return ProductionOrder.findByPk(idProductionOrder, {
        transaction,
        include: [
            { 
                model: Employee, 
                as: 'employeeRegistered', 
                attributes: ['idEmployee', 'fullName'] 
            },
            { model: SpecSheet, as: 'specSheet' },
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
        ]
    });
}

async function updateOrder(idProductionOrder, dataToUpdate, transaction = null) {
    await ProductionOrder.update(dataToUpdate, {
        where: { idProductionOrder },
        transaction,
        individualHooks: true
    });
    return findOrderByIdWithDetails(idProductionOrder, transaction);
}

async function updateStep(idProductionOrderDetail, stepData, transaction = null) {
    return ProductionOrderDetail.update(stepData, {
        where: { idProductionOrderDetail },
        transaction
    });
}

async function deleteOrderById(idProductionOrder, transaction = null) {
    return ProductionOrder.destroy({ where: { idProductionOrder }, transaction });
}

module.exports = {
    findAllOrders,
    findOrderByIdWithDetails,
    updateOrder,
    updateStep,
    deleteOrderById
};
