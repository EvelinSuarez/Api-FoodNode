const { ExpressValidator } = require('express-validator');
const authService = require('../services/authService');




const login = async (req, res) => {
  try {
    // 🔹 Recibir el token y usuario correctamente
    const { user, token } = await authService.login(req.body.email, req.body.password);

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { login };


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
