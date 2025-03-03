const permissionRepository = require('../repositories/permissionRepository');

const createPermission = async (permission) => {
    return permissionRepository.createPermission(permission);
};

const getAllPermissions = async () => {
    return permissionRepository.getAllPermissions();
};

const getPermissionById = async (idPermission) => {
    return permissionRepository.getPermissionById(idPermission);
};

const updatePermission = async (idPermission, permission) => {
    return permissionRepository.updatePermission(idPermission, permission);
};

const deletePermission = async (idPermission) => {
    return permissionRepository.deletePermission(idPermission);
};

const changePermissionState = async (idPermission, status) => {
    return permissionRepository.changePermissionState(idPermission, status);
};

module.exports = {
    createPermission,
    getAllPermissions,
    getPermissionById,
    updatePermission,
    deletePermission,
    changePermissionState,
};
