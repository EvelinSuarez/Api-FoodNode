const { validationResult } = require('express-validator');
const employeeService = require('../services/employeeService');

const createEmployee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const employee = await employeeService.createEmployee(req.body);
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employees = await employeeService.getAllEmployees();
        res.status(200).json(employees);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getEmployeeById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idEmployee = parseInt(req.params.idEmployee, 10);
    if (isNaN(idEmployee)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const employee = await employeeService.getEmployeeById(idEmployee);
        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateEmployee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idEmployee = parseInt(req.params.idEmployee, 10);
    if (isNaN(idEmployee)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const employee = await employeeService.updateEmployee(idEmployee, req.body);
        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteEmployee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idEmployee = parseInt(req.params.idEmployee, 10);
    if (isNaN(idEmployee)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const result = await employeeService.deleteEmployee(idEmployee);
        if (!result) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const changeStateEmployee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idEmployee = parseInt(req.params.idEmployee, 10);
    if (isNaN(idEmployee)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        await employeeService.changeSateEmployee(idEmployee, req.body.state);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    changeStateEmployee,
};
