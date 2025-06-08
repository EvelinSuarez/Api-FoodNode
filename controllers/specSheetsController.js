// Archivo: controllers/specSheetsController.js
// VERSIÓN COMPLETA Y CORREGIDA: La lógica de 'include' se mueve directamente aquí.

const { validationResult } = require("express-validator");
const specSheetService = require("../services/specSheetsService");
// <<<--- ¡IMPORTANTE! Importamos los modelos necesarios para el 'include' --- >>>
const { SpecSheet, Product, SpecSheetSupply, Supply, SpecSheetProcess, Process } = require('../models');


const createSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Errores de validación.", errors: errors.array() });
  }

  try {
    const newSpecSheet = await specSheetService.createSpecSheet(req.body);
    res.status(201).json({ message: "Ficha técnica creada exitosamente.", specSheet: newSpecSheet });
  } catch (error) {
    console.error("Controlador[SpecSheet]: Error al crear Ficha Técnica:", error.message);
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

// --- FUNCIÓN CLAVE CORREGIDA Y COMPLETADA ---
const getSpecSheetsByProductId = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { idProduct } = req.params;

    console.log(`[SpecSheetController] Buscando fichas para Producto ID: ${idProduct}`);

    if (!idProduct || isNaN(parseInt(idProduct))) {
        return res.status(400).json({ message: "Se requiere un ID de producto válido." });
    }

    const specSheets = await SpecSheet.findAll({
        where: { idProduct: parseInt(idProduct) },
        include: [
            {
                model: Product,
                as: 'product',
                attributes: ['productName']
            },
            {
                model: SpecSheetSupply,
                as: 'specSheetSupplies',
                include: [{
                    model: Supply,
                    as: 'supply',
                    attributes: ['supplyName', 'unitOfMeasure']
                }]
            },
            {
                model: SpecSheetProcess,
                as: 'specSheetProcesses',
                include: [{
                    model: Process,
                    as: 'masterProcessData',
                    attributes: ['processName', 'description', 'estimatedTimeMinutes']
                }]
            }
        ],
        order: [['dateEffective', 'DESC']]
    });

    console.log(`[SpecSheetController] Fichas encontradas: ${specSheets.length}`);
    res.status(200).json(specSheets);

  } catch (error) {
    console.error("Controlador[SpecSheet]: Error en getSpecSheetsByProductId:", error.message, error.stack);
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
  getSpecSheetsByProductId, // Nombre preferido para claridad con la ruta
  getSpecSheetsByProduct: getSpecSheetsByProductId, // Alias para compatibilidad con tu código actual
};