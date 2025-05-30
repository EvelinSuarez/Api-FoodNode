// services/supplyService.js
const supplyRepository = require('../repositories/supplyRepository');
const { NotFoundError, BadRequestError, ApplicationError } = require('../utils/customErrors');

const createSupply = async (supplyData) => {
    // La validación de unicidad de supplyName y otros campos ya la hizo el middleware.
    // Aquí podrías añadir lógica de negocio adicional si fuera necesario.
    try {
        // Asegurarse que el estado por defecto se aplique si no viene en supplyData
        if (supplyData.status === undefined) {
            supplyData.status = true; // O tomar de defaultValue del modelo
        }
        return await supplyRepository.create(supplyData);
    } catch (error) {
        console.error("Service[Supply]: Error al crear insumo:", error);
        if (error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al crear el insumo: ${error.message}`);
    }
};

const getAllSupplies = async (filters) => {
    // Lógica de transformación de filtros si es necesario antes de pasar al repo
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
    // Validar que el insumo exista (ya lo hace el middleware y lo re-chequeamos)
    const existingSupply = await supplyRepository.findById(idSupply);
    if (!existingSupply) {
        throw new NotFoundError(`Insumo con ID ${idSupply} no encontrado para actualizar.`);
    }

    // La validación de unicidad de supplyName (si cambia) ya la hizo el middleware.
    try {
        const affectedRows = await supplyRepository.update(idSupply, supplyData);
        // if (affectedRows === 0 && Object.keys(supplyData).length > 0) {
            // Podría ser que no hubo cambios reales.
        // }
        return await supplyRepository.findById(idSupply); // Devolver el objeto actualizado
    } catch (error) {
        console.error("Service[Supply]: Error al actualizar insumo:", error);
        if (error instanceof BadRequestError || error instanceof NotFoundError) throw error;
        throw new ApplicationError(`Error al actualizar el insumo: ${error.message}`);
    }
};

const deleteSupply = async (idSupply) => {
    // La validación de existencia y si está en uso ya la hizo el middleware.
    const existingSupply = await supplyRepository.findById(idSupply); // Re-check
    if (!existingSupply) {
        throw new NotFoundError(`Insumo con ID ${idSupply} no encontrado para eliminar.`);
    }

    const affectedRows = await supplyRepository.destroy(idSupply);
    if (affectedRows === 0) {
        // No debería pasar si las validaciones y el findById anterior funcionaron.
        throw new ApplicationError(`No se pudo eliminar el insumo ID ${idSupply}.`);
    }
    // No se devuelve contenido en un delete exitoso (controlador envía 204)
};

const changeSupplyStatus = async (idSupply, newStatus) => {
    const existingSupply = await supplyRepository.findById(idSupply);
    if (!existingSupply) {
        throw new NotFoundError(`Insumo con ID ${idSupply} no encontrado para cambiar estado.`);
    }
    if (existingSupply.status === newStatus) {
        throw new BadRequestError(`El insumo ya se encuentra en el estado solicitado (${newStatus ? 'Activo' : 'Inactivo'}).`);
    }

    const affectedRows = await supplyRepository.changeStatus(idSupply, newStatus);
    if (affectedRows > 0) {
        return await supplyRepository.findById(idSupply); // Devuelve el insumo actualizado
    } else {
        // Esto no debería pasar si el findById lo encontró.
        throw new ApplicationError(`No se pudo cambiar el estado del insumo ID ${idSupply}.`);
    }
};

module.exports = {
    createSupply,
    getAllSupplies,
    getSupplyById,
    updateSupply,
    deleteSupply,
    changeSupplyStatus,
};