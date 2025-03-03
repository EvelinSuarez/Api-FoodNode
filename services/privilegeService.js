const privilegeRepository = require('../repositories/privilegeRepository');

const createPrivilege = async (privilegeData) => {
    return await privilegeRepository.createPrivilege(privilegeData);
};

const getAllPrivileges = async () => {
    return await privilegeRepository.getAllPrivileges();
};

const getPrivilegeById = async (idPrivilege) => {
    return await privilegeRepository.getPrivilegeById(idPrivilege);
};

const updatePrivilege = async (idPrivilege, privilegeData) => {
    return await privilegeRepository.updatePrivilege(idPrivilege, privilegeData);
};

const deletePrivilege = async (idPrivilege) => {
    return await privilegeRepository.deletePrivilege(idPrivilege);
};

module.exports = {
    createPrivilege,
    getAllPrivileges,
    getPrivilegeById,
    updatePrivilege,
    deletePrivilege
};
