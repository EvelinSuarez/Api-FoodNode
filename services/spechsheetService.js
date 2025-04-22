const specSheetRepository = require("../repositories/specSheetRepository");

const createSpecSheet = async (specSheetData) => {
  return specSheetRepository.createSpecSheet(specSheetData);
};

const getAllSpecSheets = async () => {
  return specSheetRepository.getAllSpecSheets();
};

const getSpecSheetById = async (id) => {
  return specSheetRepository.getSpecSheetById(id);
};

const updateSpecSheet = async (id, specSheet) => {
  return specSheetRepository.updateSpecSheet(id, specSheet);
};

const deleteSpecSheet = async (id) => {
  return specSheetRepository.deleteSpecSheet(id);
};

const changeStateSpecSheet = async (id, status) => {
  return specSheetRepository.changeStateSpecSheet(id, status);
};

const getSpecSheetsByProduct = async (idProduct) => {
  return specSheetRepository.getSpecSheetsByProduct(idProduct);
};

module.exports = {
  createSpecSheet,
  getAllSpecSheets,
  getSpecSheetById,
  updateSpecSheet,
  deleteSpecSheet,
  changeStateSpecSheet,
  getSpecSheetsByProduct,
};
