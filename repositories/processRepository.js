const Process = require('../models/process');

const createProcess = async (process) => {
    return Process.create(process);
}

const getAllProcesses = async () => {
    return Process.findAll();
}

const getProcessById = async (idProcess) => {
    return Process.findByPk(idProcess);
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

const changeStateProcess = async (idProcess, status) => {
    return Process.update({ status }, { 
        where: { idProcess } 
    });
}

const searchProcesses = async (searchTerm) => {
    return Process.findAll({
        where: {
            [require('sequelize').Op.or]: [
                { processName: { [require('sequelize').Op.like]: `%${searchTerm}%` } },
                { description: { [require('sequelize').Op.like]: `%${searchTerm}%` } }
            ]
        }
    });
}

module.exports = {
    createProcess,
    getAllProcesses,
    getProcessById,
    updateProcess,
    deleteProcess,
    changeStateProcess,
    searchProcesses
};