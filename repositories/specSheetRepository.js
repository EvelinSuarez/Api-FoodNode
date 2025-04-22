const SpecSheet = require("../models/specSheet");

const createSpecSheet = async (specSheetData) => {
  try {
    console.log(
      "Datos recibidos en repositorio:",
      JSON.stringify(specSheetData, null, 2)
    );

    // Validación adicional
    if (!specSheetData.measurementUnit) {
      throw new Error(
        "measurementUnit es requerido para crear la ficha técnica"
      );
    }

    const result = await SpecSheet.create(specSheetData);
    return result;
  } catch (error) {
    console.error("Error en repositorio:", error);
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors
        .map((e) => `${e.path}: ${e.message}`)
        .join(", ");
      throw new Error(`Validación fallida: ${messages}`);
    }
    throw error;
  }
};

const getAllSpecSheets = async () => {
  return SpecSheet.findAll();
};

const getSpecSheetById = async (idSpecsheet) => {
  return SpecSheet.findByPk(idSpecsheet);
};

const updateSpecSheet = async (idSpecsheet, specSheet) => {
  return SpecSheet.update(specSheet, { where: { idSpecsheet } });
};

const deleteSpecSheet = async (idSpecsheet) => {
  return SpecSheet.destroy({ where: { idSpecsheet } });
};

const changeStateSpecSheet = async (idSpecsheet, status) => {
  return SpecSheet.update({ status }, { where: { idSpecsheet } });
};

const getSpecSheetsByProduct = async (idProduct) => {
  try {
    console.log("Buscando fichas técnicas para el producto:", idProduct);
    const specSheets = await SpecSheet.findAll({
      where: { idProduct },
      include: [
        {
          model: require("../models/Product"),
          as: "Product",
          attributes: ["name", "idProduct"],
        },
        {
          model: require("../models/productSheet"),
          include: [
            {
              model: require("./supplier"),
              attributes: ["name", "idSupplier"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!specSheets || specSheets.length === 0) {
      throw new Error("No se encontraron fichas técnicas para este producto");
    }

    // Formatear la respuesta para incluir los productos y sus proveedores
    const formattedSpecSheets = specSheets.map((sheet) => ({
      ...sheet.toJSON(),
      suppliers:
        sheet.ProductSheets?.map((ps) => ({
          id: ps.Supplier.idSupplier,
          name: ps.Supplier.name,
          quantity: ps.quantity,
        })) || [],
    }));

    return formattedSpecSheets;
  } catch (error) {
    console.error("Error detallado:", error);
    throw error;
  }
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
