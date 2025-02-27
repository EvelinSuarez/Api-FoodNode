const aditionalServicesRepository = require('../repositories/aditionalServicesRepository');

const createAditionalServices = async (aditionalServices) => {
    return aditionalServicesRepository.createAditionalServices(aditionalServices);
}

const getAllAditionalServices = async () => {
    return aditionalServicesRepository.getAllAditionalServices();
}

const getAditionalServicesById = async (id) => {
    return aditionalServicesRepository.getAditionalServicesById(id);
}

const updateAditionalServices = async (id, aditionalServices) => {
    return aditionalServicesRepository.updateAditionalServices(id, aditionalServices);
}

const deleteAditionalServices = async (id) => {
    return aditionalServicesRepository.deleteAditionalServices(id);
}

const changeSateAditionalServices = async (id, state) => {
    return aditionalServicesRepository.changeSateAditionalServices(id, state);
}

module.exports = {
    createAditionalServices,
    getAllAditionalServices,
    getAditionalServicesById,
    updateAditionalServices,
    deleteAditionalServices,
    changeSateAditionalServices,
};