const { validationResult } = require('express-validator');
const privilegeService = require('../services/privilegeService');

const createPrivilege = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const privilege = await privilegeService.createPrivilege(req.body);
        res.status(201).json(privilege);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllPrivileges = async (req, res) => {
    try {
        const privileges = await privilegeService.getAllPrivileges();
        res.status(200).json(privileges);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPrivilegeById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const privilege = await privilegeService.getPrivilegeById(req.params.idPrivilege);
        res.status(200).json(privilege);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePrivilege = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await privilegeService.updatePrivilege(req.params.idPrivilege, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePrivilege = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await privilegeService.deletePrivilege(req.params.idPrivilege);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createPrivilege,
    getAllPrivileges,
    getPrivilegeById,
    updatePrivilege,
    deletePrivilege
};
