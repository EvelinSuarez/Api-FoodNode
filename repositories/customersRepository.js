const Customers = require('../models/customers');

const createCustomers = async (customers) => {
    return Customers.create(customers);
}

const getAllCustomers = async () => {
    return Customers.findAll();
}

const getCustomersById = async (id) => {
    return Customers.findByPk(id);
}

const updateCustomers = async (id, customers) => {
    return Customers.update(customers, { where: { id } });
}

const deleteCustomers = async (id) => {
    return Customers.destroy({ where: { id } });
}

const changeSateCustomers = async (id, state) => {
    return Customers.update({ state }, { where: { id } });
}

module.exports = {
    createCustomers,
    getAllCustomers,
    getCustomersById,
    updateCustomers,
    deleteCustomers,
    changeSateCustomers,
};