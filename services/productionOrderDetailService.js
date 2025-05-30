// services/productionOrderDetailService.js
const podRepo = require('../repositories/productionOrderDetailRepository'); // POD = ProductionOrderDetail
const { ProductionOrder, Process, sequelize } = require('../models');
const { NotFoundError, BadRequestError, ApplicationError } = require('../utils/customErrors');

const addStepToOrder = async (idProductionOrder, stepData) => {
    const t = await sequelize.transaction();
    try {
        const order = await ProductionOrder.findByPk(idProductionOrder, { transaction: t });
        if (!order) throw new NotFoundError(`Orden de producción ID ${idProductionOrder} no encontrada.`);
        if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
            throw new BadRequestError('No se pueden añadir pasos a una orden completada o cancelada.');
        }
        // Validar que idProcess exista
        const process = await Process.findByPk(stepData.idProcess, {transaction: t});
        if (!process) throw new NotFoundError(`Proceso maestro con ID ${stepData.idProcess} no encontrado.`);

        // Lógica para determinar processOrder si no se provee o para evitar duplicados
        if (stepData.processOrder) {
            const existingStepOrder = await ProductionOrderDetail.findOne({
                where: { idProductionOrder, processOrder: stepData.processOrder },
                transaction: t
            });
            if (existingStepOrder) {
                throw new BadRequestError(`Ya existe un paso con el número de orden ${stepData.processOrder} para esta orden de producción.`);
            }
        } else {
            // Auto-asignar siguiente processOrder
            const lastStep = await ProductionOrderDetail.findOne({
                where: { idProductionOrder },
                order: [['processOrder', 'DESC']],
                attributes: ['processOrder'],
                transaction: t
            });
            stepData.processOrder = (lastStep ? lastStep.processOrder : 0) + 1;
        }
        
        const fullStepData = {
            ...stepData,
            idProductionOrder,
            // Si processNameSnapshot no viene, tomarlo del Process maestro
            processNameSnapshot: stepData.processNameSnapshot || process.processName,
            processDescriptionSnapshot: stepData.processDescriptionSnapshot || process.description,
        };

        const newStep = await podRepo.addStep(fullStepData, t);
        await t.commit();
        return podRepo.findStepByIdWithDetails(newStep.idProductionOrderDetail); // Devolver con detalles
    } catch (error) {
        await t.rollback();
        console.error("Error en service addStepToOrder:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al añadir paso a la orden: ${error.message}`);
    }
};

const getStepsByOrderId = async (idProductionOrder) => {
    // Validar que la orden exista primero
    const orderExists = await ProductionOrder.findByPk(idProductionOrder);
    if(!orderExists) throw new NotFoundError(`Orden de producción con ID ${idProductionOrder} no encontrada.`);
    return podRepo.findStepsByOrderId(idProductionOrder);
};

const getStepById = async (idProductionOrderDetail) => {
    const step = await podRepo.findStepByIdWithDetails(idProductionOrderDetail);
    if (!step) throw new NotFoundError(`Paso de orden ID ${idProductionOrderDetail} no encontrado.`);
    return step;
};

const deleteStep = async (idProductionOrderDetail /*, idProductionOrder */) => {
    // Añadir lógica de negocio: no borrar si la orden está COMPLETED/CANCELLED,
    // o si el paso está IN_PROGRESS/COMPLETED, a menos que haya una razón específica.
    const t = await sequelize.transaction();
    try {
        const step = await podRepo.findStepByIdWithDetails(idProductionOrderDetail); // Incluir la orden padre
        if (!step) throw new NotFoundError(`Paso de orden ID ${idProductionOrderDetail} no encontrado.`);

        // if (step.productionOrder && (step.productionOrder.status === 'COMPLETED' || step.productionOrder.status === 'CANCELLED')) {
        //     throw new BadRequestError('No se pueden eliminar pasos de una orden finalizada.');
        // }
        // if (step.status === 'COMPLETED' || step.status === 'IN_PROGRESS') {
        //     throw new BadRequestError(`No se puede eliminar un paso en estado ${step.status}.`);
        // }

        const deleted = await podRepo.deleteStepById(idProductionOrderDetail, t);
        // Lógica si se necesita reordenar los 'processOrder' de los pasos restantes (complejo)
        await t.commit();
        return deleted;
    } catch (error) {
        await t.rollback();
        console.error("Error en service deleteStep:", error);
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        throw new ApplicationError(`Error al eliminar el paso: ${error.message}`);
    }
};


const getStepsByEmployeeId = async (idEmployee) => {
    return podRepo.findStepsByEmployee(idEmployee);
};

const getAllActiveSteps = async () => {
    return podRepo.findAllActiveSteps();
};

module.exports = {
    addStepToOrder,
    getStepsByOrderId,
    getStepById,
    deleteStep,
    getStepsByEmployeeId,
    getAllActiveSteps,
    // El update y changeStatus de un paso se manejan centralmente en productionOrderService.updateProductionOrderStep
};