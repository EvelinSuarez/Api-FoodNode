const userRepository = require('../repositories/userRepository');

const createUser = async (user) => {
    return userRepository.createUser(user);
};

const getAllUsers = async () => {
    return userRepository.getAllUsers();
};

const getUserById = async (id) => {
    return userRepository.getUserById(id);
};

const updateUser = async (id, user) => {
    return userRepository.updateUser(id, user);
};

const deleteUser = async (id) => {
    return userRepository.deleteUser(id);
};

const changeStateUser = async (id, status) => {
    return userRepository.changeStateUser(id, status);
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeStateUser,
};
