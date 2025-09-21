// RUTA: middlewares/productionOrderValidations.js
// --- VERSIÓN COMPLETA Y FINAL CON LA VALIDACIÓN DE FINALIZACIÓN CORREGIDA ---

const { body, param, query } = require("express-validator");
const {
    ProductionOrder,
    Product,
    SpecSheet,
    Employee,
    Provider,
    Process,
    ProductionOrderDetail,
    Supply
} = require("../models");
const { Op } = require("sequelize");

const VALID_ORDER_STATUSES = ['PENDING', 'SETUP', 'SETUP_COMPLETED', 'IN_PROGRESS', 'PAUSED', 'ALL_STEPS_COMPLETED', 'COMPLETED', 'CANCELLED'];
const VALID_STEP_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'];

const entityExists = (model, fieldNameForMessage, customErrorMessage) => {
  return async (value) => {
    if (value === null || value === undefined || value === '') {
        return true;
    }
    const pk = parseInt(value);
    if (isNaN(pk) || pk <= 0) {
      throw new Error(`El ID para '${fieldNameForMessage || model.name}' debe ser un entero positivo.`);
    }
    const record = await model.findByPk(pk);
    if (!record) {
      throw new Error(customErrorMessage || `${fieldNameForMessage || model.name} con ID ${pk} no encontrado.`);
    }
    return true;
  };
};

const loadProductionOrder = async (req, res, next) => {
    try {
        if (req.params.idProductionOrder) {
            const orderId = parseInt(req.params.idProductionOrder);
            const order = await ProductionOrder.findByPk(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Orden de producción no encontrada.' });
            }
            req.productionOrderInstance = order;
        }
        next();
    } catch (error) {
        console.error("Error cargando orden en middleware:", error);
        res.status(500).json({ message: "Error interno al cargar datos de la orden." });
    }
};

const createProductionOrderValidation = [
    body('idProduct').optional({ nullable: true }).isInt({ min: 1 }).withMessage('El ID del producto debe ser un entero positivo.').bail().custom(entityExists(Product, 'Producto')),
    body('initialAmount').notEmpty().withMessage('La cantidad inicial es requerida.').isInt({ min: 0 }),
    body('idEmployeeRegistered').optional({ nullable: true }).isInt({ min: 1 }).withMessage('El ID del empleado debe ser un entero positivo.').bail().custom(entityExists(Employee, 'Empleado')),
    body('idSpecSheet').optional({ nullable: true }).isInt({ min: 1 }).withMessage('El ID de la ficha debe ser un entero positivo.').bail().custom(entityExists(SpecSheet, 'Ficha Técnica')),
    body('idProvider').optional({ nullable: true }).isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un entero positivo.').bail().custom(entityExists(Provider, 'Proveedor')),
    body('observations').optional({ nullable: true }).isString().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['PENDING', 'SETUP', 'SETUP_COMPLETED']),
];

const startProductionValidation = [
    (req, res, next) => {
        if (!req.productionOrderInstance) return res.status(404).json({ message: "Orden no encontrada." });
        if (req.productionOrderInstance.status !== 'SETUP_COMPLETED') {
            return res.status(400).json({ message: `La orden debe estar en estado 'SETUP_COMPLETED' para iniciar.` });
        }
        next();
    },
    body('idEmployeeAssigned').notEmpty().withMessage('Se requiere el ID del empleado.').isInt({ min: 1 }).bail().custom(entityExists(Employee, 'Empleado')),
];

const commonIdParamsValidation = [
    param('idProductionOrder').isInt({ min: 1 }).withMessage('El ID de la orden en la URL debe ser un entero positivo.'),
];

const updateProductionOrderValidation = [
    body('idProduct').optional({ nullable: true }).isInt({ min: 1 }).bail().custom(entityExists(Product, 'Producto')),
    body('productNameSnapshot').optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 255 }),
    body('initialAmount').optional().isInt({ min: 0 }),
    body('inputInitialWeight').optional({ nullable: true }).isDecimal({ decimal_digits: '0,3' }).toFloat().custom(v => v >= 0),
    body('inputInitialWeightUnit').optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 50 }),
    body('idSpecSheet').optional({ nullable: true }).custom(async (value) => { if (value) { const pk = parseInt(value); if (isNaN(pk) || pk <= 0) throw new Error('ID de ficha inválido.'); } return true; }),
    body('idEmployeeRegistered').optional({ nullable: true }).isInt({ min: 1 }).bail().custom(entityExists(Employee, 'Empleado')),
    body('idProvider').optional({ nullable: true }).isInt({ min: 1 }).bail().custom(entityExists(Provider, 'Proveedor')),
    body('observations').optional({ nullable: true }).isString().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(VALID_ORDER_STATUSES),
];

const updateProductionOrderStepValidation = [
    param('idProductionOrderDetail').isInt({ min: 1 }).bail().custom(async (v, { req }) => { const step = await ProductionOrderDetail.findOne({ where: { idProductionOrderDetail: v, idProductionOrder: req.params.idProductionOrder } }); if (!step) throw new Error('El paso no existe o no pertenece a la orden.'); req.productionStepInstance = step; }),
    body('idEmployeeAssigned').optional({ nullable: true }).isInt({ min: 1 }).bail().custom(entityExists(Employee, 'Empleado')),
    body('startDate').optional({ nullable: true }).isISO8601().toDate(),
    body('endDate').optional({ nullable: true }).isISO8601().toDate().custom((v, { req }) => { if (req.body.startDate && v < req.body.startDate) throw new Error('La fecha de fin no puede ser anterior al inicio.'); return true; }),
    body('status').optional().isIn(VALID_STEP_STATUSES),
    body('observations').optional({ nullable: true }).isString().trim().isLength({ max: 500 }),
];

const finalizeProductionOrderValidation = [
    body('finalQuantityProduct')
        .exists({ checkFalsy: true }).withMessage('La cantidad producida es requerida.')
        .isInt({ min: 0 }).withMessage('La cantidad producida debe ser un número no negativo.'),
    
    // --- INICIO DE LA CORRECCIÓN ---
    body('finishedProductWeight')
        .optional({ nullable: true, checkFalsy: true }) // Permite "", null, undefined
        .isDecimal({ decimal_digits: '0,3' }).withMessage('El peso terminado debe ser un número decimal (máx 3 decimales).')
        .toFloat()
        .custom(val => val >= 0).withMessage('El peso terminado debe ser no negativo.'),

    body('finishedProductWeightUnit')
        .if(body('finishedProductWeight').exists({ checkFalsy: true }))
        .notEmpty().withMessage('La unidad es requerida si se especifica el peso terminado.')
        .isString().trim().isLength({ min: 1, max: 50 }),

    body('inputFinalWeightUnused')
        .optional({ nullable: true, checkFalsy: true }) // Permite "", null, undefined
        .isDecimal({ decimal_digits: '0,3' }).withMessage('El peso de insumo no usado debe ser decimal.')
        .toFloat()
        .custom(val => val >= 0).withMessage('El peso de insumo no usado debe ser no negativo.'),
    
    body('inputFinalWeightUnusedUnit')
        .if(body('inputFinalWeightUnused').exists({ checkFalsy: true }))
        .notEmpty().withMessage('La unidad es requerida si se especifica el peso no usado.')
        .isString().trim().isLength({ min: 1, max: 50 }),
    // --- FIN DE LA CORRECCIÓN ---
        
    body('observations').optional({ nullable: true }).isString().trim(),
];

const changeProductionOrderStatusValidation = [
    body('status').notEmpty().isIn(VALID_ORDER_STATUSES),
    body('observations').optional({ nullable: true }).isString().trim().isLength({max: 500}),
];

const deleteProductionOrderValidation = [
    (req, res, next) => {
        if (!req.productionOrderInstance) return res.status(404).json({message: "Orden no encontrada."});
        const { status } = req.productionOrderInstance;
        if (['IN_PROGRESS', 'COMPLETED', 'ALL_STEPS_COMPLETED', 'PAUSED'].includes(status)) {
             return res.status(400).json({ message: `No se puede eliminar una orden en estado: ${status}. Considere cancelarla.` });
        }
        next();
    }
];

const getAllProductionOrdersQueryValidation = [
    query('status').optional().trim(),
    query('idProduct').optional().isInt({min: 1}),
    query('idEmployeeRegistered').optional().isInt({min: 1}),
    query('page').optional().isInt({min: 1}).toInt(),
    query('limit').optional().isInt({min: 1, max: 100}).toInt(),
    query('sortBy').optional().trim().isString(),
    query('sortOrder').optional().trim().toUpperCase().isIn(['ASC', 'DESC']),
];

module.exports = {
    loadProductionOrder,
    createProductionOrderValidation,
    commonIdParamsValidation,
    updateProductionOrderValidation,
    updateProductionOrderStepValidation,
    finalizeProductionOrderValidation,
    changeProductionOrderStatusValidation,
    deleteProductionOrderValidation,
    getAllProductionOrdersQueryValidation,
    startProductionValidation,
};