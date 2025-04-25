// src/routes/userRoutes.js (o donde definas las rutas de usuario)
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidations = require('../middlewares/userValidation');
const VerifyToken = require('../middlewares/verifyToken');
const authorize = require('../middlewares/authPermissions'); // Ya lo tienes

// --- Rutas existentes ---
router.get('/', VerifyToken, userController.getAllUsers);
router.get('/:id', VerifyToken, authorize(["Vizualizar Usuario"]), userValidations.getUserByIdValidation, userController.getUserById);
router.post('/', VerifyToken, authorize(["Crear Usuario"]), userValidations.createUserValidation, userController.createUser);
router.put('/:id', VerifyToken, authorize(["Actualizar Usuario"]), userValidations.updateUserValidation, userController.updateUser);
router.delete('/:id', VerifyToken, authorize(["Inhabilitar Usuario"]), userValidations.deleteUserValidation, userController.deleteUser);
// router.patch('/:id', ...) // Parece que falta la ruta PATCH para changeStateUser en tu código original?

// --- NUEVA RUTA PARA OBTENER EL PERFIL ---
// Usa GET y protégela con VerifyToken. No necesita validación de ID ni autorización específica (el token ya autoriza ver el propio perfil)
router.get('/profile/me', VerifyToken, userController.getUserProfile); // Usando /profile/me como ejemplo

module.exports = router;