const roleRepository = require('../repositories/roleRepository');

const createRole = async (role) => {
    return roleRepository.createRole(role);
};

const getAllRoles = async () => {
    return roleRepository.getAllRoles();
};

const getRoleById = async (idRole) => {
    return roleRepository.getRoleById(idRole);
};

const updateRole = async (idRole, role) => {
    return roleRepository.updateRole(idRole, role);
};

const deleteRole = async (idRole) => {
    return roleRepository.deleteRole(idRole);
};

const changeRoleState = async (idRole, status) => {
    return roleRepository.changeRoleState(idRole, status);
};

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    changeRoleState,
};
