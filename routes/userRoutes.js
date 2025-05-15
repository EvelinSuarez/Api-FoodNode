// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidations = require('../middlewares/userValidation'); // Asumo que este archivo existe

// --- MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN ---
const verifyToken = require('../middlewares/verifyToken'); // Usará el payload del token con id, idRole
const authorize = require('../middlewares/authPermissions'); // Usará req.user.idRole

// Obtener todos los usuarios
router.get('/',
    verifyToken,
    authorize(['usuarios-view']), // Ejemplo: permiso para ver lista de usuarios
    userController.getAllUsers
);

// Obtener un usuario por ID
// Nota: el :id aquí es el id del usuario a obtener, no el del usuario logueado.
router.get('/:idUser', // Cambiado a :idUser para claridad
    verifyToken,
    authorize(['usuarios-view']), // O 'usuarios-view-details'
    userValidations.getUserByIdValidation, // Debería validar :idUser
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
router.put('/:idUser', // Cambiado a :idUser
    verifyToken,
    authorize(['usuarios-edit']),
    userValidations.updateUserValidation, // Debería validar :idUser y el body
    userController.updateUser
);

// Cambiar el estado de un usuario (activar/desactivar)
// Asegúrate de tener un userController.changeUserState y una validación adecuada
router.patch('/:idUser/state', // Cambiado a :idUser
    verifyToken,
    authorize(['usuarios-status']), // o ['usuarios-edit']
    userValidations.changeStateValidation, // Necesitarás esta validación
    userController.changeStateUser // Necesitarás este controlador
);


// Eliminar un usuario (usualmente se inhabilita, no se borra físicamente)
// Si realmente borras:
router.delete('/:idUser', // Cambiado a :idUser
    verifyToken,
    authorize(['usuarios-delete']),
    userValidations.deleteUserValidation, // Debería validar :idUser
    userController.deleteUser
);


// --- RUTA PARA OBTENER EL PERFIL DEL USUARIO AUTENTICADO ---
// El usuario solo necesita estar autenticado (token válido) para ver su propio perfil.
// No necesita un permiso específico como 'usuarios-view' para esto.
// El controlador userController.getUserProfile usará req.user.id (del token) para buscar su propio perfil.
router.get('/profile/me', // Ruta específica para el perfil del usuario logueado
    verifyToken, // Solo requiere que el token sea válido
    userController.getUserProfile
);

module.exports = router;