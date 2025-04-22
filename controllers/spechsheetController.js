const { validationResult } = require("express-validator");
const specSheetService = require("../services/spechsheetService");
const productService = require("../services/productService");

const createSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Obtener todos los productos disponibles
    const availableProducts = await productService.getAllProducts();

    // Validar que el producto seleccionado exista
    const { idProduct, startDate, status, quantity } = req.body;
    const productExists = availableProducts.some(
      (product) => product.idProduct === idProduct
    );

    if (!productExists) {
      return res.status(400).json({
        message: "El producto seleccionado no existe o no está disponible.",
      });
    }

    // Crear la ficha técnica
    const specSheet = await specSheetService.createSpecSheet({
      idProduct,
      startDate,
      endDate: null,
      measurementUnit: req.body.measurementUnit,
      status,
      quantity,
    });

    res
      .status(201)
      .json({ message: "Ficha técnica creada exitosamente", specSheet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllSpecSheets = async (req, res) => {
  try {
    const specSheets = await specSheetService.getAllSpecSheets();
    console.log("Fichas técnicas obtenidas:", specSheets);
    res.status(200).json(specSheets);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
  }
};

const updateSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await specSheetService.updateSpecSheet(req.params.id, req.body);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await specSheetService.deleteSpecSheet(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changeStateSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await specSheetService.changeStateSpecSheet(req.params.id, req.body.state);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSpecSheetsByProduct = async (req, res) => {
  try {
    const { idProduct } = req.params;
    console.log("Buscando fichas técnicas para producto:", idProduct);

    const specSheets = await specSheetService.getSpecSheetsByProduct(idProduct);

    return res.status(200).json(specSheets);
  } catch (error) {
    console.error("Error:", error);
    return res.status(404).json({
      success: false,
      message: error.message,
    });
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
