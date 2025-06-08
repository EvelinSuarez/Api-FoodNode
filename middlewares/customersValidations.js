const { body, param, query, validationResult } = require('express-validator'); 
const Customers = require('../models/customers'); 

// Validar si el cliente existe por ID
const validateCustomersExistence = async (id) => {
    const customers = await Customers.findByPk(id);
    if (!customers) {
        // Usar throw new Error es a veces preferido por express-validator
        throw new Error('El cliente no existe');
    }
};

// Validar existencia del cliente para reservas (reutiliza validateCustomersExistence)
const validateCustomerExistenceForReservation = async (id) => {
    await validateCustomersExistence(id);
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
        whereClause.idCustomers = { [require('sequelize').Op.ne]: parseInt(req.params.id) }; 
    }
    const customers = await Customers.findOne({ where: whereClause });
    if (customers) {
        throw new Error('El número de celular del cliente ya está registrado');
        // return Promise.reject('El numero de celular del cliente ya está registrado'); 
    }
};


// Usadas para crear y actualizar clientes
const customersBaseValidation = [
    body('fullName')
        .trim() 
        .isLength({ min: 5 }).withMessage('El nombre debe tener al menos 5 caracteres')
        .notEmpty().withMessage('El nombre completo es obligatorio'),
    body('distintive')
        .trim()
        .isString().withMessage('El campo distintivo debe ser texto')
        .notEmpty().withMessage('El campo distintivo es obligatorio'),
    body('customerCategory')
        .isString().withMessage('La categoría del cliente debe ser texto')
        .notEmpty().withMessage('La categoría del cliente es obligatoria'),
        
    body('cellphone')
        .trim()
        .isString().withMessage('El número de teléfono debe ser texto')
        .isLength({ min: 10, max: 12 }).withMessage('El número de teléfono debe tener entre 10 y 12 caracteres') 
        .custom(validateUniqueCustomersCellphone)
        .notEmpty().withMessage('El numero del cliente es obligatorio'),
        
    body('email')
        .trim()
        .isEmail().withMessage('El correo electrónico no es válido')
        .optional({ nullable: true, checkFalsy: true }), 
    body('address')
        .trim()
        .isString().withMessage('La dirección debe ser texto')
        .optional({ nullable: true, checkFalsy: true }),
];

// --- VALIDACIONES ESPECÍFICAS POR RUTA ---

// Crear un cliente (Usa validaciones base)
const createCustomersValidation = [
    ...customersBaseValidation
];

// Actualizar un cliente (Usa base + validación de ID y existencia)
const updateCustomersValidation = [
    param('id') // Validar el ID que viene en la URL
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateCustomersExistence),
    ...customersBaseValidation
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
    body('status') 
        .exists({ checkFalsy: false }).withMessage('El campo estado es requerido') 
        .isBoolean({ strict: true }).withMessage('El estado debe ser un valor booleano (true o false)') 
];

// --- VALIDACIÓN PARA BUSCAR CLIENTES 
const searchCustomersValidation = [
    // Cambiamos de body('searchTerm') a query('term')
    query('term', 'El término de búsqueda es requerido (mínimo 2 caracteres)') 
      .trim()                                 
      .notEmpty()                             
      .isLength({ min: 2, max: 90 })          
];


module.exports = {
    createCustomersValidation,
    updateCustomersValidation,
    deleteCustomersValidation,
    getCustomersByIdValidation,
    changeStateValidation,
    searchCustomersValidation, 
    validateCustomerExistenceForReservation
};