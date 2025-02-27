const Customers = require('../models/customers');

const createCustomers = async (customers) => {
    return Customers.create(customers);
}

const getAllCustomers = async () => {
    return Customers.findAll();
}

const getCustomersById = async (idCustomers) => {
    return Customers.findByPk(idCustomers);
}

const updateCustomers = async (idCustomers, customers) => {
    return Customers.update(customers, { where: { idCustomers } });
}

const deleteCustomers = async (idCustomers) => {
    return Customers.destroy({ where: { idCustomers } });
}

const changeStateCustomers = async (idCustomers, state) => {
    return Customers.update({ state }, { where: { idCustomers } });
}

module.exports = {
    createCustomers,
    getAllCustomers,
    getCustomersById,
    updateCustomers,
    deleteCustomers,
    changeStateCustomers,
};