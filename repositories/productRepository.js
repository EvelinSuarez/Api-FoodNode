// Archivo: repositories/productRepository.js
// --- VERSIÓN CORREGIDA Y SIMPLIFICADA ---

const { Product, sequelize } = require('../models');

const createProduct = async (productData) => {
    return Product.create(productData);
};

const updateStock = async (productId, newStock) => {
    return Product.update({ currentStock: newStock }, { where: { idProduct: productId } });
};

const getAllProducts = async () => {
    // La función ahora es más simple. Solo trae los productos.
    // El servicio se encargará de enriquecerlos.
    return Product.findAll({
        attributes: {
            include: [
                [
                    sequelize.literal(`(SELECT COUNT(*) FROM SpecSheets WHERE SpecSheets.idProduct = Product.idProduct)`),
                    'specSheetCount'
                ]
            ]
        },
        order: [['productName', 'ASC']]
    });
};

const getProductById = async (id) => {
    return Product.findByPk(id);
};

const findProductByName = async (productName) => {
    return Product.findOne({ where: { productName } });
};

const updateProduct = async (id, productData) => {
    return Product.update(productData, { where: { idProduct: id } });
};

const deleteProduct = async (id) => {
    return Product.destroy({ where: { idProduct: id } });
};

const changeStateProduct = async (id, state) => {
    return Product.update({ status: state }, { where: { idProduct: id } });
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    findProductByName,
    updateProduct,
    deleteProduct,
    changeStateProduct,
    updateStock
};