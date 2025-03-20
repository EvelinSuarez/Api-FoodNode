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

const changeStateProcess = async (id, status) => {
    return processRepository.changeStateProcess(id, status);
}

const searchProcesses = async (searchTerm) => {
    return processRepository.searchProcesses(searchTerm);
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