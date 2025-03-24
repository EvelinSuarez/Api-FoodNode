const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidations = require('../middlewares/userValidation');
const VerifyToken = require('../middlewares/verifyToken');
const authorize = require('../middlewares/authPermissions');

router.get('/', VerifyToken, userController.getAllUsers);
router.get('/:id',authorize(["Vizualizar Usuario"]), userValidations.getUserByIdValidation, userController.getUserById);
router.post('/',authorize(["Crear Usuario"]), userValidations.createUserValidation, userController.createUser);
router.put('/:id',authorize(["Actualizar Usuario"]), userValidations.updateUserValidation, userController.updateUser);
router.delete('/:id',authorize(["Inhabilitar Usuario"]), userValidations.deleteUserValidation, userController.deleteUser);

module.exports = router;
