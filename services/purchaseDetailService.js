const purchaseDetailRepository = require('../repositories/purchaseDetailRepository');

const createPurchaseDetail = async (purchaseDetail) => {
    return purchaseDetailRepository.createPurchaseDetail(purchaseDetail);
};

const getAllPurchaseDetails = async () => {
    return purchaseDetailRepository.getAllPurchaseDetails();
};
async function getMeatProviders() { // Nombre más específico
    return registerPurchaseRepository.getUniqueProvidersFromCategory('carne');
}

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
    getMeatProviders,
    getPurchaseDetailById,
    updatePurchaseDetail,
    deletePurchaseDetail,
    changeStatePurchaseDetail,
};
