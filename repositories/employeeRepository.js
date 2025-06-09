// repositories/employeeRepository.js

const { Employee } = require('../models');

const createEmployee = async (employeeData) => {
    return Employee.create(employeeData);
};

const getAllEmployees = async () => {
    return Employee.findAll();
};

const getEmployeeById = async (idEmployee) => {
    return Employee.findByPk(idEmployee);
};

const updateEmployee = async (idEmployee, employeeData) => {
    const [affectedRows] = await Employee.update(employeeData, { where: { idEmployee } });
    return affectedRows > 0;
};

const deleteEmployee = async (idEmployee) => {
    const deletedCount = await Employee.destroy({ where: { idEmployee } });
    return deletedCount > 0;
};

const changeStateEmployee = async (idEmployee, status) => {
    const [affectedRows] = await Employee.update({ status }, { where: { idEmployee } });
    return affectedRows > 0;
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    changeStateEmployee,
};