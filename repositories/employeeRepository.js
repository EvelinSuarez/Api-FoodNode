const Employee = require('../models/employee');

const createEmployee = async (employee) => {
    return Employee.create(employee);
}

const getAllEmployees = async () => {
    return Employee.findAll();
}

const getEmployeeById = async (id) => {
    return Employee.findByPk(id);
}

const updateEmployee = async (id, employee) => {
    return Employee.update(employee, { where: { id } });
}

const deleteEmployee = async (id) => {
    return Employee.destroy({ where: { id } });
}

const changeSateEmployee = async (id, state) => {
    return Employee.update({ state }, { where: { id } });
}

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    changeSateEmployee,
};


