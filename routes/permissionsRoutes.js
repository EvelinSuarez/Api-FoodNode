const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const permissionValidations = require('../middlewares/permissionValidations');

router.get('/', permissionController.getAllPermissions);
router.get('/:idPermission', permissionValidations.getPermissionByIdValidation, permissionController.getPermissionById);
router.post('/', permissionValidations.createPermissionValidation, permissionController.createPermission);
router.put('/:idPermission', permissionValidations.updatePermissionValidation, permissionController.updatePermission);
router.delete('/:idPermission', permissionValidations.deletePermissionValidation, permissionController.deletePermission);
router.patch('/:idPermission', permissionValidations.changePermissionStateValidation, permissionController.changePermissionState);

module.exports = router;
