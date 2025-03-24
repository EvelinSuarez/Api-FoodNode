const RegisterPurchase = require('../models/registerPurchase');

const createRegisterPurchase = async (registerPurchase) => {
    return RegisterPurchase.create(registerPurchase);
};

const getAllRegisterPurchases = async () => {
    return RegisterPurchase.findAll();
};

const getRegisterPurchaseById = async (idPurchase) => {
    return RegisterPurchase.findByPk(idPurchase);
};

const updateRegisterPurchase = async (idPurchase, registerPurchase) => {
    // Eliminar idPurchase del objeto registerPurchase para que no se intente actualizar
    // const { idPurchase, ...updates } = registerPurchase; // Si idPurchase *estuviera* en el objeto registerPurchase
    return RegisterPurchase.update(registerPurchase, { where: { idPurchase: idPurchase } }); // Usar idPurchase en la cláusula where
};

const deleteRegisterPurchase = async (idPurchase) => {
    return RegisterPurchase.destroy({ where: { idPurchase } });
};

const changeStateRegisterPurchase = async (idPurchase, status) => {
    return RegisterPurchase.update({ status }, { where: { idPurchase } });
}

module.exports = {
    createRegisterPurchase,
    getAllRegisterPurchases,
    getRegisterPurchaseById,
    updateRegisterPurchase,
    deleteRegisterPurchase,
    changeStateRegisterPurchase,
};