const Permissions = require('../models/permission');

const createPermission = async (permission) => {
    return Permissions.create(permission);
};

const getAllPermissions = async () => {
    return Permissions.findAll();
};

const getPermissionById = async (idPermission) => {
    return Permissions.findByPk(idPermission);
};

const updatePermission = async (idPermission, permission) => {
    return Permissions.update(permission, { where: { idPermission } });
};

const deletePermission = async (idPermission) => {
    return Permissions.destroy({ where: { idPermission } });
};

const changePermissionState = async (idPermission, status) => {
    return Permissions.update({ status }, { where: { idPermission } });
};

module.exports = {
    createPermission,
    getAllPermissions,
    getPermissionById,
    updatePermission,
    deletePermission,
    changePermissionState,
};