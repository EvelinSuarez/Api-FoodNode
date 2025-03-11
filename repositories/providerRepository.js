const Provider = require('../models/provider');

// Crear un proveedor
const createProvider = async (provider) => {
    return Provider.create(provider);
}

// Obtener todos los proveedores
const getAllProvider = async () => {
    return Provider.findAll();
}

// Obtener un proveedor por ID
const getProviderById = async (idProvider) => {  // Cambié 'id' por 'idProvider'
    return Provider.findByPk(idProvider);  // Asegúrate de que aquí también sea 'idProvider'
}

// Actualizar un proveedor
const updateProvider = async (idProvider, provider) => {  // Cambié 'id' por 'idProvider'
    return Provider.update(provider, { where: { idProvider } });  // Asegúrate de que aquí también sea 'idProvider'
}

// Eliminar un proveedor
const deleteProvider = async (idProvider) => {  // Cambié 'id' por 'idProvider'
    return Provider.destroy({ where: { idProvider } });  // Asegúrate de que aquí también sea 'idProvider'
}

// Cambiar el estado de un proveedor
const changeStateProvider = async (idProvider, status) => {  // Cambié 'id' por 'idProvider'
    return Provider.update({ status }, { where: { idProvider } });  // Asegúrate de que aquí también sea 'idProvider'
}

module.exports = {
    createProvider,
    getAllProvider,
    getProviderById,
    updateProvider,
    deleteProvider,
    changeStateProvider,
};
