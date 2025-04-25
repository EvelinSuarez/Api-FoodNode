const { validationResult } = require('express-validator');
const userService = require('../services/userService');

const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        // Asume que VerifyToken añade el ID del usuario a req.userId
        // *** ¡¡VERIFICA CÓMO TU VerifyToken GUARDA EL ID!! ***
        // Puede ser req.userId, req.user.id, req.user.idUsers, etc. AJUSTA SEGÚN SEA NECESARIO.
        const userId = req.userId; // O el campo correcto que VerifyToken establezca

        if (!userId) {
            // Si por alguna razón VerifyToken no añadió el ID (aunque debería si el token es válido)
            return res.status(401).json({ message: "Token inválido o usuario no identificado." });
        }

        // Reutiliza tu servicio existente para buscar por ID
        const user = await userService.getUserById(userId);

        if (!user) {
            // Esto sería raro si el token es válido, pero es una buena verificación
            return res.status(404).json({ message: "Usuario asociado al token no encontrado." });
        }

        // *** IMPORTANTE: Prepara la respuesta SIN la contraseña ***
        // Asegúrate de que los nombres de campo coincidan con tu Modelo Sequelize
        const userProfile = {
            id: user.idUsers,       // O como se llame tu PK (parece ser idUsers)
            document_type: user.document_type,
            document: user.document,
            cellphone: user.cellphone,
            full_name: user.full_name,
            email: user.email,
            role: user.idRole,      // ¡Asegúrate de que este es el campo del rol!
            status: user.status,
            // Añade cualquier otro campo que necesites en el frontend, EXCEPTO la contraseña
        };

        res.status(200).json(userProfile);

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Error interno al obtener el perfil del usuario." });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await userService.updateUser(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await userService.deleteUser(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const changeStateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await userService.changeStateUser(req.params.id, req.body.status);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
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
