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

            const user = await User.findByPk(req.user.id, {
            include: {
                model: Role
            }
            });

            if (user) {
                req.user = {
                    id: user.idUsers,
                    role: user.idRole // Asegúrate que `user.idRole` es el ID del rol
                };
                return next();
            }

            next();
        } catch (error) {
            res.status(400).json({ message: 'No tiene permisos' });
        }
    };
};

module.exports = authMiddleware;
