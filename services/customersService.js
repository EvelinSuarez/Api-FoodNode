const customersRepository = require('../repositories/customersRepository');

const createCustomers = async (customers) => {
    return customersRepository.createCustomers(customers);
}

const getAllCustomers = async () => {
    return customersRepository.getAllCustomers();
}

const getCustomersById = async (id) => {
    return customersRepository.getCustomersById(id);
}

const updateCustomers = async (id, customers) => {
    return customersRepository.updateCustomers(id, customers);
}

const deleteCustomers = async (id) => {
    return customersRepository.deleteCustomers(id);
}

const changeSateCustomers = async (id, state) => {
    return customersRepository.changeSateCustomers(id, state);
}

module.exports = {
    createCustomers,
    getAllCustomers,
    getCustomersById,
    updateCustomers,
    deleteCustomers,
    changeSateCustomers,
};