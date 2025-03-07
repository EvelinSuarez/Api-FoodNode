const SpecSheet = require('../models/spechsheet');

const createSpecSheet = async (specSheet) => {
    return SpecSheet.create(specSheet);
}

const getAllSpecSheets = async () => {
    return SpecSheet.findAll();
}

const getSpecSheetById = async (IdSpecsheet) => {
    return SpecSheet.findByPk(IdSpecsheet);
}

const updateSpecSheet = async (IdSpecsheet, specSheet) => {
    return SpecSheet.update(specSheet, { where: { IdSpecsheet } });
}

const deleteSpecSheet = async (IdSpecsheet) => {
    return SpecSheet.destroy({ where: { IdSpecsheet } });
}

const changeStateSpecSheet = async (IdSpecsheet, state) => {
    return SpecSheet.update({ state }, { where: { IdSpecsheet } });
}

const getSpecSheetsByProduct = async (IdProduct) => {
    return SpecSheet.findAll({ where: { IdProduct } });
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