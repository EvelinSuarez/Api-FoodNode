const PurchaseDetail = require('../models/purchaseDetail');

const createPurchaseDetail = async (purchaseDetail) => {
    return PurchaseDetail.create(purchaseDetail);
};

const getAllPurchaseDetails = async () => {
    return PurchaseDetail.findAll();
};

const getPurchaseDetailById = async (idDetail) => {
    return PurchaseDetail.findByPk(idDetail);
};

const updatePurchaseDetail = async (idDetail, purchaseDetail) => {
    return PurchaseDetail.update(purchaseDetail, { where: { idDetail } });
};

const deletePurchaseDetail = async (idDetail) => {
    return PurchaseDetail.destroy({ where: { idDetail } });
};

const changeStatePurchaseDetail = async (idDetail, status) => {
    return PurchaseDetail.update({ status }, { where: { idDetail } });
};

module.exports = {
    createPurchaseDetail,
    getAllPurchaseDetails,
    getPurchaseDetailById,
    updatePurchaseDetail,
    deletePurchaseDetail,
    changeStatePurchaseDetail,
};
