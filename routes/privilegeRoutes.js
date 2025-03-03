const express = require('express');
const router = express.Router();
const privilegeController = require('../controllers/privilegeController');
const privilegeValidations = require('../middlewares/privilegeValidations');

router.get('/', privilegeController.getAllPrivileges);
router.get('/:idPrivilege', privilegeValidations.getPrivilegeByIdValidation, privilegeController.getPrivilegeById);
router.post('/', privilegeValidations.createPrivilegeValidation, privilegeController.createPrivilege);
router.put('/:idPrivilege', privilegeValidations.updatePrivilegeValidation, privilegeController.updatePrivilege);
router.delete('/:idPrivilege', privilegeValidations.deletePrivilegeValidation, privilegeController.deletePrivilege);

module.exports = router;
