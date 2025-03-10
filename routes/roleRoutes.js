const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const roleValidations = require('../middlewares/roleValidations');

router.get('/', roleController.getAllRoles);
router.get('/:idRole', roleValidations.getRoleByIdValidation, roleController.getRoleById);
router.post('/', roleValidations.createRoleValidation, roleController.createRole);
router.put('/:idRole', roleValidations.updateRoleValidation, roleController.updateRole);
router.delete('/:idRole', roleValidations.deleteRoleValidation, roleController.deleteRole);
router.patch('/:idRole', roleValidations.changeRoleStateValidation, roleController.changeRoleState);

module.exports = router;    