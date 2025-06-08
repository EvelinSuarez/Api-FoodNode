// middlewares/productionOrderSupplyValidations.js
const { body, param } = require("express-validator");
const { ProductionOrder, Supply, ProductionOrderSupply } = require("../models");

const validateEntityExistence = (model, errorMessage, pkField = 'id') => async (id) => {
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) return Promise.reject('ID inválido.');
    const entity = await model.findByPk(parseInt(id));
    if (!entity) return Promise.reject(errorMessage);
    return true;
};

const validateProductionOrderPkParam = param('idProductionOrder')
    .isInt({ min: 1 }).withMessage('El ID de la orden de producción debe ser un entero positivo.')
    .custom(validateEntityExistence(ProductionOrder, 'La orden de producción especificada no existe.'));

const validateProductionOrderSupplyPkParam = param('idProductionOrderSupply')
    .isInt({ min: 1 }).withMessage('El ID del registro de consumo debe ser un entero positivo.')
    .custom(validateEntityExistence(ProductionOrderSupply, 'El registro de consumo especificado no existe.'));


const commonSupplyItemValidation = (prefix = '') => [ // prefix para cuando es un array 'body.*.'
    body(`${prefix}idSupply`)
        .exists().withMessage('El ID del insumo es requerido.')
        .isInt({ min: 1 }).withMessage('El ID del insumo debe ser un entero positivo.')
        .custom(validateEntityExistence(Supply, 'El insumo especificado no existe o no está activo.')),
    body(`${prefix}quantityConsumed`)
        .exists().withMessage('La cantidad consumida es requerida.')
        .isDecimal().withMessage('La cantidad consumida debe ser un número decimal.')
        .toFloat()
        .custom(val => val > 0).withMessage('La cantidad consumida debe ser mayor a cero.'),
    body(`${prefix}unitOfMeasureConsumedSnapshot`)
        .optional({ nullable: true })
        .isString().withMessage('La unidad de medida consumida debe ser texto.')
        .isLength({ max: 50 }).withMessage('La unidad de medida no puede exceder los 50 caracteres.'),
    body(`${prefix}consumptionDate`)
        .optional({ nullable: true })
        .isISO8601().withMessage('La fecha de consumo debe ser una fecha válida (ISO8601).')
        .toDate(),
    body(`${prefix}notes`)
        .optional({ nullable: true })
        .isString().withMessage('Las notas deben ser texto.')
        .isLength({ max: 500 }).withMessage('Las notas no pueden exceder los 500 caracteres.'),
];

const addConsumedSuppliesValidation = [
    validateProductionOrderPkParam,
    // Validar que la orden no esté COMPLETED o CANCELLED
    param('idProductionOrder').custom(async (id) => {
        const order = await ProductionOrder.findByPk(id);
        if (order && (order.status === 'COMPLETED' || order.status === 'CANCELLED')) {
            return Promise.reject('No se pueden añadir/modificar consumos a una orden completada o cancelada.');
        }
    }),
    // El body puede ser un objeto o un array de objetos
    body().custom((value, { req }) => {
        if (!Array.isArray(value) && typeof value !== 'object') {
            return Promise.reject('El cuerpo de la solicitud debe ser un objeto o un arreglo de objetos de insumos consumidos.');
        }
        return true;
    }),
    // Si es un array, aplicar validaciones a cada elemento
    body('*.idSupply').if(body().isArray()).exists().withMessage('El ID del insumo es requerido en cada item del array.'),
    // Aplicar commonSupplyItemValidation a cada elemento si es un array
    // Esto es un poco más complejo con express-validator para arrays.
    // Una forma es validar cada campo con el prefijo '*.':
    ...commonSupplyItemValidation('*.'),
    // Otra forma si es un solo objeto (no array):
    ...commonSupplyItemValidation().map(validation => validation.if(body().not().isArray())),
];

const getConsumedSuppliesByOrderValidation = [
    validateProductionOrderPkParam
];

const getConsumedSupplyByIdValidation = [
    validateProductionOrderSupplyPkParam
];

const updateConsumedSupplyRecordValidation = [
    validateProductionOrderPkParam,
    validateProductionOrderSupplyPkParam,
    // Validar que el registro de consumo pertenezca a la orden
    param().custom(async (value, { req }) => {
        const record = await ProductionOrderSupply.findOne({
            where: {
                idProductionOrderSupply: req.params.idProductionOrderSupply,
                idProductionOrder: req.params.idProductionOrder
            }
        });
        if (!record) {
            return Promise.reject('El registro de consumo no pertenece a la orden especificada.');
        }
        const order = await ProductionOrder.findByPk(req.params.idProductionOrder);
        if (order && (order.status === 'COMPLETED' || order.status === 'CANCELLED')) {
            return Promise.reject('No se pueden modificar consumos de una orden completada o cancelada.');
        }
    }),
    // Solo permitir actualizar ciertos campos
    body('quantityConsumed')
        .optional()
        .isDecimal().withMessage('La cantidad consumida debe ser un número decimal.')
        .toFloat()
        .custom(val => val > 0).withMessage('La cantidad consumida debe ser mayor a cero.'),
    body('unitOfMeasureConsumedSnapshot').optional({nullable: true}).isString().isLength({max:50}),
    body('consumptionDate').optional({nullable: true}).isISO8601().toDate(),
    body('notes').optional({nullable: true}).isString().isLength({max:500}),
    // No permitir cambiar idSupply o idProductionOrder aquí
    body('idSupply').not().exists().withMessage('No se puede modificar el insumo de un registro de consumo existente.'),
    body('idProductionOrder').not().exists().withMessage('No se puede modificar la orden de un registro de consumo existente.'),
];

const deleteConsumedSupplyRecordValidation = [
    validateProductionOrderPkParam,
    validateProductionOrderSupplyPkParam,
    param().custom(async (value, { req }) => {
        const record = await ProductionOrderSupply.findOne({
            where: {
                idProductionOrderSupply: req.params.idProductionOrderSupply,
                idProductionOrder: req.params.idProductionOrder
            }
        });
        if (!record) {
            return Promise.reject('El registro de consumo no pertenece a la orden especificada.');
        }
        const order = await ProductionOrder.findByPk(req.params.idProductionOrder);
        if (order && (order.status === 'COMPLETED' || order.status === 'CANCELLED')) {
            return Promise.reject('No se pueden eliminar consumos de una orden completada o cancelada.');
        }
    }),
];


module.exports = {
    addConsumedSuppliesValidation,
    getConsumedSuppliesByOrderValidation,
    getConsumedSupplyByIdValidation,
    updateConsumedSupplyRecordValidation,
    deleteConsumedSupplyRecordValidation,
};