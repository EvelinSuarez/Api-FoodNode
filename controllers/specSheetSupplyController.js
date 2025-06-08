// controllers/specSheetSupplyController.js
const { validationResult } = require("express-validator");
const specSheetSupplyService = require("../services/specSheetSupplyService");
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

const addSupplyToSpecSheet = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // req.body debe contener: idSpecSheet, idSupply, quantity, unitOfMeasure, notes (opc)
    const newSpecSheetSupply = await specSheetSupplyService.addSupplyToSpecSheet(req.body);
    res.status(201).json(newSpecSheetSupply);
  } catch (error) {
    if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
    console.error("Controller[SpecSheetSupply]: Error al añadir insumo a ficha:", error);
    res.status(500).json({ message: "Error interno al añadir insumo a la ficha técnica." });
  }
};

// GET /api/spec-sheet-supplies/ (opcional, para ver todos los registros, puede ser muchos)
// const getAllSpecSheetSupplies = async (req, res, next) => {
//   try {
//     const items = await specSheetSupplyService.getAllSpecSheetSupplies();
//     res.status(200).json(items);
//   } catch (error) {
//     console.error("Controller[SpecSheetSupply]: Error en getAllSpecSheetSupplies:", error);
//     res.status(500).json({ message: "Error al obtener todos los insumos de fichas." });
//   }
// };

const getSpecSheetSupplyById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idSpecSheetSupply } = req.params;
    const item = await specSheetSupplyService.getSpecSheetSupplyById(idSpecSheetSupply);
    res.status(200).json(item);
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
    console.error("Controller[SpecSheetSupply]: Error en getSpecSheetSupplyById:", error);
    res.status(500).json({ message: "Error al obtener el insumo de la ficha técnica." });
  }
};

const updateSupplyInSpecSheet = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idSpecSheetSupply } = req.params;
    // req.body debe contener: quantity, unitOfMeasure, notes (opcionales para actualizar)
    const updatedItem = await specSheetSupplyService.updateSupplyInSpecSheet(idSpecSheetSupply, req.body);
    res.status(200).json(updatedItem);
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
    if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
    console.error("Controller[SpecSheetSupply]: Error en updateSupplyInSpecSheet:", error);
    res.status(500).json({ message: "Error al actualizar el insumo en la ficha técnica." });
  }
};

const removeSupplyFromSpecSheet = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idSpecSheetSupply } = req.params;
    await specSheetSupplyService.removeSupplyFromSpecSheet(idSpecSheetSupply);
    res.status(204).end();
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
    if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
    console.error("Controller[SpecSheetSupply]: Error en removeSupplyFromSpecSheet:", error);
    res.status(500).json({ message: "Error al eliminar el insumo de la ficha técnica." });
  }
};

const getSuppliesBySpecSheetId = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idSpecSheet } = req.params;
    const items = await specSheetSupplyService.getSuppliesBySpecSheetId(idSpecSheet);
    res.status(200).json(items);
  } catch (error) {
    // El servicio no debería lanzar NotFoundError si la ficha existe pero no tiene insumos.
    console.error("Controller[SpecSheetSupply]: Error en getSuppliesBySpecSheetId:", error);
    res.status(500).json({ message: "Error al obtener insumos por ficha técnica." });
  }
};

const getSpecSheetsBySupplyId = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idSupply } = req.params;
    const items = await specSheetSupplyService.getSpecSheetsBySupplyId(idSupply);
    res.status(200).json(items);
  } catch (error) {
    console.error("Controller[SpecSheetSupply]: Error en getSpecSheetsBySupplyId:", error);
    res.status(500).json({ message: "Error al obtener fichas técnicas por insumo." });
  }
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