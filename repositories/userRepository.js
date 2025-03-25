const bcrypt = require('bcryptjs');
const User = require('../models/user');

const createUser = async (user) => {
    return User.create(user); // Ya se maneja en beforeCreate
};


const getAllUsers = async () => {
    return User.findAll();
};

const getUserById = async (id) => {
    return User.findByPk(id);
};

const updateUser = async (id, user) => {
    if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
    return User.update(user, { where: { idUsers: id } });
};

const deleteUser = async (id) => {
    return User.destroy({ where: { idUsers: id } });
};

const changeStateUser = async (id, state) => {
    return User.update({ state }, { where: { idUsers: id } });
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeStateUser,
};
