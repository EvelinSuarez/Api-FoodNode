// RUTA: repositories/supplyRepository.js

const { Supply, sequelize } = require('../models');
const { Op } = require('sequelize');
const { BadRequestError } = require('../utils/customErrors');

/**
 * Crea un nuevo insumo. Puede operar dentro de una transacción.
 * @param {object} supplyData - Los datos del insumo a crear.
 * @param {import('sequelize').Transaction} [transaction=null] - La transacción de Sequelize, si existe.
 * @returns {Promise<Supply>}
 */
const create = async (supplyData, transaction = null) => {
    try {
        const options = {};
        if (transaction) {
            options.transaction = transaction;
        }
        return await Supply.create(supplyData, options);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new BadRequestError('Ya existe un insumo con este nombre.');
        }
        console.error("Repo[Supply]: Error al crear insumo:", error);
        throw error;
    }
};

/**
 * Encuentra todos los insumos que coincidan con los filtros.
 * @param {object} [filters={}] - Filtros para la búsqueda.
 * @returns {Promise<Supply[]>}
 */
const findAll = async (filters = {}) => {
    const whereClause = {};
    if (filters.status !== undefined) {
        whereClause.status = filters.status === 'true' || filters.status === true;
    }
    if (filters.supplyName) {
        whereClause.supplyName = { [Op.iLike]: `%${filters.supplyName}%` };
    }
    return Supply.findAll({
        where: whereClause,
        order: [['supplyName', 'ASC']]
    });
};

/**
 * Busca un insumo por su ID (llave primaria).
 * @param {number} idSupply - El ID del insumo.
 * @returns {Promise<Supply|null>}
 */
const findById = async (idSupply) => {
    return Supply.findByPk(parseInt(idSupply));
};

/**
 * Busca un insumo por su nombre exacto. Puede operar dentro de una transacción.
 * @param {string} name - El nombre del insumo a buscar.
 * @param {import('sequelize').Transaction} [transaction=null] - La transacción de Sequelize, si existe.
 * @returns {Promise<Supply|null>}
 */
const findByName = async (name, transaction = null) => {
    const options = { where: { supplyName: name } };
    if (transaction) {
        options.transaction = transaction;
    }
    return await Supply.findOne(options);
};

/**
 * Actualiza un insumo.
 * @param {number} idSupply - El ID del insumo a actualizar.
 * @param {object} supplyData - Los nuevos datos para el insumo.
 * @returns {Promise<number>} - El número de filas afectadas.
 */
const update = async (idSupply, supplyData) => {
    const { idSupply: _, ...dataToUpdate } = supplyData;
    try {
        const [affectedRows] = await Supply.update(dataToUpdate, {
            where: { idSupply: parseInt(idSupply) }
        });
        return affectedRows;
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new BadRequestError('Ya existe otro insumo con este nombre.');
        }
        console.error("Repo[Supply]: Error al actualizar insumo:", error);
        throw error;
    }
};

/**
 * Elimina un insumo por su ID.
 * @param {number} idSupply - El ID del insumo a eliminar.
 * @returns {Promise<number>} - El número de filas eliminadas.
 */
const destroy = async (idSupply) => {
    try {
        return await Supply.destroy({
            where: { idSupply: parseInt(idSupply) }
        });
    } catch (error) {
        console.error("Repo[Supply]: Error al eliminar insumo:", error);
        throw error;
    }
};

/**
 * Cambia el estado de un insumo (activo/inactivo).
 * @param {number} idSupply - El ID del insumo.
 * @param {boolean} status - El nuevo estado.
 * @returns {Promise<number>} - El número de filas afectadas.
 */
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
    findByName,
    update,
    destroy,
    changeStatus,
};