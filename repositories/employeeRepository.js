const Employee = require('../models/employee');

const createEmployee = async (employee) => {
    return Employee.create(employee);
}

const getAllEmployees = async () => {
    return Employee.findAll();
}

const getEmployeeById = async (idEmployee) => {
    return Employee.findByPk(idEmployee);
}

const updateEmployee = async (idEmployee, employee) => {
    return Employee.update(employee, { where: { idEmployee } });
}

const deleteEmployee = async (idEmployee) => {
    return Employee.destroy({ where: { idEmployee } });
}

const changeStateEmployee = async (idEmployee, status) => {
    return Employee.update({ status }, { where: { idEmployee } });
}

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    changeStateEmployee,
};


