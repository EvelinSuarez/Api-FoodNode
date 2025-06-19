// repositories/employeeRepository.js

const { Employee } = require('../models');
const { Op } = require('sequelize'); 

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

const countActiveEmployees = async ({ year, month, status = 'activo' }) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Último día del mes

    // La lógica exacta dependerá de cómo defines "activo" en un mes.
    // Asumimos que un empleado está activo si su `createdAt` es anterior al fin de mes
    // y su estado es el correcto. Puedes ajustar esta lógica.
    return Employee.count({
        where: {
            status: status === 'activo' ? true : false, // o el valor que uses para activo/inactivo
            createdAt: {
                [Op.lte]: endDate
            }
            // Si tienes una fecha de `terminationDate`, la condición sería más compleja:
            // [Op.or]: [
            //   { terminationDate: null },
            //   { terminationDate: { [Op.gte]: startDate } }
            // ]
        }
    });
};


module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    changeStateEmployee,
    countActiveEmployees,
};