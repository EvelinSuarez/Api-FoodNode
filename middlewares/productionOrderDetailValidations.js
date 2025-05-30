// middlewares/productionOrderDetailValidations.js
const { body, param } = require("express-validator");
const { ProductionOrderDetail, ProductionOrder, Process, Employee } = require("../models");
const { Op } = require("sequelize");

const VALID_STEP_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']; // Mismos que en productionOrderValidations

const validateEntityExistence = (model, errorMessage) => async (id) => {
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) return Promise.reject('ID inválido.');
    const entity = await model.findByPk(parseInt(id));
    if (!entity) return Promise.reject(errorMessage);
    return true;
};

const validateProductionOrderPkParam = param('idProductionOrder') // Para rutas anidadas
    .isInt({ min: 1 }).withMessage('El ID de la orden de producción debe ser un entero positivo.')
    .custom(validateEntityExistence(ProductionOrder, 'La orden de producción no existe.'));

const validateProductionOrderDetailPkParam = param('idProductionOrderDetail') // Para rutas anidadas o directas
    .isInt({ min: 1 }).withMessage('El ID del paso de la orden debe ser un entero positivo.')
    .custom(validateEntityExistence(ProductionOrderDetail, 'El paso de la orden no existe.'));


// Para POST /production-orders/:idProductionOrder/steps (Añadir un paso a una orden existente)
const addStepToOrderValidation = [
    validateProductionOrderPkParam,
    param('idProductionOrder').custom(async (idOrder) => { // Validar que la orden no esté finalizada
        const order = await ProductionOrder.findByPk(idOrder);
        if (order && (order.status === 'COMPLETED' || order.status === 'CANCELLED')) {
            return Promise.reject('No se pueden añadir pasos a una orden completada o cancelada.');
        }
    }),
    body('idProcess')
        .isInt({ min: 1 }).withMessage('El ID del proceso maestro es requerido.')
        .custom(validateEntityExistence(Process, 'El proceso maestro especificado no existe.')),
    body('processOrder') // El orden del nuevo paso
        .isInt({ min: 1 }).withMessage('El número de orden del paso es requerido y debe ser positivo.'),
    body('processNameSnapshot')
        .notEmpty().withMessage('El nombre del paso (snapshot) es requerido.')
        .isString().isLength({ max: 150 }),
    body('processDescriptionSnapshot')
        .optional({ nullable: true })
        .isString().isLength({ max: 1000 }),
    body('status')
        .optional()
        .isIn(VALID_STEP_STATUSES).withMessage(`Estado inválido. Valores permitidos: ${VALID_STEP_STATUSES.join(', ')}`)
        .default('PENDING'),
    body('idEmployeeAssigned')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('ID de empleado inválido.')
        .custom(validateEntityExistence(Employee, 'El empleado a asignar no existe.')),
    body('startDate').optional({nullable: true}).isISO8601().toDate(),
    body('endDate').optional({nullable: true}).isISO8601().toDate()
        .custom((value, { req }) => {
            if (value && req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
                throw new Error('La fecha de fin no puede ser anterior a la de inicio.');
            }
            return true;
        }),
    body('observations').optional({nullable: true}).isString().isLength({max: 500})
];

const getProductionOrderDetailsByOrderValidation = [
    validateProductionOrderPkParam
];

const getProductionOrderDetailByIdValidation = [
    validateProductionOrderDetailPkParam
];

const deleteProductionOrderDetailValidation = [
    validateProductionOrderDetailPkParam,
    // Opcional: añadir validación para no borrar si la orden está en ciertos estados
    // o si el paso está 'COMPLETED'.
    // param('idProductionOrderDetail').custom(async (idStep, { req }) => {
    //     const step = await ProductionOrderDetail.findByPk(idStep, { include: 'productionOrder'});
    //     if (step.productionOrder && (step.productionOrder.status === 'COMPLETED' || step.productionOrder.status === 'CANCELLED')) {
    //         return Promise.reject('No se pueden eliminar pasos de una orden finalizada.');
    //     }
    //     if (step.status === 'COMPLETED') {
    //         return Promise.reject('No se puede eliminar un paso ya completado.');
    //     }
    // })
];

const getStepsByEmployeeValidation = [
    param('idEmployee')
        .isInt({min:1}).withMessage('ID de empleado inválido.')
        .custom(validateEntityExistence(Employee, 'El empleado no existe.'))
];


module.exports = {
    addStepToOrderValidation,
    getProductionOrderDetailsByOrderValidation,
    getProductionOrderDetailByIdValidation,
    deleteProductionOrderDetailValidation,
    getStepsByEmployeeValidation,
    // Las validaciones para update y changeStatus se manejan en productionOrderValidations.js
    // para el endpoint anidado.
};