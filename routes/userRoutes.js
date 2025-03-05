const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
<<<<<<< HEAD
const userValidations = require('../middlewares/userValidate');
=======
const userValidations = require('../middlewares/userValidation');
>>>>>>> 82b5c8a3c03ea364912426a80bfeda10bd6ee1f4

router.get('/', userController.getAllUsers);
router.get('/:id', userValidations.getUserByIdValidation, userController.getUserById);
router.post('/', userValidations.createUserValidation, userController.createUser);
router.put('/:id', userValidations.updateUserValidation, userController.updateUser);
router.delete('/:id', userValidations.deleteUserValidation, userController.deleteUser);
router.patch('/:id', userValidations.changeStateValidation, userController.changeStateUser);

module.exports = router;