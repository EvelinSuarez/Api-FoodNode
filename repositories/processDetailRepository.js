const ProcessDetail = require('../models/processDetail');
const Process = require('../models/process');
const Employee = require('../models/employee');

const createProcessDetail = async (processDetail) => {
    return ProcessDetail.create(processDetail);
}

const getAllProcessDetails = async () => {
    return ProcessDetail.findAll({
        include: [
            { model: Process },
            { model: Employee }
        ]
    });
}

const getProcessDetailById = async (idProcessDetail) => {
    return ProcessDetail.findByPk(idProcessDetail, {
        include: [
            { model: Process },
            { model: Employee }
        ]
    });
}

const updateProcessDetail = async (idProcessDetail, processDetail) => {
    return ProcessDetail.update(processDetail, { 
        where: { idProcessDetail } 
    });
}

const deleteProcessDetail = async (idProcessDetail) => {
    return ProcessDetail.destroy({ 
        where: { idProcessDetail } 
    });
}

const getProcessDetailsByProcess = async (idProcess) => {
    return ProcessDetail.findAll({ 
        where: { idProcess },
        include: [{ model: Employee }]
    });
}

const getProcessDetailsByEmployee = async (idEmployee) => {
    return ProcessDetail.findAll({ 
        where: { idEmployee },
        include: [{ model: Process }]
    });
}

const getActiveProcessDetails = async () => {
    return ProcessDetail.findAll({
        where: {
            endDate: null
        },
        include: [
            { model: Process },
            { model: Employee }
        ]
    });
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