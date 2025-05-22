// repositories/productRepository.js
const { Product } = require('../models'); // Solo necesita Product para operaciones CRUD básicas
const { Op } = require('sequelize');

const createProduct = async (productData) => {
    return Product.create(productData);
};

const getAllProducts = async () => {
    return Product.findAll({ order: [['productName', 'ASC']] });
};

const getProductById = async (id) => {
    return Product.findByPk(id);
};

const findProductByName = async (productName) => {
    return Product.findOne({ where: { productName } });
};

const updateProduct = async (id, productData) => {
    // findByPk y luego save, o update directo. Update es más simple aquí.
    const [numberOfAffectedRows] = await Product.update(productData, {
        where: { idProduct: id },
        // returning: true, // No soportado por defecto en MySQL para update masivo, necesitarías findByPk después si quieres el objeto actualizado
    });
    return numberOfAffectedRows > 0;
};

const deleteProduct = async (id) => {
    const numberOfDeletedRows = await Product.destroy({
        where: { idProduct: id },
    });
    return numberOfDeletedRows > 0;
};

const changeStateProduct = async (id, state) => {
    const [numberOfAffectedRows] = await Product.update({ status: state }, {
        where: { idProduct: id },
    });
    return numberOfAffectedRows > 0;
};

// Nota: getProductsBySupplier se movió al servicio porque requiere lógica de joins más compleja.
// Si quisieras una versión simple aquí, sería diferente.

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    findProductByName,
    updateProduct,
    deleteProduct,
    changeStateProduct,
};