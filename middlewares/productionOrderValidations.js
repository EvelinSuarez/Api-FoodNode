// middlewares/productionOrderValidations.js
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
} = require("../models"); // Asegúrate que la ruta a tus modelos sea correcta
const { Op } = require("sequelize");

const VALID_ORDER_STATUSES = ['PENDING', 'SETUP', 'SETUP_COMPLETED', 'IN_PROGRESS', 'PAUSED', 'ALL_STEPS_COMPLETED', 'COMPLETED', 'CANCELLED'];
const VALID_STEP_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'];

// --- Funciones Auxiliares de Validación ---
const entityExists = (model, fieldNameForMessage, customErrorMessage) => {
  // Esta función devuelve el validador custom real
  return async (value, { req }) => { // express-validator pasa (value, { req, location, path })
    if (value === null || value === undefined || value === '') {
        // Si es opcional y no se provee, la validación de existencia no aplica.
        // La obligatoriedad se maneja con .notEmpty() o .exists() antes de este .custom()
        return true;
    }
    const pk = parseInt(value);
    if (isNaN(pk) || pk <= 0) { // La mayoría de los IDs de BD son enteros positivos
      throw new Error(`El ID para '${fieldNameForMessage || model.name}' debe ser un entero positivo.`);
    }
    const record = await model.findByPk(pk);
    if (!record) {
      throw new Error(customErrorMessage || `${fieldNameForMessage || model.name} con ID ${pk} no encontrado.`);
    }
    // Opcional: adjuntar el record a req si se necesita en validaciones/controladores posteriores
    // Por ejemplo: req[`found${model.name}`] = record;
    return true;
  };
};

// Middleware para cargar la orden y adjuntarla a req para validaciones posteriores
const loadProductionOrder = async (req, res, next) => {
    try {
        if (req.params.idProductionOrder) {
            const orderId = parseInt(req.params.idProductionOrder);
            // commonIdParamsValidation ya valida el formato del ID
            const order = await ProductionOrder.findByPk(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Orden de producción no encontrada.' });
            }
            req.productionOrderInstance = order;
        }
        next();
    } catch (error) {
        console.error("Error cargando orden en middleware loadProductionOrder:", error);
        res.status(500).json({ message: "Error interno al cargar datos de la orden." });
    }
};


// --- Validaciones para Endpoints ---

const createProductionOrderValidation = [
    body('idProduct')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('El ID del producto debe ser un entero positivo.')
        .bail()
        .custom(entityExists(Product, 'Producto', 'El producto seleccionado no existe.')),
    body('initialAmount')
        .notEmpty().withMessage('La cantidad inicial es requerida.')
        .isInt({ min: 0 }).withMessage('La cantidad inicial debe ser un entero no negativo (0 permitido para borradores).'),
    body('idEmployeeRegistered')
        .optional({ nullable: true }) // Si se toma de req.user, si no, .notEmpty()
        .isInt({ min: 1 }).withMessage('El ID del empleado que registra debe ser un entero positivo.')
        .bail()
        .custom(entityExists(Employee, 'Empleado Registrador', 'El empleado que registra no existe.')),
    body('idSpecSheet')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('El ID de la ficha técnica debe ser un entero positivo.')
        .bail()
        .custom(entityExists(SpecSheet, 'Ficha Técnica', 'La ficha técnica seleccionada no existe.')),
    body('idProvider')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un entero positivo.')
        .bail()
        .custom(entityExists(Provider, 'Proveedor', 'El proveedor seleccionado no existe.')),
    body('observations')
        .optional({ nullable: true })
        .isString().withMessage('Las observaciones deben ser texto.')
        .trim()
        .isLength({ max: 1000 }).withMessage('Las observaciones no pueden exceder los 1000 caracteres.'),
    body('status')
        .optional()
        .isIn(['PENDING', 'SETUP']).withMessage("El estado inicial solo puede ser 'PENDING' o 'SETUP'.")
];

const commonIdParamsValidation = [
    param('idProductionOrder')
        .isInt({ min: 1 }).withMessage('El ID de la orden de producción en la URL debe ser un entero positivo.')
];

const updateProductionOrderValidation = [
    // commonIdParamsValidation y loadProductionOrder se aplican en la ruta
    body('idProduct')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('ID de producto inválido.')
        .bail()
        .custom(entityExists(Product, 'Producto', 'El producto seleccionado no existe.')),
    body('productNameSnapshot')
        .optional({ nullable: true })
        .isString().withMessage('El snapshot del nombre del producto debe ser texto.')
        .trim()
        .isLength({ min:1, max: 255 }).withMessage('El snapshot del nombre del producto debe tener entre 1 y 255 caracteres.'),
    body('initialAmount')
        .optional()
        .isInt({ min: 0 }).withMessage('La cantidad inicial debe ser un entero no negativo.'), // Permitir 0 si se está ajustando un borrador
    body('inputInitialWeight')
        .optional({ nullable: true })
        .isDecimal({ decimal_digits: '0,3' }).withMessage('El peso inicial debe ser un número decimal (máx 3 decimales).')
        .toFloat()
        .custom(val => val >= 0).withMessage('El peso inicial debe ser no negativo.'),
    body('inputInitialWeightUnit')
        .optional({ nullable: true })
        .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Unidad de peso inicial inválida (1-50 caracteres).'),
    body('idSpecSheet')
        .optional({ nullable: true }) // Permite enviar null para desasignar
        .custom(async (value, { req }) => {
            if (value === null || value === '') return true; // Permitir desasignar explícitamente
            const pk = parseInt(value);
            if (isNaN(pk) || pk <= 0) throw new Error('ID de ficha técnica debe ser un entero positivo.');

            const specSheet = await SpecSheet.findByPk(pk);
            if (!specSheet) throw new Error('La ficha técnica especificada no existe.');

            // Validar que la ficha pertenezca al producto y esté activa
            const productIdFromPayload = req.body.idProduct; // Producto que se está intentando asignar
            const orderInstance = req.productionOrderInstance; // Orden actual cargada por loadProductionOrder
            
            let targetProductId = productIdFromPayload !== undefined ? productIdFromPayload : (orderInstance ? orderInstance.idProduct : null);

            if (!targetProductId) { // Si no hay producto en payload ni en la orden existente (ej. creando y seleccionando ficha sin producto)
                throw new Error('Se debe especificar un producto para validar la ficha técnica.');
            }
            if (specSheet.idProduct !== parseInt(targetProductId)) {
                throw new Error('La ficha técnica no pertenece al producto seleccionado/actual.');
            }
            if (!specSheet.status) { // Asumiendo que 'status: true' es activa
                throw new Error('La ficha técnica seleccionada no está activa.');
            }
            return true;
        }),
    body('idEmployeeRegistered')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('ID de empleado registrador inválido.')
        .bail()
        .custom(entityExists(Employee, 'Empleado Registrador', 'El empleado no existe.')),
    body('idProvider')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('ID de proveedor inválido.')
        .bail()
        .custom(entityExists(Provider, 'Proveedor', 'El proveedor no existe.')),
    body('observations')
        .optional({ nullable: true })
        .isString().withMessage('Observaciones inválidas.')
        .trim()
        .isLength({ max: 1000 }),
    body('status')
        .optional()
        .isIn(VALID_ORDER_STATUSES).withMessage(`Estado de orden inválido. Valores permitidos: ${VALID_ORDER_STATUSES.join(', ')}`),
    (req, res, next) => {
        if (req.productionOrderInstance && (req.productionOrderInstance.status === 'COMPLETED' || req.productionOrderInstance.status === 'CANCELLED')) {
            const allowedKeysInTerminatedState = ['observations'];
            for (const key in req.body) {
                if (req.body.hasOwnProperty(key) && !allowedKeysInTerminatedState.includes(key)) {
                    return res.status(400).json({ message: `No se puede modificar el campo '${key}' de una orden ${req.productionOrderInstance.status}.` });
                }
            }
        }
        next();
    }
];

const updateProductionOrderStepValidation = [
    // commonIdParamsValidation y loadProductionOrder ya aplicados en la ruta
    param('idProductionOrderDetail')
        .isInt({ min: 1 }).withMessage('El ID del detalle de la orden debe ser un entero positivo.')
        .bail()
        .custom(async (value, { req }) => {
            const stepId = parseInt(value);
            const orderId = parseInt(req.params.idProductionOrder); // Ya validado por commonIdParamsValidation
            const step = await ProductionOrderDetail.findOne({
                where: { idProductionOrderDetail: stepId, idProductionOrder: orderId }
            });
            if (!step) {
                throw new Error('El paso especificado no existe o no pertenece a la orden de producción indicada.');
            }
            req.productionStepInstance = step;
            return true;
        }),
    (req, res, next) => {
        if (!req.productionOrderInstance) return res.status(404).json({message: "Orden no encontrada para validar el paso."}); // Seguridad
        if (req.productionOrderInstance.status === 'COMPLETED' || req.productionOrderInstance.status === 'CANCELLED') {
             return res.status(400).json({ message: 'No se pueden modificar pasos de una orden completada o cancelada.' });
        }
        if (req.productionStepInstance && req.productionStepInstance.status === 'COMPLETED' && (req.body.status && req.body.status !== 'COMPLETED')) {
            return res.status(400).json({ message: 'No se puede cambiar el estado de un paso ya completado de esta forma.' });
        }
        if (req.productionOrderInstance.status === 'PENDING' || req.productionOrderInstance.status === 'SETUP') {
            return res.status(400).json({ message: `La orden debe estar al menos en 'SETUP_COMPLETED' para gestionar pasos. Estado actual: ${req.productionOrderInstance.status}`});
        }
        next();
    },
    body('idEmployeeAssigned')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('El ID del empleado asignado debe ser un entero positivo.')
        .bail()
        .custom(entityExists(Employee, 'Empleado Asignado', 'El empleado a asignar no existe.')),
    body('startDate')
        .optional({ nullable: true })
        .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (ISO8601).')
        .toDate(),
    body('endDate')
        .optional({ nullable: true })
        .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (ISO8601).')
        .toDate()
        .custom((value, { req }) => {
            if (req.body.startDate && value && new Date(value) < new Date(req.body.startDate)) { // Solo validar si ambas fechas existen
                throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
            }
            return true;
        }),
    body('status')
        .optional()
        .isIn(VALID_STEP_STATUSES).withMessage(`El estado del paso debe ser uno de: ${VALID_STEP_STATUSES.join(', ')}.`),
    body('observations')
        .optional({ nullable: true })
        .isString().withMessage('Las observaciones del paso deben ser texto.')
        .trim()
        .isLength({ max: 500 }).withMessage('Las observaciones del paso no pueden exceder los 500 caracteres.')
];

const finalizeProductionOrderValidation = [
    // commonIdParamsValidation y loadProductionOrder ya aplicados
    async (req, res, next) => { // Cambiado a async para poder usar await
        if (req.productionOrderInstance) {
            const { status, idProductionOrder } = req.productionOrderInstance;
            const allowedStatesToFinalize = ['ALL_STEPS_COMPLETED', 'IN_PROGRESS'];
            try {
                const stepsCount = await ProductionOrderDetail.count({ where: { idProductionOrder }});
                if (stepsCount === 0 && ['SETUP_COMPLETED', 'SETUP', 'PENDING'].includes(status)) {
                    // Permite finalizar si no tiene pasos y está en un estado de configuración/pendiente
                } else if (!allowedStatesToFinalize.includes(status)) {
                    return res.status(400).json({ message: `La orden no está en un estado válido para ser finalizada (actual: ${status}).` });
                }
                // Adicionalmente, si está IN_PROGRESS, todos los pasos deben estar COMPLETED (se valida en servicio)
                next();
            } catch (error) {
                next(error); // Pasar error al manejador de errores de Express
            }
        } else {
             return res.status(404).json({message: "Orden no encontrada para finalizar."});
        }
    },
    body('finalQuantityProduct')
        .exists({checkNull: false}).withMessage('La cantidad final del producto es requerida.')
        .isInt({ min: 0 }).withMessage('La cantidad final del producto debe ser un entero no negativo.'),
    body('finishedProductWeight')
        .optional({ nullable: true })
        .isDecimal({ decimal_digits: '0,3' }).withMessage('El peso final del producto debe ser decimal (máx 3 decimales).')
        .toFloat()
        .custom(val => val >= 0).withMessage('El peso final del producto debe ser no negativo.'),
    body('finishedProductWeightUnit')
        .optional({ nullable: true })
        .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Unidad de peso final de producto inválida.'),
    body('inputFinalWeightUnused')
        .optional({ nullable: true })
        .isDecimal({ decimal_digits: '0,3' }).withMessage('El peso de insumo no usado debe ser decimal.')
        .toFloat()
        .custom(val => val >= 0).withMessage('El peso de insumo no usado debe ser no negativo.'),
    body('inputFinalWeightUnusedUnit')
        .optional({ nullable: true })
        .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Unidad de peso de insumo no usado inválida.'),
    body('consumedSupplies')
        .optional()
        .isArray().withMessage('Los insumos consumidos deben ser un arreglo.')
        .bail() // No seguir si no es array
        .custom((suppliesArray) => {
            if (suppliesArray) {
                for (const supply of suppliesArray) {
                    if (supply.idSupply == null || isNaN(parseInt(supply.idSupply)) || parseInt(supply.idSupply) <= 0) {
                        throw new Error('Cada insumo consumido debe tener un idSupply numérico positivo.');
                    }
                    if (supply.quantityConsumed == null || isNaN(parseFloat(supply.quantityConsumed)) || parseFloat(supply.quantityConsumed) <= 0) {
                        throw new Error(`Cantidad consumida para insumo ID ${supply.idSupply} debe ser un número positivo.`);
                    }
                    if (supply.notes !== undefined && (supply.notes !== null && typeof supply.notes !== 'string')) {
                        throw new Error(`Las notas para el insumo ID ${supply.idSupply} deben ser texto o nulas.`);
                    }
                }
            }
            return true;
        }),
    body('consumedSupplies.*.idSupply')
        .if(body('consumedSupplies').exists({checkFalsy: true, checkNull: false}))
        .isInt({min: 1}).withMessage("ID de insumo en consumedSupplies debe ser entero positivo.")
        .bail()
        .custom(entityExists(Supply, 'Insumo Consumido', 'Uno de los insumos consumidos no existe.'))
];

const changeProductionOrderStatusValidation = [
    // commonIdParamsValidation y loadProductionOrder ya aplicados
    body('status')
        .notEmpty().withMessage('El nuevo estado es requerido.')
        .trim()
        .isIn(VALID_ORDER_STATUSES).withMessage(`El estado de la orden debe ser uno de: ${VALID_ORDER_STATUSES.join(', ')}.`),
    body('observations')
        .optional({ nullable: true })
        .isString().withMessage('Las observaciones deben ser texto.')
        .trim()
        .isLength({max: 500}),
    (req, res, next) => {
        if (!req.productionOrderInstance) return res.status(404).json({message: "Orden no encontrada."});
        if (req.body.status === 'COMPLETED') {
            return res.status(400).json({ message: 'Para marcar como COMPLETADA, use el endpoint de finalización (/finalize).' });
        }
        const currentStatus = req.productionOrderInstance.status;
        const newStatus = req.body.status;
        if (currentStatus === 'COMPLETED' && newStatus !== 'CANCELLED') {
            return res.status(400).json({ message: 'Una orden completada solo puede ser cancelada o requiere un proceso de reapertura especial.' });
        }
        if (currentStatus === 'CANCELLED' && !['PENDING', 'SETUP'].includes(newStatus)) { // Solo se puede reabrir a PENDING o SETUP
            return res.status(400).json({ message: 'Una orden cancelada solo puede ser reabierta a un estado inicial.' });
        }
        // Aquí podrías añadir más reglas de transición específicas si son necesarias
        next();
    }
];

const deleteProductionOrderValidation = [
    // commonIdParamsValidation y loadProductionOrder ya aplicados
    (req, res, next) => {
        if (!req.productionOrderInstance) return res.status(404).json({message: "Orden no encontrada."});
        const { status } = req.productionOrderInstance;
        if (['IN_PROGRESS', 'COMPLETED', 'ALL_STEPS_COMPLETED', 'PAUSED'].includes(status)) {
             return res.status(400).json({ message: `No se puede eliminar una orden en estado: ${status}. Considere cancelarla primero.` });
        }
        next();
    }
];

const getAllProductionOrdersQueryValidation = [
    query('status').optional().trim().custom((value) => {
        const statuses = value.split(',').map(s => s.trim());
        for (const s of statuses) {
            if (!VALID_ORDER_STATUSES.includes(s)) {
                throw new Error(`Estado de filtro inválido: ${s}. Valores permitidos: ${VALID_ORDER_STATUSES.join(', ')}`);
            }
        }
        return true;
    }),
    query('idProduct').optional().isInt({min: 1}).withMessage('ID de producto para filtro inválido.'),
    query('idEmployeeRegistered').optional().isInt({min: 1}).withMessage('ID de empleado para filtro inválido.'),
    query('page').optional().isInt({min: 1}).withMessage('Número de página inválido.').toInt(),
    query('limit').optional().isInt({min: 1, max: 100}).withMessage('Límite por página inválido (1-100).').toInt(),
    query('sortBy').optional().trim().isString().isIn(['dateTimeCreation', 'status', 'idProduct', 'productNameSnapshot']).withMessage('Campo de ordenamiento inválido.'),
    query('sortOrder').optional().trim().toUpperCase().isIn(['ASC', 'DESC']).withMessage('Dirección de ordenamiento inválida (ASC o DESC).')
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
};