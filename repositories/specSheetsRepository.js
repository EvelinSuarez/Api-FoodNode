const SpecSheet   = require("../models/specSheet");

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


const changeStateSpecSheet = async (idSpecsheet, newStatus) => {
  try {
    const updateData = { status: newStatus }; // El nuevo estado

    if (newStatus === false) { // Si se está inactivando
      updateData.endDate = new Date(); // Establece la fecha actual
    } else { // Si se está activando
      updateData.endDate = null; // Limpia la fecha de inactivación
    }

    // Sequelize update devuelve un array: [numberOfAffectedRows]
    // El nombre del parámetro 'idSpecsheet' debe coincidir con el nombre de la columna PK en tu modelo.
    // Si tu columna PK se llama 'id' en el modelo, usa { where: { id: idSpecsheet } } o asegúrate de que
    // 'idSpecsheet' sea el nombre correcto de la columna PK.
    const [affectedRows] = await SpecSheet.update(updateData, {
      where: { idSpecsheet: idSpecsheet } // o simplemente { idSpecsheet } si la variable se llama igual que la propiedad
    });

    return [affectedRows]; // Devolver el número de filas afectadas
  } catch (error) {
    console.error(`Error en el repositorio al cambiar estado para ficha ${idSpecsheet}:`, error);
    throw error; // Re-lanzar el error para que el servicio/controlador lo maneje si es necesario
  }
};
const getSpecSheetsByProduct = async (idProduct) => {
  try {
    console.log("Buscando fichas técnicas para el producto:", idProduct);
    const specSheets = await SpecSheet.findAll({
      where: { idProduct },
      include: [
        {
          model: require("../models/Product"),
          as: "product",
          attributes: ["productName", "idProduct"],
        },
        {
          model: require("../models/productSheet"),
          as: "ProductSheets", // <--- Asegúrate que este alias coincida con el definido en SpecSheet.hasMany 
          include: [
            {
              model: require("../models/supplier"),
              as: "supplier",
              attributes: ["supplierName", "idSupplier"],
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
