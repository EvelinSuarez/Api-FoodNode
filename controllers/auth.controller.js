const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ message: 'Usuario registrado con éxito', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const token = await authService.login(req.body.email, req.body.password);
        res.json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { register, login };
