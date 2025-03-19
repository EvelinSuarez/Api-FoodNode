const productSheetRepository = require('../repositories/productSheetRepository');

const createProductSheet = async (productSheet) => {
    return productSheetRepository.createProductSheet(productSheet);
}

const getAllProductSheets = async () => {
    return productSheetRepository.getAllProductSheets();
}

const getProductSheetById = async (id) => {
    return productSheetRepository.getProductSheetById(id);
}

const updateProductSheet = async (id, productSheet) => {
    return productSheetRepository.updateProductSheet(id, productSheet);
}

const deleteProductSheet = async (id) => {
    return productSheetRepository.deleteProductSheet(id);
}

const getProductSheetsBySpecSheet = async (idSpecSheet) => {
    return productSheetRepository.getProductSheetsBySpecSheet(idSpecSheet);
}

const getProductSheetsBySupplier = async (idSupplier) => {
    return productSheetRepository.getProductSheetsBySupplier(idSupplier);
}

module.exports = {
    createProductSheet,
    getAllProductSheets,
    getProductSheetById,
    updateProductSheet,
    deleteProductSheet,
    getProductSheetsBySpecSheet,
    getProductSheetsBySupplier
};