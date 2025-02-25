const purchaseRecordRepository = require('../repositories/purchaseRecordRepository');

const createPurchaseRecord = async (purchaseRecord) => {
    return purchaseRecordRepository.createPurchaseRecord(purchaseRecord);
}

const getAllPurchaseRecords = async () => {
    return purchaseRecordRepository.getAllPurchaseRecords();
}

const getPurchaseRecordById = async (id) => {
    return purchaseRecordRepository.getPurchaseRecordById(id);
}

const updatePurchaseRecord = async (id, PurchaseRecord) => {
    return purchaseRecordRepository.updatePurchaseRecord(id, purchaseRecord);
}

const deletePurchaseRecord = async (id) => {
    return purchaseRecordRepository.deletePurchaseRecord(id);
}

const changeSatePurchaseRecord = async (id, state) => {
    return purchaseRecordRepository.changeSatePurchaseRecord(id, state);
}

module.exports = {
    createPurchaseRecord,
    getAllPurchaseRecords,
    getPurchaseRecordById,
    updatePurchaseRecord,
    deletePurchaseRecord,
    changeSatePurchaseRecord,
};