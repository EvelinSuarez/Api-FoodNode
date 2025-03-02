const { validationResult } = require('express-validator');
const permissionService = require('../services/permissionService');

const createPermission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const permission = await permissionService.createPermission(req.body);
        res.status(201).json(permission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllPermissions = async (req, res) => {
    try {
        const permissions = await permissionService.getAllPermissions();
        res.status(200).json(permissions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPermissionById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const permission = await permissionService.getPermissionById(req.params.idPermission);
        res.status(200).json(permission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePermission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await permissionService.updatePermission(req.params.idPermission, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePermission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await permissionService.deletePermission(req.params.idPermission);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const changePermissionState = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await permissionService.changePermissionState(req.params.idPermission, req.body.status);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createPermission,
    getAllPermissions,
    getPermissionById,
    updatePermission,
    deletePermission,
    changePermissionState,
};