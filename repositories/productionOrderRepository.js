const ProductionOrder = require('../models/productionOrder');

const createOrder = async (order) => {
    return ProductionOrder.create(order);
};

const getAllOrders = async () => {
    return ProductionOrder.findAll();
};

const getOrderById = async (id) => {
    return ProductionOrder.findByPk(id);
};

const updateOrder = async (id, order) => {
    return ProductionOrder.update(order, { where: { idOrder: id } });
};

const deleteOrder = async (id) => {
    return ProductionOrder.destroy({ where: { idOrder: id } });
};

const changeOrderState = async (id, state) => {
    return ProductionOrder.update({ state }, { where: { idOrder: id } });
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    changeOrderState,
};
