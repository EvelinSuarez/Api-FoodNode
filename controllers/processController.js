const { validationResult } = require('express-validator');
const processService = require('../services/processService');

const createProcess = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const process = await processService.createProcess(req.body);
        res.status(201).json(process);
    } catch (error) {
        console.error("Error al crear proceso:", error);
        res.status(400).json({ message: error.message });
    }
}

const getAllProcesses = async (req, res) => {
    try {
        const processes = await processService.getAllProcesses();
        res.status(200).json(processes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getProcessById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const process = await processService.getProcessById(req.params.id);
        res.status(200).json(process);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateProcess = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await processService.updateProcess(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteProcess = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await processService.deleteProcess(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getProcessesBySpecSheet = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const processes = await processService.getProcessesBySpecSheet(req.params.idSpecSheet);
        res.status(200).json(processes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getProcessesByProcessDetail = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const processes = await processService.getProcessesByProcessDetail(req.params.idProcessDetail);
        res.status(200).json(processes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createProcess,
    getAllProcesses,
    getProcessById,
    updateProcess,
    deleteProcess,
    getProcessesBySpecSheet,
    getProcessesByProcessDetail
};