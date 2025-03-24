const jwt = require('jsonwebtoken');
const { Role } = require('../models/role'); 
const { User } = require('../models/user');

require('dotenv').config();

const authMiddleware = () => {
    return async (req, res, next) => {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
        }

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;

            // Obtener el usuario sin verificar permisos ni privilegios
            const user = await User.findByPk(req.user.id, {
                include: {
                    model: Role
                }
            });

            if (!user) {
                return res.status(403).json({ message: 'Usuario no encontrado.' });
            }

            next();
        } catch (error) {
            res.status(400).json({ message: 'No tiene permisos' });
        }
    };
};

module.exports = authMiddleware;
