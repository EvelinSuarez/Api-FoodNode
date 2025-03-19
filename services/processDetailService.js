const processDetailRepository = require('../repositories/processDetailRepository');

const createProcessDetail = async (processDetail) => {
    return processDetailRepository.createProcessDetail(processDetail);
}

const getAllProcessDetails = async () => {
    return processDetailRepository.getAllProcessDetails();
}

const getProcessDetailById = async (id) => {
    return processDetailRepository.getProcessDetailById(id);
}

const updateProcessDetail = async (id, processDetail) => {
    return processDetailRepository.updateProcessDetail(id, processDetail);
}

const deleteProcessDetail = async (id) => {
    return processDetailRepository.deleteProcessDetail(id);
}

const getProcessDetailsByProcess = async (idProcess) => {
    return processDetailRepository.getProcessDetailsByProcess(idProcess);
}

const getProcessDetailsByEmployee = async (idEmployee) => {
    return processDetailRepository.getProcessDetailsByEmployee(idEmployee);
}

const getActiveProcessDetails = async () => {
    return processDetailRepository.getActiveProcessDetails();
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