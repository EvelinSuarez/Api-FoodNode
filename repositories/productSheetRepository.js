const ProductSheet = require("../models/productSheet");
const SpecSheet = require("../models/specSheet");
const Supplier = require("../models/supplier");

const getAllProductSheets = async () => {
  try {
    console.log("Iniciando consulta en la base de datos...");
    const results = await ProductSheet.findAll({
      include: [
        {
          model: SpecSheet,
          as: "SpecSheet",
          required: false,
        },
        {
          model: Supplier,
          as: "Supplier",
          required: false,
        },
      ],
    });

    console.log(`Número de registros encontrados: ${results.length}`);

    // Verificar el primer resultado
    if (results.length > 0) {
      console.log("Muestra del primer registro:", {
        id: results[0].idProductSheet,
        quantity: results[0].quantity,
        specSheet: results[0].SpecSheet,
        supplier: results[0].Supplier,
      });
    }

    return results;
  } catch (error) {
    console.error("Error en getAllProductSheets:", error);
    throw error;
  }
};

const createProductSheet = async (data) => {
  return ProductSheet.create(data);
};

const getProductSheetById = async (id) => {
  return ProductSheet.findByPk(id, {
    include: [
      { model: SpecSheet, as: "SpecSheet" },
      { model: Supplier, as: "Supplier" },
    ],
  });
};

const updateProductSheet = async (id, data) => {
  const productSheet = await ProductSheet.findByPk(id);
  if (!productSheet) throw new Error("ProductSheet no encontrado");
  return productSheet.update(data);
};

const deleteProductSheet = async (id) => {
  const productSheet = await ProductSheet.findByPk(id);
  if (!productSheet) throw new Error("ProductSheet no encontrado");
  return productSheet.destroy();
};

const getProductSheetsBySpecSheet = async (idSpecSheet) => {
  return ProductSheet.findAll({
    where: { idSpecSheet },
    include: [
      { model: SpecSheet, as: "SpecSheet" },
      { model: Supplier, as: "Supplier" },
    ],
  });
};

const getProductSheetsBySupplier = async (idSupplier) => {
  return ProductSheet.findAll({
    where: { idSupplier },
    include: [
      { model: SpecSheet, as: "SpecSheet" },
      { model: Supplier, as: "Supplier" },
    ],
  });
};

module.exports = {
  getAllProductSheets,
  createProductSheet,
  getProductSheetById,
  updateProductSheet,
  deleteProductSheet,
  getProductSheetsBySpecSheet,
  getProductSheetsBySupplier,
};
