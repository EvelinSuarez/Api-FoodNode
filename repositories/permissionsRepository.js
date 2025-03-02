const Permission = require('../models/permission');

const createPermission = async (permission) => {
    return Permission.create(permission);
};

const getAllPermissions = async () => {
    return Permission.findAll();
};

const getPermissionById = async (idPermission) => {
    return Permission.findByPk(idPermission);
};

const updatePermission = async (idPermission, permission) => {
    return Permission.update(permission, { where: { idPermission } });
};

const deletePermission = async (idPermission) => {
    return Permission.destroy({ where: { idPermission } });
};

const changePermissionState = async (idPermission, status) => {
    return Permission.update({ status }, { where: { idPermission } });
};

module.exports = {
    createPermission,
    getAllPermissions,
    getPermissionById,
    updatePermission,
    deletePermission,
    changePermissionState,
};