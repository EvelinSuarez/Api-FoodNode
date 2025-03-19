const processRepository = require('../repositories/processRepository');

const createProcess = async (process) => {
    return processRepository.createProcess(process);
}

const getAllProcesses = async () => {
    return processRepository.getAllProcesses();
}

const getProcessById = async (id) => {
    return processRepository.getProcessById(id);
}

const updateProcess = async (id, process) => {
    return processRepository.updateProcess(id, process);
}

const deleteProcess = async (id) => {
    return processRepository.deleteProcess(id);
}

const getProcessesBySpecSheet = async (idSpecSheet) => {
    return processRepository.getProcessesBySpecSheet(idSpecSheet);
}

const getProcessesByProcessDetail = async (idProcessDetail) => {
    return processRepository.getProcessesByProcessDetail(idProcessDetail);
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