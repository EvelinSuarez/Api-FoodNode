// repositories/productionOrderSupplyRepository.js
const { ProductionOrderSupply, Supply, ProductionOrder, sequelize } = require('../models'); // Asegúrate de importar Supply
const { Op } = require('sequelize');

// Añade o actualiza (si ya existe combinación de orden+insumo) insumos consumidos.
// O simplemente crea nuevos registros.
// Para una lógica de "upsert" más compleja por orden+insumo, se necesitaría buscar primero.
// Esta versión simplemente crea nuevos registros de ProductionOrderSupply.
const bulkCreateConsumedSupplies = async (idProductionOrder, suppliesData, transaction) => {
    const recordsToCreate = suppliesData.map(data => ({
        idProductionOrder,
        idSupply: data.idSupply,
        quantityConsumed: data.quantityConsumed,
        measurementUnitConsumedSnapshot: data.measurementUnitConsumedSnapshot, // O tomar del Supply.supplyName
        consumptionDate: data.consumptionDate || new Date(),
        notes: data.notes,
    }));
    return ProductionOrderSupply.bulkCreate(recordsToCreate, { transaction });
};

const findConsumedSuppliesByOrderId = async (idProductionOrder) => {
    return ProductionOrderSupply.findAll({
        where: { idProductionOrder },
        include: [
            {
                model: Supply,
                as: 'supplyData', // Alias definido en models/index.js
                attributes: ['idSupply', 'supplyName', 'measurementUnit']
            }
        ],
        order: [['createdAt', 'ASC']] // O por consumptionDate
    });
};

const findConsumedSupplyRecordById = async (idProductionOrderSupply) => {
    return ProductionOrderSupply.findByPk(idProductionOrderSupply, {
        include: [
            { model: Supply, as: 'supplyData' },
            { model: ProductionOrder, as: 'productionOrder', attributes: ['idProductionOrder', 'status'] }
        ]
    });
};

const updateRecord = async (idProductionOrderSupply, dataToUpdate, transaction) => {
    const [affectedRows] = await ProductionOrderSupply.update(dataToUpdate, {
        where: { idProductionOrderSupply },
        transaction
    });
    return affectedRows > 0;
};

const deleteRecordById = async (idProductionOrderSupply, transaction) => {
    const deletedCount = await ProductionOrderSupply.destroy({
        where: { idProductionOrderSupply },
        transaction
    });
    return deletedCount > 0;
};

// Para verificar si el registro pertenece a la orden antes de update/delete
const findRecordByOrderAndId = async (idProductionOrder, idProductionOrderSupply, transaction) => {
    return ProductionOrderSupply.findOne({
        where: { idProductionOrderSupply, idProductionOrder },
        transaction
    });
};

module.exports = {
    bulkCreateConsumedSupplies,
    findConsumedSuppliesByOrderId,
    findConsumedSupplyRecordById,
    updateRecord,
    deleteRecordById,
    findRecordByOrderAndId,
};