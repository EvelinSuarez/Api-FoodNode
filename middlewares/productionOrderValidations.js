    const { body, param, validationResult } = require("express-validator")
    const ProductionOrder = require('../models/productionOrder');

    const validateProductionOrderExistence = async (id) => {
        const order = await ProductionOrder.findByPk(id);
        if (!order) {
            return Promise.reject('La orden de producción no existe');
        }
    };

    const validateStateBeforeEdit = async (id) => {
        const order = await ProductionOrder.findByPk(id);
        if (!order) {
            return Promise.reject('La orden de producción no existe');
        }
        if (order.status === 'Terminada' || order.status === 'Cancelada') {
            return Promise.reject('No se puede editar una orden terminada o cancelada');
        }
    };

    const createProductionOrderValidation = [
        body('idProduct').isInt().withMessage('El ID del producto debe ser un número entero'),
        body('idProcess').isInt().withMessage('El ID del proceso debe ser un número entero'),
        body('initial_amount').isInt().withMessage('La cantidad inicial debe ser un número entero'),
        body('finalQuantityProduct').isInt().withMessage('La cantidad final debe ser un número entero'),
        body('finishedWeight').isFloat().withMessage('El peso final debe ser un número decimal'),
        body('initialWeight').isFloat().withMessage('El peso inicial debe ser un número decimal'),
        body('observations').optional().isString().withMessage('Las observaciones deben ser texto'),
        body('idProcessDetail').isInt().withMessage('El ID del detalle del proceso debe ser un número entero'),
        body('state').isBoolean().withMessage('El estado debe ser un valor booleano'),
        body('idEmployee').isInt().withMessage('El ID del empleado debe ser un número entero')
    ];

    const updateProductionOrderValidation = [
        param('id').isInt().withMessage('El ID de la orden debe ser un número entero'),
        param('id').custom(validateStateBeforeEdit),
        body('idEmployee').isInt().withMessage('El ID del empleado debe ser un número entero')
    ];

    const deleteProductionOrderValidation = [
        param('id').isInt().withMessage('El ID de la orden debe ser un número entero'),
        param('id').custom(validateProductionOrderExistence)
    ];

    const getProductionOrderByIdValidation = [
        param('id').isInt().withMessage('El ID de la orden debe ser un número entero'),
        param('id').custom(validateProductionOrderExistence)
    ];

    const changeStateValidation = [
        param('id').isInt().withMessage('El ID de la orden debe ser un número entero'),
        param('id').custom(validateProductionOrderExistence),
        body('status').isIn(['Terminada', 'Cancelada']).withMessage('El estado debe ser "Terminada" o "Cancelada"')
    ];

    const searchValidation = [
        body('query').isString().isLength({ max: 250 }).withMessage('El dato de búsqueda debe ser un texto de hasta 250 caracteres')
    ];

    module.exports = {
        createProductionOrderValidation,
        updateProductionOrderValidation,
        deleteProductionOrderValidation,
        getProductionOrderByIdValidation,
        changeStateValidation,
        searchValidation
    };
