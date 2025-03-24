const registerPurchaseRepository = require('../repositories/registerPurchaseRepository');

const createRegisterPurchase = async (registerPurchase) => {
    return registerPurchaseRepository.createRegisterPurchase(registerPurchase);
};

const getAllRegisterPurchases = async () => {
    return registerPurchaseRepository.getAllRegisterPurchases();
};

const getRegisterPurchaseById = async (idPurchase) => {
    return registerPurchaseRepository.getRegisterPurchaseById(idPurchase);
};

const updateRegisterPurchase = async (idPurchase, registerPurchase) => {
    return registerPurchaseRepository.updateRegisterPurchase(idPurchase, registerPurchase);
};

const deleteRegisterPurchase = async (idPurchase) => {
    return registerPurchaseRepository.deleteRegisterPurchase(idPurchase);
};
const changeStateRegisterPurchase = async (idPurchase, status) => {
    return registerPurchaseRepository.changeStateRegisterPurchase(idPurchase, status);
}

module.exports = {
    createRegisterPurchase,
    getAllRegisterPurchases,
    getRegisterPurchaseById,
    updateRegisterPurchase,
    deleteRegisterPurchase,
    changeStateRegisterPurchase,
};