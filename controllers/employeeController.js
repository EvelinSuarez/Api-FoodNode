// controllers/employeeController.js

const { validationResult } = require('express-validator');
const employeeService = require('../services/employeeService');

// --- La nueva función del controlador ---
const getEmployeesWithOrderCounts = async (req, res) => {
  try {
    const employees = await employeeService.getEmployeesWithOrderCounts();
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error en getEmployeesWithOrderCounts:", error);
    res.status(500).json({ message: "Error al obtener el rendimiento de los empleados", error: error.message });
  }
};


// --- Tus funciones existentes ---
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
    // ... (sin cambios)
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
    // ... (sin cambios)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idEmployee = parseInt(req.params.idEmployee, 10);
    if (isNaN(idEmployee)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const success = await employeeService.updateEmployee(idEmployee, req.body);
        if (!success) {
            return res.status(404).json({ message: 'Empleado no encontrado para actualizar' });
        }
        const updatedEmployee = await employeeService.getEmployeeById(idEmployee);
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteEmployee = async (req, res) => {
    // ... (sin cambios)
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
    // ... (sin cambios)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idEmployee = parseInt(req.params.idEmployee, 10);
    if (isNaN(idEmployee)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        await employeeService.changeStateEmployee(idEmployee, req.body.status);
        const updatedEmployee = await employeeService.getEmployeeById(idEmployee);
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// ---- EXPORTACIONES ACTUALIZADAS ----
module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    changeStateEmployee,
    getEmployeesWithOrderCounts, // <-- ¡Y la nueva función!
};