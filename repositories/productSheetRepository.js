const ProductSheet = require('../models/productSheet');
const SpecSheet = require('../models/specSheet');
const Supplier = require('../models/supplier');

const createProductSheet = async (productSheet) => {
    return ProductSheet.create(productSheet);
}

const getAllProductSheets = async () => {
    return ProductSheet.findAll({
        include: [
            { model: SpecSheet },
            { model: Supplier }
        ]
    });
}

const getProductSheetById = async (idProductSheet) => {
    return ProductSheet.findByPk(idProductSheet, {
        include: [
            { model: SpecSheet },
            { model: Supplier }
        ]
    });
}

const updateProductSheet = async (idProductSheet, productSheet) => {
    return ProductSheet.update(productSheet, { 
        where: { idProductSheet } 
    });
}

const deleteProductSheet = async (idProductSheet) => {
    return ProductSheet.destroy({ 
        where: { idProductSheet } 
    });
}

const getProductSheetsBySpecSheet = async (idSpecSheet) => {
    return ProductSheet.findAll({ 
        where: { idSpecSheet },
        include: [{ model: Supplier }]
    });
}

const getProductSheetsBySupplier = async (idSupplier) => {
    return ProductSheet.findAll({ 
        where: { idSupplier },
        include: [{ model: SpecSheet }]
    });
}

module.exports = {
    createProductSheet,
    getAllProductSheets,
    getProductSheetById,
    updateProductSheet,
    deleteProductSheet,
    getProductSheetsBySpecSheet,
    getProductSheetsBySupplier
};