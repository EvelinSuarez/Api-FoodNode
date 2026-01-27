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

const deleteUser = async (id) => {
    // .destroy devuelve el número de filas eliminadas.
    return User.destroy({ where: { idUser: id } });
};
const changeStateUser = async (id, status) => {
    // 2. Buscamos al usuario incluyendo la información de su Rol
    // Es vital usar 'include' para poder ver el estado del rol
    const user = await User.findByPk(id, {
        include: [{ 
            model: Role, 
            as: 'role' // <--- IMPORTANTE: Asegúrate de que este alias sea el mismo que definiste en tus asociaciones
        }]
    });

    if (!user) {
        return null;
    }

    // 3. VALIDACIÓN LÓGICA:
    // Si el 'status' que recibimos es TRUE (queremos activar al usuario)
    if (status === true || status === "true") {
        
        // Verificamos si el rol existe y si su estado es falso (inactivo)
        if (user.role && user.role.status === false) {
            // Lanzamos un error que el controlador atrapará
            // Este mensaje es el que llegará al toast.error del frontend
            throw new Error("No se puede activar el usuario: El rol asignado está inactivo.");
        }
    }

    // 4. Si pasó la validación o si estamos desactivando (status: false), procedemos
    await user.update({ status });

    // Devolvemos el usuario actualizado sin la contraseña
    const { password, ...updatedUser } = user.get({ plain: true });
    return updatedUser;
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeStateUser,
};