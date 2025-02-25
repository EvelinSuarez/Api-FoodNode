const Role = require('../models/role');

const createRole = async (role) => {
    return Role.create(role);
};

const getAllRoles = async () => {
    return Role.findAll();
};

const getRoleById = async (idRole) => {
    return Role.findByPk(idRole);
};

const updateRole = async (idRole, role) => {
    return Role.update(role, { where: { idRole } });
};

const deleteRole = async (idRole) => {
    return Role.destroy({ where: { idRole } });
};

const changeRoleState = async (idRole, status) => {
    return Role.update({ status }, { where: { idRole } });
};

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    changeRoleState,
};
