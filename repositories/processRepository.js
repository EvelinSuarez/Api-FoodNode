const Process = require('../models/process');
const SpecSheet = require('../models/specSheet');
const ProcessDetail = require('../models/processDetail');

const createProcess = async (process) => {
    return Process.create(process);
}

const getAllProcesses = async () => {
    return Process.findAll({
        include: [
            { model: SpecSheet },
            { model: ProcessDetail }
        ]
    });
}

const getProcessById = async (idProcess) => {
    return Process.findByPk(idProcess, {
        include: [
            { model: SpecSheet },
            { model: ProcessDetail }
        ]
    });
}

const updateProcess = async (idProcess, process) => {
    return Process.update(process, { 
        where: { idProcess } 
    });
}

const deleteProcess = async (idProcess) => {
    return Process.destroy({ 
        where: { idProcess } 
    });
}

const getProcessesBySpecSheet = async (idSpecSheet) => {
    return Process.findAll({ 
        where: { idSpecSheet },
        include: [{ model: ProcessDetail }]
    });
}

const getProcessesByProcessDetail = async (idProcessDetail) => {
    return Process.findAll({ 
        where: { idProcessDetail },
        include: [{ model: SpecSheet }]
    });
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