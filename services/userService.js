// services/userService.js  <-- REEMPLAZA TODO EL ARCHIVO CON ESTO

const bcrypt = require('bcryptjs');
// Asegúrate de que la ruta a tu modelo es la correcta
const { user: User } = require('../models'); // O '../models/user' si no tienes un index.js

const createUser = async (userData) => {
    // El hook beforeCreate en tu modelo de Sequelize debería encargarse del hash.
    const newUser = await User.create(userData);
    const { password, ...userWithoutPassword } = newUser.get({ plain: true });
    return userWithoutPassword;
};

const getAllUsers = async () => {
    return User.findAll({
        attributes: { exclude: ['password'] } // Siempre excluye la contraseña
    });
};

const getUserById = async (id) => {
    return User.findByPk(id, {
        attributes: { exclude: ['password'] }
    });
};

// ==========================================================
// ESTA ES LA FUNCIÓN CRÍTICA QUE DEBES REEMPLAZAR
// ==========================================================
const updateUser = async (id, userData) => {
    // 1. Encuentra el usuario para asegurarte de que existe.
    const userToUpdate = await User.findByPk(id);
    if (!userToUpdate) {
        // Si no se encuentra, el controlador manejará la respuesta 404.
        return null;
    }

    // 2. Si se envía una nueva contraseña, la hasheamos.
    if (userData.password && userData.password.trim() !== '') {
        userData.password = await bcrypt.hash(userData.password, 10);
    } else {
        // Si no se envía contraseña, la eliminamos del objeto para no sobreescribir la existente.
        delete userData.password;
    }

    // 3. Actualiza la instancia del usuario en la base de datos con los nuevos datos.
    await userToUpdate.update(userData);

    // 4. Devuelve el objeto del usuario ACTUALIZADO, SIN la contraseña. Esto es lo que React necesita.
    const { password, ...updatedUserWithoutPassword } = userToUpdate.get({ plain: true });
    return updatedUserWithoutPassword;
};
// ==========================================================
// FIN DE LA FUNCIÓN CRÍTICA
// ==========================================================


const deleteUser = async (id) => {
    // .destroy devuelve el número de filas eliminadas.
    return User.destroy({ where: { idUser: id } });
};

const changeStateUser = async (id, status) => {
    // .update devuelve un array con el número de filas afectadas.
    const [rowsAffected] = await User.update({ status }, { where: { idUser: id } });

    if (rowsAffected > 0) {
        // Si se actualizó, devuelve el usuario actualizado para que el frontend pueda refrescar el estado.
        return getUserById(id);
    }
    return null;
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeStateUser,
};