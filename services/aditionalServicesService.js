const aditionalServicesRepository = require('../repositories/aditionalServicesRepository');

const createAditionalServices = async (aditionalServices) => {
    return aditionalServicesRepository.createAditionalServices(aditionalServices);
}

const getAllAditionalServices = async () => {
    return aditionalServicesRepository.getAllAditionalServices();
}

const getAditionalServicesById = async (idAditionalServices) => {
    return aditionalServicesRepository.getAditionalServicesById(idAditionalServices);
}

const updateAditionalServices = async (id, aditionalServices) => {
    return aditionalServicesRepository.updateAditionalServices(id, aditionalServices);
}

const deleteAditionalServices = async (idAditionalServices) => {
    return aditionalServicesRepository.deleteAditionalServices(idAditionalServices);
}

const changeStateAditionalServices = async (id, state) => {
    return aditionalServicesRepository.changeStateAditionalServices(id, state);
}

module.exports = {
    createAditionalServices,
    getAllAditionalServices,
    getAditionalServicesById,
    updateAditionalServices,
    deleteAditionalServices,
    changeStateAditionalServices,
};