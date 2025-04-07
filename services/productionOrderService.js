const productionOrderRepository = require('../repositories/productionOrderRepository');

const createOrder = async (orderData) => {
    return await productionOrderRepository.createOrder(orderData);
};

const getAllOrders = async () => {
    return await productionOrderRepository.getAllOrders();
};

const getOrderById = async (id) => {
    return await productionOrderRepository.getOrderById(id);
};

const updateOrder = async (id, orderData) => {
    return await productionOrderRepository.updateOrder(id, orderData);
};

const deleteOrder = async (id) => {
    return await productionOrderRepository.deleteOrder(id);
};

const changeOrderState = async (id, state) => {
    return await productionOrderRepository.changeOrderState(id, state);
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    changeOrderState,
};
