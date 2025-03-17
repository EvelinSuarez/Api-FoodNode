const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
require('dotenv').config();

const login = async (email, password) => {
    const user = await User.findOne({ 
        where: { email }, 
        include: { model: Role } // Solo incluye el rol, sin permisos
    });
    
    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Contraseña incorrecta');
    }

    // Verificar si el usuario tiene un rol antes de acceder a 'name'
    const roleName = user.Role ? user.Role.name : 'Sin rol'; 

    const token = jwt.sign(
        { id: user.idUsers, email: user.email, role: roleName }, // Evita el error si no hay rol
        process.env.JWT_SECRET, 
        { expiresIn: '8h' }
    );

    return token;
};

module.exports = { login };
