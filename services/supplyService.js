// RUTA: services/supplyService.js

const supplyRepository = require('../repositories/supplyRepository');
const { Product, sequelize } = require('../models');
const { BadRequestError, ApplicationError, NotFoundError } = require('../utils/customErrors');

/**
 * Crea un nuevo insumo y, de forma automática, crea o enlaza su correspondiente
 * producto de inventario para la gestión de stock, todo dentro de una única transacción.
 * @param {object} supplyData - Datos del insumo (ej. { supplyName, description, unitOfMeasure })
 */
const createSupply = async (supplyData) => {
    const t = await sequelize.transaction();
    try {
        const { supplyName, description, unitOfMeasure } = supplyData;

        if (!supplyName || supplyName.trim() === '') {
            await t.rollback(); // No es necesario continuar si los datos son inválidos
            throw new BadRequestError('El nombre del insumo es requerido.');
        }

        const trimmedSupplyName = supplyName.trim();

        // 1. Verificar si ya existe un insumo con ese nombre (DENTRO DE LA TRANSACCIÓN).
        const existingSupply = await supplyRepository.findByName(trimmedSupplyName, t);
        if (existingSupply) {
            await t.rollback();
            throw new BadRequestError(`El insumo '${trimmedSupplyName}' ya existe.`);
        }

        // 2. Buscar si ya existe un PRODUCTO con ese nombre.
        let productInventory = await Product.findOne({ where: { productName: trimmedSupplyName } }, { transaction: t });

        if (!productInventory) {
            // 3. Si no existe, lo creamos.
            console.log(`[SupplyService] El producto de inventario para '${trimmedSupplyName}' no existe. Creando automáticamente...`);
            productInventory = await Product.create({
                productName: trimmedSupplyName,
                description: description || `Insumo de inventario: ${trimmedSupplyName}`,
                isSellable: false,
                currentStock: 0,
                unitOfMeasure: unitOfMeasure || 'unidad',
            }, { transaction: t });
            console.log(`[SupplyService] Producto de inventario creado con ID: ${productInventory.idProduct}`);
        } else {
            console.log(`[SupplyService] Producto de inventario para '${trimmedSupplyName}' ya existía. Enlazando con ID: ${productInventory.idProduct}`);
        }

        // 4. Crear el insumo y asociarlo al producto (DENTRO DE LA TRANSACCIÓN).
        const newSupplyPayload = {
            ...supplyData,
            supplyName: trimmedSupplyName,
            idProduct: productInventory.idProduct
        };

        const newSupply = await supplyRepository.create(newSupplyPayload, t);

        // Si todo fue exitoso, confirmamos la transacción.
        await t.commit();
        
        return newSupply;

    } catch (error) {
        // Aseguramos que el rollback se ejecute si la transacción no ha sido finalizada.
        if (t && !t.finished) {
            await t.rollback();
        }
        
        console.error("Error en createSupply service:", error);

        // Re-lanzamos el error para que el controlador lo maneje, pero sin crear uno nuevo si ya es uno de los nuestros.
        if (error instanceof BadRequestError || error instanceof ApplicationError) {
            throw error;
        }
        
        throw new ApplicationError(`Error al crear el insumo: ${error.message || 'Error desconocido'}`);
    }
};

const getAllSupplies = async (filters) => {
    return supplyRepository.findAll(filters);
};

const getSupplyById = async (idSupply) => {
    const supply = await supplyRepository.findById(idSupply);
    if (!supply) {
        throw new NotFoundError(`Insumo con ID ${idSupply} no encontrado.`);
    }
    return supply;
};

const updateSupply = async (idSupply, supplyData) => {
    const existingSupply = await supplyRepository.findById(idSupply);
    if (!existingSupply) {
        throw new NotFoundError(`Insumo con ID ${idSupply} no encontrado para actualizar.`);
    }

    try {
        await supplyRepository.update(idSupply, supplyData);
        return await supplyRepository.findById(idSupply);
    } catch (error) {
        console.error("Service[Supply]: Error al actualizar insumo:", error);
        if (error instanceof BadRequestError || error instanceof NotFoundError) throw error;
        throw new ApplicationError(`Error al actualizar el insumo: ${error.message}`);
    }
};

const deleteSupply = async (idSupply) => {
    const existingSupply = await supplyRepository.findById(idSupply);
    if (!existingSupply) {
        throw new NotFoundError(`Insumo con ID ${idSupply} no encontrado para eliminar.`);
    }
    const affectedRows = await supplyRepository.destroy(idSupply);
    if (affectedRows === 0) {
        throw new ApplicationError(`No se pudo eliminar el insumo ID ${idSupply}.`);
    }
};

const changeSupplyStatus = async (idSupply, newStatus) => {
    const existingSupply = await supplyRepository.findById(idSupply);
    if (!existingSupply) {
        throw new NotFoundError(`Insumo con ID ${idSupply} no encontrado para cambiar estado.`);
    }
    if (existingSupply.status === newStatus) {
        throw new BadRequestError(`El insumo ya se encuentra en el estado solicitado (${newStatus ? 'Activo' : 'Inactivo'}).`);
    }
    await supplyRepository.changeStatus(idSupply, newStatus);
    return await supplyRepository.findById(idSupply);
};

module.exports = {
    createSupply,
    getAllSupplies,
    getSupplyById,
    updateSupply,
    deleteSupply,
    changeSupplyStatus,
};