// middlewares/customersValidations.js

// Importaciones necesarias
const { body, param, query, validationResult } = require('express-validator'); // <--- AÑADIR 'query'
const Customers = require('../models/customers'); // Asumiendo ruta correcta al modelo

// --- FUNCIONES HELPER DE VALIDACIÓN (Sin cambios) ---

// Validar si el cliente existe por ID
const validateCustomersExistence = async (id) => {
    const customers = await Customers.findByPk(id);
    if (!customers) {
        // Usar throw new Error es a veces preferido por express-validator
        throw new Error('El cliente no existe');
        // return Promise.reject('El cliente no existe'); // Alternativa
    }
    // No es necesario devolver nada si existe
};

// Validar unicidad del número de celular (excluyendo el ID actual en actualizaciones)
const validateUniqueCustomersCellphone = async (cellphone, { req }) => {
    // Solo validar si se proporciona un celular
    if (!cellphone) {
        return; // Permitir celular vacío o nulo si es opcional en la base de datos
    }
    const whereClause = { cellphone };
    // Si estamos actualizando (existe req.params.id), excluimos ese cliente de la búsqueda
    if (req.params.id) {
        whereClause.idCustomers = { [require('sequelize').Op.ne]: parseInt(req.params.id) }; // Excluir el ID actual
    }
    const customers = await Customers.findOne({ where: whereClause });
    if (customers) {
        throw new Error('El número de celular del cliente ya está registrado');
        // return Promise.reject('El numero de celular del cliente ya está registrado'); // Alternativa
    }
};

// --- VALIDACIONES BASE (Sin cambios) ---
// Usadas para crear y actualizar clientes
const customersBaseValidation = [
    body('fullName')
        .trim() // Limpiar espacios
        .isLength({ min: 5 }).withMessage('El nombre debe tener al menos 5 caracteres')
        .notEmpty().withMessage('El nombre completo es obligatorio'),
    body('distintive')
        .trim()
        .isString().withMessage('El campo distintivo debe ser texto')
        .notEmpty().withMessage('El campo distintivo es obligatorio'),
    body('customerCategory')
        .isString().withMessage('La categoría del cliente debe ser texto')
        .notEmpty().withMessage('La categoría del cliente es obligatoria'),
        // Considera usar .isIn(['Familiar', 'Empresarial', ...]) si tienes categorías fijas
    body('cellphone')
        .trim()
        .isString().withMessage('El número de teléfono debe ser texto')
        // La validación de longitud y unicidad se aplica
        .isLength({ min: 7, max: 15 }).withMessage('El número de teléfono debe tener entre 7 y 15 caracteres') // Ajustado a 7-15
        .custom(validateUniqueCustomersCellphone), // La validación personalizada maneja el caso de actualización
        // Hacer opcional si no es requerido en BD: .optional({ checkFalsy: true }) permite '', null, undefined
    body('email')
        .trim()
        .isEmail().withMessage('El correo electrónico no es válido')
        .optional({ nullable: true, checkFalsy: true }), // Permite '', null, undefined
    body('address')
        .trim()
        .isString().withMessage('La dirección debe ser texto')
        .optional({ nullable: true, checkFalsy: true }),
    // 'status' normalmente no se envía en create/update, se maneja con changeState
    // body('status').isBoolean().withMessage('El estado debe ser booleano').optional({ nullable: true }),
];

// --- VALIDACIONES ESPECÍFICAS POR RUTA ---

// Crear un cliente (Usa validaciones base)
const createCustomersValidation = [
    ...customersBaseValidation
    // Aquí podrías añadir validaciones específicas solo para la creación si las hubiera
];

// Actualizar un cliente (Usa base + validación de ID y existencia)
const updateCustomersValidation = [
    param('id') // Validar el ID que viene en la URL
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateCustomersExistence),
    ...customersBaseValidation // Aplicar las validaciones base a los datos del body
];

// Eliminar un cliente (Solo valida ID y existencia)
const deleteCustomersValidation = [
    param('id')
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateCustomersExistence)
];

// Obtener un cliente por ID (Solo valida ID y existencia)
const getCustomersByIdValidation = [
    param('id')
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateCustomersExistence)
];

// Cambiar el estado de un cliente (Valida ID, existencia y el 'status' del body)
const changeStateValidation = [
    param('id')
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateCustomersExistence),
    body('status') // Valida el campo 'status' que viene en el body
        .exists({ checkFalsy: false }).withMessage('El campo estado es requerido') // Asegura que exista (incluso si es false)
        .isBoolean({ strict: true }).withMessage('El estado debe ser un valor booleano (true o false)') // Estricto para solo booleanos
];

// --- VALIDACIÓN PARA BUSCAR CLIENTES (MODIFICADA) ---
const searchCustomersValidation = [
    // Cambiamos de body('searchTerm') a query('term')
    query('term', 'El término de búsqueda es requerido (mínimo 2 caracteres)') // Mensaje de error unificado
      .trim()                                 // Quitar espacios al inicio/final
      .notEmpty()                             // Asegurar que no esté vacío después de trim
      .isLength({ min: 2, max: 90 })          // Establecer longitud mínima y máxima
      // .escape()                             // Opcional: Escapar caracteres HTML si se mostrarán directamente
];

// --- EXPORTACIONES (Sin cambios) ---
module.exports = {
    createCustomersValidation,
    updateCustomersValidation,
    deleteCustomersValidation,
    getCustomersByIdValidation,
    changeStateValidation,
    searchCustomersValidation, // Exportar la validación de búsqueda modificada
};