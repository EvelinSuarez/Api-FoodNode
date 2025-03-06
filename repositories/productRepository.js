const Product = require('../models/Product');

const createProduct = async (product) => {
    return Product.create(product);
}

const getAllProducts = async () => {
    return Product.findAll();
}

const getProductById = async (IdProduct) => {
    return Product.findByPk(IdProduct);
}

const updateProduct = async (IdProduct, product) => {
    return Product.update(product, { where: { IdProduct } });
}

const deleteProduct = async (IdProduct) => {
    return Product.destroy({ where: { IdProduct } });
}

const changeStateProduct = async (IdProduct, state) => {
    return Product.update({ state }, { where: { IdProduct } });
}

const getProductsBySupplier = async (IdSupplier) => {
    return Product.findAll({ where: { IdSupplier } });
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    changeStateProduct,
    getProductsBySupplier
};