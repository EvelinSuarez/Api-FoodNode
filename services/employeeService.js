const employeeRepository = require('../repositories/employeeRepository');

const createEmployee = async (employee) => {
    return employeeRepository.createEmployee(employee);
}

const getAllEmployees = async () => {
    return employeeRepository.getAllEmployees();
}

const getEmployeeById = async (id) => {
    return employeeRepository.getEmployeeById(id);
}

const updateEmployee = async (id, employee) => {
    return employeeRepository.updateEmployee(id, employee);
}

const deleteEmployee = async (id) => {
    return employeeRepository.deleteEmployee(id);
}

const changeSateEmployee = async (id, state) => {
    return employeeRepository.changeSateEmployee(id, state);
}

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    changeSateEmployee,
};