const { validationResult } = require('express-validator');
const customersService = require('../services/customersService');

const createCustomers = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const customers = await customersService.createCustomers(req.body);
        res.status(201).json(customers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllCustomers = async (req, res) => {
    try {
        const customers = await customersService.getAllCustomers();
        res.status(200).json(customers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getCustomersById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const customers = await customersService.getCustomersById(req.params.id);
        res.status(200).json(customers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateCustomers = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await customersService.updateCustomers(req.params.id, req.body);
        res.status(204).end();
        res.status(200).json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteCustomers = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await customersService.deleteCustomers(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const changeStateCustomers = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await customersService.changeStateCustomers(req.params.id, req.body.state);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
// método para buscar clientes
const searchCustomers = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { searchTerm } = req.body;
        const customers = await customersService.searchCustomers(searchTerm);
        res.status(200).json(customers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
module.exports = {
    createCustomers,
    getAllCustomers,
    getCustomersById,
    updateCustomers,
    deleteCustomers,
    changeStateCustomers,
    searchCustomers,
};