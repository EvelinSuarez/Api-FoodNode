const { validationResult } = require('express-validator');
const purchaseRecordService = require('../services/purchaseRecordService');

const createPurchaseRecord = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const purchaseRecord = await purchaseRecordService.createPurchaseRecord(req.body);
        res.status(201).json(purchaseRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllPurchaseRecords = async (req, res) => {
    try {
        const purchaseRecords = await purchaseRecordService.getAllPurchaseRecords();
        res.status(200).json(purchaseRecords);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getPurchaseRecordById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const purchaseRecord = await purchaseRecordService.getPurchaseRecordById(req.params.id);
        res.status(200).json(purchaseRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updatePurchaseRecord = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await purchaseRecordService.updatePurchaseRecord(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deletePurchaseRecord = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await purchaseRecordService.deletePurchaseRecord(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const changeStatePurchaseRecord = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await purchaseRecordService.changeStatePurchaseRecord(req.params.id, req.body.state);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createPurchaseRecord,
    getAllPurchaseRecords,
    getPurchaseRecordById,
    updatePurchaseRecord,
    deletePurchaseRecord,
    changeStatePurchaseRecord,
};