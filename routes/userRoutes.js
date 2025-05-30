// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidations = require('../middlewares/userValidation'); // Asegúrate que el nombre del archivo sea correcto
const verifyToken = require('../middlewares/verifyToken');
const authorize = require('../middlewares/authPermissions');

// Obtener todos los usuarios
router.get('/',
    verifyToken,
    authorize(['usuarios-view']),
    userController.getAllUsers
);

// Obtener un usuario por ID
router.get('/:idUser', // Usamos :idUser
    verifyToken,
    authorize(['usuarios-view']),
    userValidations.getUserByIdValidation, // Validará req.params.idUser
    userController.getUserById
);

// Crear un nuevo usuario
router.post('/',
    verifyToken,
    authorize(['usuarios-create']),
    userValidations.createUserValidation,
    userController.createUser
);

// Actualizar un usuario existente
router.put('/:idUser', // Usamos :idUser
    verifyToken,
    authorize(['usuarios-edit']),
    userValidations.updateUserValidation, // Validará req.params.idUser y el body
    userController.updateUser
);

// Cambiar el estado de un usuario (activar/desactivar)
router.patch('/:idUser/state', // Ruta específica para cambiar estado, usa :idUser
    verifyToken,
    authorize(['usuarios-status']),
    userValidations.changeStateValidation, // Validará req.params.idUser y req.body.status
    userController.changeStateUser
);

// Eliminar un usuario
router.delete('/:idUser', // Usamos :idUser
    verifyToken,
    authorize(['usuarios-delete']),
    userValidations.deleteUserValidation, // Validará req.params.idUser
    userController.deleteUser
);

// Ruta para obtener el perfil del usuario autenticado
router.get('/profile/me',
    verifyToken,
    userController.getUserProfile // No requiere permiso de rol específico, solo token válido
);

module.exports = router;