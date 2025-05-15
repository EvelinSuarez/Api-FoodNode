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

const changeStateProcessDetail = async (id, status) => {
    return processDetailRepository.changeStateProcessDetail(id, status);
}

const getProcessDetailsByProcess = async (idProcess) => {
    return processDetailRepository.getProcessDetailsByProcess(idProcess);
}

const getProcessDetailsBySpecSheet = async (idSpecSheet) => {
    return processDetailRepository.getProcessDetailsBySpecSheet(idSpecSheet);
}
const getProcessDetailsByProductionOrder = async (idProductionOrder) => {
    return processDetailRepository.getProcessDetailsByProductionOrder(idProductionOrder);
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
    getProcessDetailsByProductionOrder,
    updateProcessDetail,
    deleteProcessDetail,
    changeStateProcessDetail,
    getProcessDetailsByProcess,
    getProcessDetailsBySpecSheet,
    getProcessDetailsByEmployee,
    getActiveProcessDetails
};