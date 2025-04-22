const productSheetRepository = require("../repositories/productSheetRepository");

const createProductSheet = async (productSheet) => {
  return productSheetRepository.createProductSheet(productSheet);
};

const getAllProductSheets = async () => {
  try {
    const productSheets = await productSheetRepository.getAllProductSheets();
    return productSheets.map((sheet) => {
      const plainSheet = sheet.get({ plain: true });
      return {
        ...plainSheet,
        specSheet: plainSheet.SpecSheet,
        supplier: plainSheet.Supplier,
      };
    });
  } catch (error) {
    console.error("Error en getAllProductSheets service:", error);
    throw error;
  }
};

const getProductSheetById = async (id) => {
  const productSheet = await productSheetRepository.getProductSheetById(id);
  if (!productSheet) {
    throw new Error("Relación no encontrada");
  }
  return {
    ...productSheet.toJSON(),
    specSheet: productSheet.SpecSheet,
    supplier: productSheet.Supplier,
  };
};

const updateProductSheet = async (id, productSheet) => {
  return productSheetRepository.updateProductSheet(id, productSheet);
};

const deleteProductSheet = async (id) => {
  return productSheetRepository.deleteProductSheet(id);
};

const getProductSheetsBySpecSheet = async (idSpecSheet) => {
  return productSheetRepository.getProductSheetsBySpecSheet(idSpecSheet);
};

const getProductSheetsBySupplier = async (idSupplier) => {
  return productSheetRepository.getProductSheetsBySupplier(idSupplier);
};

module.exports = {
  createProductSheet,
  getAllProductSheets,
  getProductSheetById,
  updateProductSheet,
  deleteProductSheet,
  getProductSheetsBySpecSheet,
  getProductSheetsBySupplier,
};
