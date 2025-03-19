const { validationResult } = require('express-validator');
const processDetailService = require('../services/processDetailService');

const createProcessDetail = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const processDetail = await processDetailService.createProcessDetail(req.body);
        res.status(201).json(processDetail);
    } catch (error) {
        console.error("Error al crear detalle de proceso:", error);
        res.status(400).json({ message: error.message });
    }
}

const getAllProcessDetails = async (req, res) => {
    try {
        const processDetails = await processDetailService.getAllProcessDetails();
        res.status(200).json(processDetails);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getProcessDetailById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const processDetail = await processDetailService.getProcessDetailById(req.params.id);
        res.status(200).json(processDetail);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateProcessDetail = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await processDetailService.updateProcessDetail(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteProcessDetail = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await processDetailService.deleteProcessDetail(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getProcessDetailsByProcess = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const processDetails = await processDetailService.getProcessDetailsByProcess(req.params.idProcess);
        res.status(200).json(processDetails);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getProcessDetailsByEmployee = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const processDetails = await processDetailService.getProcessDetailsByEmployee(req.params.idEmployee);
        res.status(200).json(processDetails);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getActiveProcessDetails = async (req, res) => {
    try {
        const processDetails = await processDetailService.getActiveProcessDetails();
        res.status(200).json(processDetails);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createProcessDetail,
    getAllProcessDetails,
    getProcessDetailById,
    updateProcessDetail,
    deleteProcessDetail,
    getProcessDetailsByProcess,
    getProcessDetailsByEmployee,
    getActiveProcessDetails
};