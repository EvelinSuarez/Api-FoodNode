const Provider = require('../models/provider');

const createProvider = async (provider) => {
    return Provider.create(provider);
}

const getAllProvider = async () => {
    return Provider.findAll();
}

const getProviderById = async (id) => {
    return Provider.findByPk(id);
}

const updateProvider = async (id, provider) => {
    return Provider.update(provider, { where: { id } });
}

const deleteProvider = async (id) => {
    return Provider.destroy({ where: { id } });
}

const changeSateProvider = async (id, state) => {
    return Provider.update({ state }, { where: { id } });
}

module.exports = {
    createProvider,
    getAllProvider,
    getProviderById,
    updateProvider,
    deleteProvider,
    changeSateProvider,
};