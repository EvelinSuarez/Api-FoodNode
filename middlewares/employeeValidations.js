const { body, param, validationResult } = require('express-validator');
const Employee = require('../models/employee');

const validateEmployeeExistence = async (id) => {
    const employee = await Employee.findByPk(id);
    if (!employee) {
        return Promise.reject('El empleado no existe');
    }
}

const validateUniqueEmployeeName = async (fullName) => {
    const employee = await Employee.findOne({ where: { fullName } });
    if (employee) {
        return Promise.reject('El empleado ya existe');
    }
}

const employeeBaseValidation = [
    body('fullName')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
        .matches(/^[a-zA-Z\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
    body('state').default(true).isBoolean().withMessage('El estado debe ser un booleano')
];

const createEmployeeValidation = [
    ...employeeBaseValidation,
    body('fullName').custom(validateUniqueEmployeeName)
];

const updateEmployeeValidation = [
    ...employeeBaseValidation,
    param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('id').custom(validateEmployeeExistence)
];

const deleteEmployeeValidation = [
    param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('id').custom(validateEmployeeExistence)
];

const getEmployeeByIdValidation = [
    param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('id').custom(validateEmployeeExistence)
];

const changeStateValidation = [
    body('state').isBoolean().withMessage('El estado debe ser un booleano'),
    param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
    param('id').custom(validateEmployeeExistence)
];

module.exports = {
    createEmployeeValidation,
    updateEmployeeValidation,
    deleteEmployeeValidation,
    getEmployeeByIdValidation,
    changeStateValidation,
};
