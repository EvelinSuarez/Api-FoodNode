const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidations = require('../middlewares/userValidation');
const authMiddleware = require('../middlewares/authValidations');

router.get('/', authMiddleware(), userController.getAllUsers);
router.get('/:id', authMiddleware(), userValidations.getUserByIdValidation, userController.getUserById);
router.post('/', userValidations.createUserValidation, userController.createUser);
router.put('/:id', authMiddleware(), userValidations.updateUserValidation, userController.updateUser);
router.delete('/:id', authMiddleware(), userValidations.deleteUserValidation, userController.deleteUser);
router.patch('/:id', authMiddleware(), userValidations.changeStateValidation, userController.changeStateUser);

module.exports = router;
