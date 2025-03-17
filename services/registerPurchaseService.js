const registerPurchaseRepository = require('../repositories/registerPurchaseRepository');

const createRegisterPurchase = async (registerPurchase) => {
    return registerPurchaseRepository.createRegisterPurchase(registerPurchase);
};

const getAllRegisterPurchases = async () => {
    return registerPurchaseRepository.getAllRegisterPurchases();
};

const getRegisterPurchaseById = async (id) => {
    return registerPurchaseRepository.getRegisterPurchaseById(id);
};

const updateRegisterPurchase = async (id, registerPurchase) => {
    return registerPurchaseRepository.updateRegisterPurchase(id, registerPurchase);
};

const deleteRegisterPurchase = async (id) => {
    return registerPurchaseRepository.deleteRegisterPurchase(id);
};

const changeStateRegisterPurchase = async (id, status) => {
    return registerPurchaseRepository.changeStateRegisterPurchase(id, status);
}

module.exports = {
    createRegisterPurchase,
    getAllRegisterPurchases,
    getRegisterPurchaseById,
    updateRegisterPurchase,
    deleteRegisterPurchase,
    changeStateRegisterPurchase,
};
