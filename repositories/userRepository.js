const bcrypt = require('bcryptjs');
const User = require('../models/user');

const createUser = async (user) => {
    return User.create(user); // Ya se maneja en beforeCreate
};


const getAllUsers = async () => {
    return User.findAll();
};

const getUserById = async (id) => {
    // USA findByPk con attributes para seleccionar o excluir campos
    return User.findByPk(id, {
        attributes: {
            exclude: ['password'] // Excluye el campo 'password'
        }
        // Opcionalmente, puedes listar explícitamente los campos que SÍ quieres:
        // attributes: ['idUsers', 'email', 'full_name', 'idRole', ...] // Lista todos MENOS password
    });
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

const changeStateUser = async (id, status) => {
    return User.update({ status }, { where: { idUsers: id } });
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeStateUser,
};

