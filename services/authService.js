const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const register = async (userData) => {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    return await User.create(userData);
};

const login = async (email, password) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign({ id: user.idUsers, email: user.email, role: user.idRole }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return token;
};

module.exports = { register, login };

