// controllers/userController.js
const { validationResult } = require('express-validator');
const userService = require('../services/userService'); // Tu capa de servicio backend

const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await userService.createUser(req.body);
        const { password, ...userWithoutPassword } = user.toJSON();
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error("Error en createUser:", error);
        res.status(400).json({ message: error.message || "Error al crear el usuario." });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userIdFromToken = req.user?.idUsers || req.user?.id || req.userId; // Ajusta según tu middleware verifyToken
        if (!userIdFromToken) {
            return res.status(401).json({ message: "Token inválido o usuario no identificado para obtener perfil." });
        }
        const user = await userService.getUserById(userIdFromToken);
        if (!user) {
            return res.status(404).json({ message: "Usuario asociado al token no encontrado." });
        }
        res.status(200).json(user); // Asumiendo que getUserById ya excluye la contraseña
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Error interno al obtener el perfil del usuario." });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user.toJSON();
            return userWithoutPassword;
        });
        res.status(200).json(usersWithoutPasswords);
    } catch (error) {
        console.error("Error en getAllUsers:", error);
        res.status(500).json({ message: error.message || "Error al obtener los usuarios." });
    }
};

const getUserById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await userService.getUserById(req.params.idUser); // Usar idUser
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json(user); // Asumiendo que getUserById ya excluye la contraseña
    } catch (error) {
        console.error("Error en getUserById:", error);
        res.status(500).json({ message: error.message || "Error al obtener el usuario." });
    }
};

const updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updatedUser = await userService.updateUser(req.params.idUser, req.body); // Usar idUser
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado o no se pudo actualizar.' });
        }
        res.status(200).json(updatedUser); // Devuelve el usuario actualizado
    } catch (error) {
        console.error("Error en updateUser:", error);
        res.status(400).json({ message: error.message || "Error al actualizar el usuario." });
    }
};

const deleteUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const result = await userService.deleteUser(req.params.idUser); // Usar idUser
        if (result === 0 || !result) {
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar.' });
        }
        res.status(204).end();
    } catch (error) {
        console.error("Error en deleteUser:", error);
        // Si es un error de restricción de FK, podría ser un 409 (Conflict)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({ message: "No se puede eliminar el usuario, tiene datos relacionados." });
        }
        res.status(500).json({ message: error.message || "Error al eliminar el usuario." });
    }
};

const changeStateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idUser } = req.params; // Usar idUser
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return res.status(400).json({ message: 'El campo status debe ser un valor booleano.' });
        }

        const updatedUser = await userService.changeStateUser(idUser, status);
        if (!updatedUser) {
             return res.status(404).json({ message: 'Usuario no encontrado o no se pudo cambiar el estado.' });
        }
        res.status(200).json(updatedUser); // Devuelve el usuario actualizado
    } catch (error) {
        console.error("Error en changeStateUser:", error);
        res.status(500).json({ message: error.message || "Error al cambiar el estado del usuario." });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeStateUser,
    getUserProfile,
};