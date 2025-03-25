const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidations = require('../middlewares/userValidation');
const VerifyToken = require('../middlewares/verifyToken');
const authorize = require('../middlewares/authPermissions');

router.get('/', VerifyToken, userController.getAllUsers);
router.get('/:id',VerifyToken,authorize(["Vizualizar Usuario"]), userValidations.getUserByIdValidation, userController.getUserById);
router.post('/',VerifyToken,authorize(["Crear Usuario"]), userValidations.createUserValidation, userController.createUser);
router.put('/:id',VerifyToken,authorize(["Actualizar Usuario"]), userValidations.updateUserValidation, userController.updateUser);
router.delete('/:id',VerifyToken,authorize(["Inhabilitar Usuario"]), userValidations.deleteUserValidation, userController.deleteUser);


module.exports = router;
