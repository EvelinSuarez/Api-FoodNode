const { ExpressValidator } = require('express-validator');
const authService = require('../services/authService');



const login = async (req, res) => {
   
    try {
        const token = await authService.login(req.body.email, req.body.password);
        res.json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const editProfile = async (req, res) => {
    try {
        const updatedUser = await authService.editProfile(req.user.id, req.body);
        res.json({ message: 'Perfil actualizado correctamente', user: updatedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const logout = (req, res) => {
    res.json({ message: 'Sesión cerrada correctamente' });
};

module.exports = {login, editProfile, logout};
