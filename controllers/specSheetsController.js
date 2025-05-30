// controllers/specSheetsController.js
const { validationResult } = require("express-validator");
const specSheetService = require("../services/specSheetsService");

const createSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Errores de validación.", errors: errors.array() });
  }

  try {
    // El servicio ahora maneja la validación de existencia del producto y unicidad de la ficha.
    // El payload completo se pasa al servicio.
    const newSpecSheet = await specSheetService.createSpecSheet(req.body);
    res.status(201).json({ message: "Ficha técnica creada exitosamente.", specSheet: newSpecSheet });
  } catch (error) {
    console.error("Controlador[SpecSheet]: Error al crear Ficha Técnica:", error.message);
    // Errores específicos del servicio
    if (error.message.includes("no existe") || error.message.includes("Ya existe una ficha") || error.message.includes("requerido") || error.message.includes("Validación fallida") || error.name.startsWith("Sequelize")) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error interno del servidor al crear la ficha técnica.", details: error.message });
  }
};

const getAllSpecSheets = async (req, res) => {
  try {
    const specSheets = await specSheetService.getAllSpecSheets();
    res.status(200).json(specSheets);
  } catch (error) {
    console.error("Controlador[SpecSheet]: Error en getAllSpecSheets:", error.message);
    res.status(500).json({ message: "Error al obtener las fichas técnicas.", details: error.message });
  }
};

const getSpecSheetById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const specSheet = await specSheetService.getSpecSheetById(req.params.id);
    // El servicio ahora lanza error si no se encuentra, así que no necesitamos la validación aquí.
    res.status(200).json(specSheet);
  } catch (error) {
    console.error("Controlador[SpecSheet]: Error en getSpecSheetById:", error.message);
    if (error.message.includes("no encontrada")) {
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al obtener la ficha técnica.", details: error.message });
  }
};

const updateSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Errores de validación.", errors: errors.array() });
  }
  
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedSpecSheet = await specSheetService.updateSpecSheet(id, updateData);
    res.status(200).json({ message: "Ficha técnica actualizada exitosamente.", specSheet: updatedSpecSheet });
  } catch (error) {
    console.error("Controlador[SpecSheet]: Error en updateSpecSheet:", error.message);
    if (error.message.includes("no encontrada") || error.message.includes("no existe")) {
        return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("requerido") || error.message.includes("Validación fallida") || error.name.startsWith("Sequelize")) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al actualizar la ficha técnica.", details: error.message });
  }
};

const deleteSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const affectedRows = await specSheetService.deleteSpecSheet(req.params.id);
    // El servicio lanza error si no se encuentra.
    // `deleteSpecSheet` del repo devuelve el número de filas borradas.
    res.status(200).json({ message: `Ficha técnica eliminada exitosamente. Filas afectadas: ${affectedRows}` });
  } catch (error) {
    console.error("Controlador[SpecSheet]: Error en deleteSpecSheet:", error.message);
     if (error.message.includes("no encontrada")) {
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al eliminar la ficha técnica.", details: error.message });
  }
};

const changeSpecSheetStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const idSpecsheet = req.params.id;
    const { status: newStatus } = req.body;

    await specSheetService.changeSpecSheetStatus(idSpecsheet, newStatus);
    res.status(200).json({ message: "Estado de la ficha técnica actualizado correctamente." });
  } catch (error) {
    console.error("Controlador[SpecSheet]: Error en changeSpecSheetStatus:", error.message);
    if (error.message.includes("no encontrada")) {
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al cambiar el estado de la ficha técnica.", details: error.message });
  }
};

const getSpecSheetsByProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idProduct } = req.params;
    const specSheets = await specSheetService.getSpecSheetsByProductId(idProduct);
    // El servicio ahora devuelve [] si no hay, no lanza error por "no encontrado".
    res.status(200).json(specSheets);
  } catch (error) {
    console.error("Controlador[SpecSheet]: Error en getSpecSheetsByProduct:", error.message);
    // El servicio podría lanzar error si idProduct no existe, por ejemplo.
    if (error.message.includes("no existe")) {
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al obtener fichas técnicas por producto.", details: error.message });
  }
};

module.exports = {
  createSpecSheet,
  getAllSpecSheets,
  getSpecSheetById,
  updateSpecSheet,
  deleteSpecSheet,
  changeSpecSheetStatus,
  getSpecSheetsByProduct,
};