// services/employeeService.js

const employeeRepository = require('../repositories/employeeRepository');
// ---- ¡IMPORTANTE! Importamos los modelos y sequelize aquí ----
const { Employee, ProductionOrder, sequelize } = require('../models');

// --- Funciones CRUD que llaman al repositorio ---
const createEmployee = async (employee) => {
    // Aquí podrías añadir lógica de negocio, como validar si el email ya existe
    return employeeRepository.createEmployee(employee);
};

const getAllEmployees = async () => {
    return employeeRepository.getAllEmployees();
};

const getEmployeeById = async (id) => {
    return employeeRepository.getEmployeeById(id);
};

const updateEmployee = async (id, employee) => {
    return employeeRepository.updateEmployee(id, employee);
};

const deleteEmployee = async (id) => {
    return employeeRepository.deleteEmployee(id);
};

const changeStateEmployee = async (id, status) => {
    return employeeRepository.changeStateEmployee(id, status);
};

// ---- ¡NUEVA FUNCIÓN DE LÓGICA DE NEGOCIO! ----
const getEmployeesWithOrderCounts = async () => {
    return Employee.findAll({
        attributes: [
            'idEmployee',
            'fullName',
            'status',
            // --- NUEVA CONSULTA CORREGIDA ---
            // Contar PASOS de órdenes en proceso asignados a este empleado
            [
                sequelize.literal(`(
                    SELECT COUNT(DISTINCT pod.idProductionOrderDetail) 
                    FROM ProductionOrderDetails AS pod
                    INNER JOIN ProductionOrders AS po ON po.idProductionOrder = pod.idProductionOrder
                    WHERE
                        pod.idEmployeeAssigned = Employee.idEmployee AND
                        po.status NOT IN ('COMPLETED', 'CANCELLED')
                )`),
                'inProgressOrdersCount' // El nombre se mantiene, pero ahora cuenta pasos
            ],
            // Contar PASOS de órdenes completadas asignados a este empleado
            [
                sequelize.literal(`(
                    SELECT COUNT(DISTINCT pod.idProductionOrderDetail) 
                    FROM ProductionOrderDetails AS pod
                    INNER JOIN ProductionOrders AS po ON po.idProductionOrder = pod.idProductionOrder
                    WHERE
                        pod.idEmployeeAssigned = Employee.idEmployee AND
                        po.status = 'COMPLETED'
                )`),
                'completedOrdersCount' // El nombre se mantiene, pero ahora cuenta pasos
            ]
        ],
        where: { status: true },
        order: [['fullName', 'ASC']]
    });
};

// ---- EXPORTACIONES ACTUALIZADAS ----
module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    changeStateEmployee,
    getEmployeesWithOrderCounts, // <-- Exportamos la nueva función
};