const PurchaseRecord = require('../models/purchaseRecord');

const createPurchaseRecord = async (purchaseRecord) => {
    return PurchaseRecord.create(purchaseRecord);
}

const getAllPurchaseRecords = async () => {
    return PurchaseRecord.findAll();
}

const getPurchaseRecordById = async (id) => {
    return PurchaseRecord.findByPk(id);
}

const updatePurchaseRecord = async (id, purchaseRecord) => {
    return PurchaseRecord.update(purchaseRecord, { where: { id } });
}

const deletePurchaseRecord = async (id) => {
    return PurchaseRecord.destroy({ where: { id } });
}

const changeSatePurchaseRecord = async (id, state) => {
    return PurchaseRecord.update({ state }, { where: { id } });
}

module.exports = {
    createPurchaseRecord,
    getAllPurchaseRecords,
    getPurchaseRecordById,
    updatePurchaseRecord,
    deletePurchaseRecord,
    changeSatePurchaseRecord,
};