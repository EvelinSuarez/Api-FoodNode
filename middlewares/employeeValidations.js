const { body, param } = require('express-validator');
const Employee = require('../models/employee');

const validateEmployeeExistence = async (idEmployee) => {
    console.log(`Buscando empleado con ID: ${idEmployee}`);
    const employee = await Employee.findByPk(idEmployee);
    
    if (employee) {
        console.log(`Empleado encontrado: ${JSON.stringify(employee.toJSON())}`);
    } else {
        console.log('Empleado no encontrado');
    }
    
    if (!employee) {
        return Promise.reject('El empleado no existe');
    }
};

const validateUniqueEmployeeName = async (fullName) => {
    const employee = await Employee.findOne({ where: { fullName } });
    if (employee) {
        return Promise.reject('El empleado ya existe');
    }
};

const employeeBaseValidation = [
    body('fullName')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
        .matches(/^[a-zA-Z\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
    body('status').default(true).isBoolean().withMessage('El estado debe ser un booleano')
];

const createEmployeeValidation = [
    ...employeeBaseValidation,
    body('fullName').custom(validateUniqueEmployeeName)
];

const updateEmployeeValidation = [
    param('idEmployee')
        .isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idEmployee').custom(validateEmployeeExistence),
    ...employeeBaseValidation
];

const deleteEmployeeValidation = [
    param('idEmployee').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idEmployee').custom(validateEmployeeExistence)
];

const getEmployeeByIdValidation = [
    param('idEmployee').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idEmployee').custom(validateEmployeeExistence)
];

const changeStateValidation = [
    body('status').isBoolean().withMessage('El estado debe ser un booleano'),
    param('idEmployee').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('idEmployee').custom(validateEmployeeExistence)
];

module.exports = {
    createEmployeeValidation,
    updateEmployeeValidation,
    deleteEmployeeValidation,
    getEmployeeByIdValidation,
    changeStateValidation,
};
