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

const updateAditionalServices = async (id, aditionalServices) => {
    return AditionalServices.update(aditionalServices, { where: { id } });
}

const deleteAditionalServices = async (id) => {
    return AditionalServices.destroy({ where: { id } });
}

const changeSateAditionalServices = async (id, state) => {
    return AditionalServices.update({ state }, { where: { id } });
}

module.exports = {
    createAditionalServices,
    getAllAditionalServices,
    getAditionalServicesById, 
    updateAditionalServices,
    deleteAditionalServices,
    changeSateAditionalServices,
};