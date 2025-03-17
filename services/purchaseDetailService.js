const purchaseDetailRepository = require('../repositories/purchaseDetailRepository');

const createPurchaseDetail = async (purchaseDetail) => {
    return purchaseDetailRepository.createPurchaseDetail(purchaseDetail);
};

const getAllPurchaseDetails = async () => {
    return purchaseDetailRepository.getAllPurchaseDetails();
};

const getPurchaseDetailById = async (id) => {
    return purchaseDetailRepository.getPurchaseDetailById(id);
};

const updatePurchaseDetail = async (id, purchaseDetail) => {
    return purchaseDetailRepository.updatePurchaseDetail(id, purchaseDetail);
};

const deletePurchaseDetail = async (id) => {
    return purchaseDetailRepository.deletePurchaseDetail(id);
};

const changeStatePurchaseDetail = async (id, status) => {
    return purchaseDetailRepository.changeStatePurchaseDetail(id, status);
};

module.exports = {
    createPurchaseDetail,
    getAllPurchaseDetails,
    getPurchaseDetailById,
    updatePurchaseDetail,
    deletePurchaseDetail,
    changeStatePurchaseDetail,
};
