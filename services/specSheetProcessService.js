const specSheetProcessRepo = require("../repositories/specSheetProcessRepository");
const { SpecSheet, Process } = require('../models'); // Para verificaciones si es necesario
const { NotFoundError, BadRequestError, ApplicationError } = require('../utils/customErrors');

const createSpecSheetProcess = async (processData) => {
    // Las validaciones de existencia de SpecSheet y Process maestro ya las hizo el middleware
    // La validación de unicidad de processOrder también
    try {
        // Los campos como idSpecSheet, idProcess, processOrder vienen de processData
        const newProcess = await specSheetProcessRepo.create(processData);
        // Devolver el objeto completo, podrías buscarlo de nuevo si create no devuelve con includes
        return specSheetProcessRepo.findById(newProcess.idSpecSheetProcess);
    } catch (error) {
        console.error("Service[SpecSheetProcess]: Error al crear proceso:", error);
        if (error instanceof BadRequestError) throw error; // Re-lanzar errores ya tipados
        throw new ApplicationError(`Error al crear el proceso de ficha técnica: ${error.message}`);
    }
};

const getAllSpecSheetProcessesBySpecSheetId = async (idSpecSheet) => {
    // La validación de existencia de idSpecSheet la hizo el middleware
    const processes = await specSheetProcessRepo.findAllBySpecSheetId(idSpecSheet);
    // Devuelve un array (puede ser vacío si no hay procesos), el controlador lo maneja
    return processes; // El repo ya puede incluir 'masterProcessData'
};

const getSpecSheetProcessById = async (idSpecSheetProcess) => {
    const process = await specSheetProcessRepo.findById(idSpecSheetProcess);
    if (!process) {
        throw new NotFoundError(`Proceso de ficha técnica con ID ${idSpecSheetProcess} no encontrado.`);
    }
    return process; // El repo ya puede incluir 'masterProcessData' y 'specSheet'
};

const updateSpecSheetProcess = async (idSpecSheetProcess, updateData) => {
    // Verificar que el proceso exista (lo hace la validación de PkParam, pero doble check)
    const existingProcess = await specSheetProcessRepo.findById(idSpecSheetProcess);
    if (!existingProcess) {
        throw new NotFoundError(`Proceso de ficha técnica con ID ${idSpecSheetProcess} no encontrado para actualizar.`);
    }

    // Aquí puedes añadir lógica de negocio, ej: no actualizar si la ficha técnica está "cerrada"
    // if (existingProcess.specSheet && existingProcess.specSheet.status === 'CLOSED') {
    //     throw new BadRequestError('No se puede modificar procesos de una ficha técnica cerrada.');
    // }

    // La validación de unicidad de processOrder (si cambia) ya la hizo el middleware.
    // El repositorio se encarga de filtrar campos no actualizables.
    try {
        const [affectedRows] = await specSheetProcessRepo.update(idSpecSheetProcess, updateData);
        if (affectedRows === 0 && Object.keys(updateData).length > 0) {
            // Si se enviaron datos para actualizar pero nada cambió (podría ser que los datos eran iguales)
            // o el ID no se encontró (aunque ya lo verificamos antes con findById).
            // Por ahora, asumimos que si affectedRows es 0, es porque no se encontró o no hubo cambios.
            // Si se quiere distinguir "no encontrado" de "sin cambios", se necesitaría más lógica.
            // Devolver el existente si no hay cambios, o error si no se encontró es una opción.
        }
        return await specSheetProcessRepo.findById(idSpecSheetProcess); // Devolver el proceso actualizado
    } catch (error) {
        console.error("Service[SpecSheetProcess]: Error al actualizar proceso:", error);
        if (error instanceof BadRequestError || error instanceof NotFoundError) throw error;
        throw new ApplicationError(`Error al actualizar el proceso de ficha técnica: ${error.message}`);
    }
};

const deleteSpecSheetProcess = async (idSpecSheetProcess) => {
    // Verificar existencia (lo hace la validación de PkParam, pero doble check)
    const existingProcess = await specSheetProcessRepo.findById(idSpecSheetProcess);
    if (!existingProcess) {
        throw new NotFoundError(`Proceso de ficha técnica con ID ${idSpecSheetProcess} no encontrado para eliminar.`);
    }

    // Aquí puedes añadir lógica de negocio, ej: no eliminar si la ficha técnica está en uso en una orden de producción activa.
    // const linkedOrders = await ProductionOrder.count({ where: { idSpecSheet: existingProcess.idSpecSheet, status: ['PENDING', 'IN_PROGRESS'] } });
    // if (linkedOrders > 0) {
    //    throw new BadRequestError('No se puede eliminar el proceso, la ficha técnica está en uso en órdenes de producción activas.');
    // }

    const affectedRows = await specSheetProcessRepo.destroy(idSpecSheetProcess);
    if (affectedRows === 0) {
        // Esto no debería ocurrir si findById lo encontró antes.
        throw new ApplicationError(`No se pudo eliminar el proceso de ficha técnica ID ${idSpecSheetProcess}.`);
    }
    // No se devuelve contenido en un delete exitoso (controlador envía 204)
};

module.exports = {
  createSpecSheetProcess,
  getAllSpecSheetProcessesBySpecSheetId,
  getSpecSheetProcessById,
  updateSpecSheetProcess,
  deleteSpecSheetProcess,
};