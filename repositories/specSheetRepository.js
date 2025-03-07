const SpecSheet = require('../models/specSheet');

const createSpecSheet = async (specSheet) => {
    return SpecSheet.create(specSheet);
}

const getAllSpecSheets = async () => {
    return SpecSheet.findAll();
}

const getSpecSheetById = async (idSpecsheet) => {
    return SpecSheet.findByPk(idSpecsheet);
}

const updateSpecSheet = async (idSpecsheet, specSheet) => {
    return SpecSheet.update(specSheet, { where: { idSpecsheet } });
}

const deleteSpecSheet = async (idSpecsheet) => {
    return SpecSheet.destroy({ where: { idSpecsheet } });
}

const changeStateSpecSheet = async (idSpecsheet, status) => {
    return SpecSheet.update({ status }, { where: { idSpecsheet } });
}

const getSpecSheetsByProduct = async (idProduct) => {
    return SpecSheet.findAll({ where: { idProduct } });
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