const specSheetRepository = require('../repositories/spechsheetRepository');

const createSpecSheet = async (specSheet) => {
    return specSheetRepository.createSpecSheet(specSheet);
}

const getAllSpecSheets = async () => {
    return specSheetRepository.getAllSpecSheets();
}

const getSpecSheetById = async (id) => {
    return specSheetRepository.getSpecSheetById(id);
}

const updateSpecSheet = async (id, specSheet) => {
    return specSheetRepository.updateSpecSheet(id, specSheet);
}

const deleteSpecSheet = async (id) => {
    return specSheetRepository.deleteSpecSheet(id);
}

const changeStateSpecSheet = async (id, state) => {
    return specSheetRepository.changeStateSpecSheet(id, state);
}

const getSpecSheetsByProduct = async (idProduct) => {
    return specSheetRepository.getSpecSheetsByProduct(idProduct);
}

module.exports = {
    createSpecSheet,
    getAllSpecSheets,
    getSpecSheetById,
    updateSpecSheet,
    deleteSpecSheet,
    changeStateSpecSheet,
    getSpecSheetsByProduct
};