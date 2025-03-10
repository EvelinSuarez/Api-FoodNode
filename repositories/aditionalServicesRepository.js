const AditionalServices = require('../models/aditionalServices');

const createAditionalServices = async (aditionalServices) => {
    return AditionalServices.create(aditionalServices);
}

const getAllAditionalServices = async () => {
    return AditionalServices.findAll();
}

const getAditionalServicesById = async (id) => {
    return AditionalServices.findByPk(id);
}

const updateAditionalServices = async (idAditionalServices, aditionalServices) => {
    return AditionalServices.update(aditionalServices, { where: { idAditionalServices } });
}

const deleteAditionalServices = async (idAditionalServices) => {
    return AditionalServices.destroy({ where: { idAditionalServices } });
}

const changeStateAditionalServices = async (idAditionalServices, state) => {
    return AditionalServices.update({ state }, { where: { idAditionalServices } });
}

module.exports = {
    createAditionalServices,
    getAllAditionalServices,
    getAditionalServicesById, 
    updateAditionalServices,
    deleteAditionalServices,
    changeStateAditionalServices,
};