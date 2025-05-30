// services/specSheetSupplyService.js
const specSheetSupplyRepo = require("../repositories/specSheetSupplyRepository");
const { SpecSheet, Supply } = require('../models'); // Para verificaciones adicionales si son necesarias
const { NotFoundError, BadRequestError, ApplicationError } = require('../utils/customErrors');

const addSupplyToSpecSheet = async (data) => {
  // data: { idSpecSheet, idSupply, quantity, measurementUnit, notes }
  // Validaciones de existencia de SpecSheet y Supply ya hechas por middleware.
  // Validación de unicidad (mismo supply en misma spec sheet) ya hecha por middleware.

  // Opcional: verificar si la SpecSheet está activa/editable
  const specSheet = await SpecSheet.findByPk(data.idSpecSheet);
  if (specSheet && (specSheet.status === 'INACTIVE' || specSheet.status === 'ARCHIVED')) { // Ajusta estados según tu lógica
      throw new BadRequestError(`No se pueden añadir insumos a una ficha técnica ${specSheet.status}.`);
  }

  try {
    const newEntry = await specSheetSupplyRepo.create(data);
    return specSheetSupplyRepo.findById(newEntry.idSpecSheetSupply); // Devolver con includes
  } catch (error) {
    console.error("Service[SpecSheetSupply]: Error al añadir insumo:", error);
    if (error instanceof BadRequestError) throw error;
    throw new ApplicationError(`Error al añadir insumo a la ficha técnica: ${error.message}`);
  }
};

// const getAllSpecSheetSupplies = async () => { // Opcional
//   return specSheetSupplyRepo.findAll();
// };

const getSpecSheetSupplyById = async (idSpecSheetSupply) => {
  const item = await specSheetSupplyRepo.findById(idSpecSheetSupply);
  if (!item) {
    throw new NotFoundError(`Registro de insumo de ficha técnica con ID ${idSpecSheetSupply} no encontrado.`);
  }
  return item;
};

const updateSupplyInSpecSheet = async (idSpecSheetSupply, updateData) => {
  // updateData: { quantity, measurementUnit, notes }
  const existingItem = await specSheetSupplyRepo.findById(idSpecSheetSupply);
  if (!existingItem) {
    throw new NotFoundError(`Registro de insumo de ficha técnica ID ${idSpecSheetSupply} no encontrado para actualizar.`);
  }

  // Opcional: verificar estado de la ficha técnica asociada
  if (existingItem.specSheet && (existingItem.specSheet.status === 'INACTIVE' || existingItem.specSheet.status === 'ARCHIVED')) {
      throw new BadRequestError(`No se pueden modificar insumos de una ficha técnica ${existingItem.specSheet.status}.`);
  }

  try {
    const [affectedRows] = await specSheetSupplyRepo.update(idSpecSheetSupply, updateData);
    // if (affectedRows === 0 && Object.keys(updateData).length > 0) {
      // Podría ser que no hubo cambios reales.
    // }
    return await specSheetSupplyRepo.findById(idSpecSheetSupply);
  } catch (error) {
    console.error("Service[SpecSheetSupply]: Error al actualizar insumo:", error);
    if (error instanceof BadRequestError || error instanceof NotFoundError) throw error;
    throw new ApplicationError(`Error al actualizar el insumo en la ficha técnica: ${error.message}`);
  }
};

const removeSupplyFromSpecSheet = async (idSpecSheetSupply) => {
  const existingItem = await specSheetSupplyRepo.findById(idSpecSheetSupply);
  if (!existingItem) {
    throw new NotFoundError(`Registro de insumo de ficha técnica ID ${idSpecSheetSupply} no encontrado para eliminar.`);
  }

  // Opcional: verificar estado de la ficha técnica asociada
  if (existingItem.specSheet && (existingItem.specSheet.status === 'INACTIVE' || existingItem.specSheet.status === 'ARCHIVED')) {
      throw new BadRequestError(`No se pueden eliminar insumos de una ficha técnica ${existingItem.specSheet.status}.`);
  }

  const affectedRows = await specSheetSupplyRepo.destroy(idSpecSheetSupply);
  if (affectedRows === 0) {
    // No debería pasar si findById lo encontró.
    throw new ApplicationError(`No se pudo eliminar el insumo de la ficha técnica ID ${idSpecSheetSupply}.`);
  }
};

const getSuppliesBySpecSheetId = async (idSpecSheet) => {
  // La validación de existencia de SpecSheet la hace el middleware
  return specSheetSupplyRepo.findAllBySpecSheetId(idSpecSheet);
};

const getSpecSheetsBySupplyId = async (idSupply) => {
  // La validación de existencia de Supply la hace el middleware
  return specSheetSupplyRepo.findAllBySupplyId(idSupply);
};

module.exports = {
  addSupplyToSpecSheet,
  // getAllSpecSheetSupplies, // Opcional
  getSpecSheetSupplyById,
  updateSupplyInSpecSheet,
  removeSupplyFromSpecSheet,
  getSuppliesBySpecSheetId,
  getSpecSheetsBySupplyId,
};