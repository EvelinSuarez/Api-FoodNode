// repositories/supplyRepository.js
const { Supply, sequelize } = require('../models'); // Importar Supply y Op si es necesario
const { Op } = require('sequelize');
const { BadRequestError } = require('../utils/customErrors'); // Para errores específicos del repo

const create = async (supplyData) => {
    try {
        return await Supply.create(supplyData);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new BadRequestError('Ya existe un insumo con este nombre.');
        }
        console.error("Repo[Supply]: Error al crear insumo:", error);
        throw error; // Re-lanzar para que el servicio lo maneje
    }
};

const findAll = async (filters = {}) => {
    const whereClause = {};
    if (filters.status !== undefined) {
        whereClause.status = filters.status === 'true' || filters.status === true;
    }
    if (filters.supplyName) {
        whereClause.supplyName = { [Op.iLike]: `%${filters.supplyName}%` };
    }
    // if (filters.idCategory) {
    //     whereClause.idCategory = parseInt(filters.idCategory);
    // }
    return Supply.findAll({
        where: whereClause,
        order: [['supplyName', 'ASC']]
        // include: [{ model: SupplyCategory, as: 'category'}] // Si tienes categorías
    });
};

const findById = async (idSupply) => {
    return Supply.findByPk(parseInt(idSupply)
        // ,{ include: [{ model: SupplyCategory, as: 'category'}]}
    );
};

const update = async (idSupply, supplyData) => {
    // Filtrar campos que no deben ser actualizados directamente o que son PK
    const { idSupply: _, ...dataToUpdate } = supplyData;

    try {
        const [affectedRows] = await Supply.update(dataToUpdate, {
            where: { idSupply: parseInt(idSupply) }
        });
        return affectedRows; // Devuelve el número de filas afectadas
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new BadRequestError('Ya existe otro insumo con este nombre.');
        }
        console.error("Repo[Supply]: Error al actualizar insumo:", error);
        throw error;
    }
};

const destroy = async (idSupply) => {
    // La validación de si está en uso se hace en el middleware/servicio.
    // Aquí solo intentamos eliminar.
    try {
        return await Supply.destroy({
            where: { idSupply: parseInt(idSupply) }
        });
    } catch (error) {
        // Podría haber un SequelizeForeignKeyConstraintError si no se validó antes y hay onDelete: RESTRICT
        console.error("Repo[Supply]: Error al eliminar insumo:", error);
        throw error;
    }
};

// changeStatus es un caso particular de update, pero lo mantenemos separado por claridad si quieres.
const changeStatus = async (idSupply, status) => {
    const [affectedRows] = await Supply.update({ status }, {
        where: { idSupply: parseInt(idSupply) }
    });
    return affectedRows;
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    destroy,
    changeStatus,
};