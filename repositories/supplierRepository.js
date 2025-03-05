const Supplier = require('../models/supplier');

const createSupplier = async (supplier) => {
    return Supplier.create(supplier);
}

const getAllSuppliers = async () => {
    return Supplier.findAll();
}

const getSupplierById = async (idSupplier) => {
    return Supplier.findByPk(idSupplier);
}

const updateSupplier = async (idSupplier, supplier) => {
    return Supplier.update(supplier, { where: { idSupplier } });
}

const deleteSupplier = async (idSupplier) => {
    return Supplier.destroy({ where: { idSupplier } });
}

const changeStateSupplier = async (idSupplier, state) => {
    return Supplier.update({ state }, { where: { idSupplier } });
}

module.exports = {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    changeStateSupplier,
};