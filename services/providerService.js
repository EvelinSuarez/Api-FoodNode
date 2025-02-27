const providerRepository = require('../repositories/providerRepository');

const createProvider = async (provider) => {
    return providerRepository.createProvider(provider);
}

const getAllProvider = async () => {
    return providerRepository.getAllProvider();
}

const getProviderById = async (id) => {
    return providerRepository.getProviderById(id);
}

const updateProvider = async (id, provider) => {
    return providerRepository.updateProvider(id, provider);
}

const deleteProvider = async (id) => {
    return providerRepository.deleteProvider(id);
}

const changeSateProvider = async (id, state) => {
    return providerRepository.changeStateProvider(id, state);
}

module.exports = {
    createProvider,
    getAllProvider,
    getProviderById,
    updateProvider,
    deleteProvider,
    changeSateProvider,
};