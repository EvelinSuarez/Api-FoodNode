const { validationResult } = require("express-validator");
const specSheetProcessService = require("../services/specSheetProcessService");
const { NotFoundError, BadRequestError } = require('../utils/customErrors'); // Asumiendo errores custom

const createSpecSheetProcess = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // req.body ya contiene idSpecSheet, idProcess, processOrder y campos opcionales
    const newProcess = await specSheetProcessService.createSpecSheetProcess(req.body);
    res.status(201).json(newProcess);
  } catch (error) {
    if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
    // Otros errores específicos podrían venir del servicio o repositorio
    console.error("Controller[SpecSheetProcess]: Error al crear proceso:", error);
    res.status(500).json({ message: "Error interno del servidor al crear el proceso de ficha técnica." });
  }
};

const getAllProcessesBySpecSheetId = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idSpecSheet } = req.params;
    const processes = await specSheetProcessService.getAllSpecSheetProcessesBySpecSheetId(idSpecSheet);
    // Si el servicio devuelve un array vacío, es un 200 OK.
    res.status(200).json(processes);
  } catch (error) {
    // No se espera NotFoundError aquí, ya que una ficha puede no tener procesos.
    console.error("Controller[SpecSheetProcess]: Error en getAllProcessesBySpecSheetId:", error);
    res.status(500).json({ message: "Error al obtener los procesos de la ficha técnica." });
  }
};

const getSpecSheetProcessById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idSpecSheetProcess } = req.params;
    const process = await specSheetProcessService.getSpecSheetProcessById(idSpecSheetProcess);
    res.status(200).json(process);
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
    console.error("Controller[SpecSheetProcess]: Error en getSpecSheetProcessById:", error);
    res.status(500).json({ message: "Error al obtener el proceso de la ficha técnica." });
  }
};

const updateSpecSheetProcess = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idSpecSheetProcess } = req.params;
    // req.body solo debe contener campos actualizables (processOrder, overrides, estimatedTimeMinutes)
    const updatedProcess = await specSheetProcessService.updateSpecSheetProcess(idSpecSheetProcess, req.body);
    res.status(200).json(updatedProcess);
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
    if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
    console.error("Controller[SpecSheetProcess]: Error en updateSpecSheetProcess:", error);
    res.status(500).json({ message: "Error al actualizar el proceso de la ficha técnica." });
  }
};

const deleteSpecSheetProcess = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idSpecSheetProcess } = req.params;
    await specSheetProcessService.deleteSpecSheetProcess(idSpecSheetProcess);
    res.status(204).end(); // 204 No Content es más apropiado para delete exitoso
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
    if (error instanceof BadRequestError) return res.status(400).json({ message: error.message }); // Ej: Si la ficha está en uso y no se puede borrar
    console.error("Controller[SpecSheetProcess]: Error en deleteSpecSheetProcess:", error);
    res.status(500).json({ message: "Error al eliminar el proceso de la ficha técnica." });
  }
};

module.exports = {
  createSpecSheetProcess,
  getAllProcessesBySpecSheetId,
  getSpecSheetProcessById,
  updateSpecSheetProcess,
  deleteSpecSheetProcess,
};