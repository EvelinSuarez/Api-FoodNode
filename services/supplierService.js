const supplierRepository = require('../repositories/supplierRepository');

const createSupplier = async (supplier) => {
    return supplierRepository.createSupplier(supplier);
}

const getAllSuppliers = async () => {
    return supplierRepository.getAllSuppliers();
}

const getSupplierById = async (id) => {
    return supplierRepository.getSupplierById(id);
}

const updateSupplier = async (id, supplier) => {
    return supplierRepository.updateSupplier(id, supplier);
}

const deleteSupplier = async (id) => {
    return supplierRepository.deleteSupplier(id);
}

const changeStateSupplier = async (id, status) => {
    return supplierRepository.changeStateSupplier(id, status);
}

module.exports = {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    changeStateSupplier,
};