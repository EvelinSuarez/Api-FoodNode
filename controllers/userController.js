// controllers/userController.js
const { validationResult } = require('express-validator');
const userService = require('../services/userService');

const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user); // user ya no tiene la contraseña
    } catch (error) {
        console.error("Error en createUser:", error);
        res.status(400).json({ message: error.message || "Error al crear el usuario." });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users); // users ya no tienen la contraseña
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
        // La validación de existencia ya se hizo en el middleware
        const user = await userService.getUserById(req.params.idUser);
        res.status(200).json(user); // user ya no tiene la contraseña
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
        // El servicio se encarga de todo. Retorna el usuario actualizado o null.
        const updatedUser = await userService.updateUser(req.params.idUser, req.body);
        
        if (!updatedUser) {
            // Este caso se dará si el ID es válido pero no se encuentra el usuario (ya validado en middleware).
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        // Se envía el objeto del usuario actualizado y sin contraseña al frontend.
        res.status(200).json(updatedUser);
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
        const result = await userService.deleteUser(req.params.idUser);
        if (result === 0) {
            // Esto no debería pasar gracias a validateUserExistence, pero es una buena práctica.
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar.' });
        }
        res.status(204).end(); // 204 No Content es la respuesta estándar para un delete exitoso.
    } catch (error) {
        console.error("Error en deleteUser:", error);
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
        const { idUser } = req.params;
        const { status } = req.body;

        const updatedUser = await userService.changeStateUser(idUser, status);

        if (!updatedUser) {
             return res.status(404).json({ message: 'Usuario no encontrado o no se pudo cambiar el estado.' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error en changeStateUser:", error);
        res.status(500).json({ message: error.message || "Error al cambiar el estado del usuario." });
    }
};

// Dejamos tu función de perfil de usuario intacta
const getUserProfile = async (req, res) => {
    try {
        const userIdFromToken = req.user?.idUser || req.user?.id || req.userId;
        if (!userIdFromToken) {
            return res.status(401).json({ message: "Token inválido o usuario no identificado para obtener perfil." });
        }
        const user = await userService.getUserById(userIdFromToken);
        if (!user) {
            return res.status(404).json({ message: "Usuario asociado al token no encontrado." });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Error interno al obtener el perfil del usuario." });
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