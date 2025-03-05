const Privileges = require('../models/rolePrivileges');

const createPrivilege = async (privilegeData) => {
    return await Privilege.create(privilegeData);
};

const getAllPrivileges = async () => {
    return await Privilege.findAll();
};

const getPrivilegeById = async (idPrivilege) => {
    return await Privilege.findByPk(idPrivilege);
};

const updatePrivilege = async (idPrivilege, privilegeData) => {
    const privilege = await Privilege.findByPk(idPrivilege);
    if (!privilege) {
        throw new Error('Privilegio no encontrado');
    }
    return await privilege.update(privilegeData);
};

const deletePrivilege = async (idPrivilege) => {
    const privilege = await Privilege.findByPk(idPrivilege);
    if (!privilege) {
        throw new Error('Privilegio no encontrado');
    }
    return await privilege.destroy();
};

module.exports = {
    createPrivilege,
    getAllPrivileges,
    getPrivilegeById,
    updatePrivilege,
    deletePrivilege
};
