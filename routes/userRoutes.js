const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidations = require('../middlewares/userValidation');

router.get('/', userController.getAllUsers);
router.get('/:id', userValidations.getUserByIdValidation, userController.getUserById);
router.post('/', userValidations.createUserValidation, userController.createUser);
router.put('/:id', userValidations.updateUserValidation, userController.updateUser);
router.delete('/:id', userValidations.deleteUserValidation, userController.deleteUser);
router.patch('/:id', userValidations.changeStateValidation, userController.changeStateUser);

module.exports = router;