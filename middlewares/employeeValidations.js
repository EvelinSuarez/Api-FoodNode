const { body, param } = require('express-validator');
const Employee = require('../models/employee');

// Validar existencia por ID
const validateEmployeeExistence = async (idEmployee) => {
    const employee = await Employee.findByPk(idEmployee);
    if (!employee) {
        return Promise.reject('El empleado no existe');
    }
};

// Validar unicidad por nombre completo (si aplica en tu lógica)
const validateUniqueEmployeeName = async (fullName) => {
    const employee = await Employee.findOne({ where: { fullName } });
    if (employee) {
        return Promise.reject('El empleado ya existe');
    }
};

// Validaciones base
const employeeBaseValidation = [
    body('fullName')
        .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),

    body('typeDocument')
        .optional()
        .isLength({ max: 50 }).withMessage('El tipo de documento no debe superar los 50 caracteres'),

    body('document')
        .isInt({ min: 10000, max: 99999999999 }).withMessage('El documento debe ser un número entre 5 y 11 dígitos'),

    body('email')
        .isEmail().withMessage('Debe proporcionar un correo electrónico válido'),

    body('cellPhone')
        .matches(/^(\+?\d{1,4}[-.\s]?)?(\(?\d{2,3}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}$/)
        .withMessage('El número de celular debe ser válido y tener entre 9 y 15 caracteres'),

    body('dateOfEntry')
        .isISO8601().toDate().withMessage('Debe proporcionar una fecha válida de ingreso'),

    body('emergencyContact')
        .optional()
        .isInt({ min: 1000000 }).withMessage('El contacto de emergencia debe ser un número válido'),

    body('Relationship')
        .optional()
        .isLength({ max: 50 }).withMessage('El parentesco no debe superar los 50 caracteres'),

    body('nameFamilyMember')
        .optional()
        .isLength({ max: 255 }).withMessage('El nombre del familiar no debe superar los 255 caracteres'),

    body('BloodType')
        .optional()
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('El tipo de sangre debe ser válido'),

    body('socialSecurityNumber')
        .optional()
        .isLength({ max: 20 }).withMessage('El número de seguridad social no debe superar los 20 caracteres'),

    body('Address')
        .optional()
        .isLength({ max: 255 }).withMessage('La dirección no debe superar los 255 caracteres'),

    body('contractType')
        .optional()
        .isLength({ max: 50 }).withMessage('El tipo de contrato no debe superar los 50 caracteres'),

    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano')
];

// Crear empleado
const createEmployeeValidation = [
    ...employeeBaseValidation,
    body('fullName').custom(validateUniqueEmployeeName)
];

// Actualizar empleado
const updateEmployeeValidation = [
    param('idEmployee')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    param('idEmployee').custom(validateEmployeeExistence),
    ...employeeBaseValidation
];

// Eliminar empleado
const deleteEmployeeValidation = [
    param('idEmployee')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    param('idEmployee').custom(validateEmployeeExistence)
];

// Obtener por ID
const getEmployeeByIdValidation = [
    param('idEmployee')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    param('idEmployee').custom(validateEmployeeExistence)
];

// Cambiar estado
const changeStateValidation = [
    param('idEmployee')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
        .custom(validateEmployeeExistence),
    body('status')
        .isBoolean().withMessage('El estado debe ser un booleano')
];

module.exports = {
    createEmployeeValidation,
    updateEmployeeValidation,
    deleteEmployeeValidation,
    getEmployeeByIdValidation,
    changeStateValidation,
};
