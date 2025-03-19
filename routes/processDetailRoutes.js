const express = require('express');
const router = express.Router();
const processDetailController = require('../controllers/processDetailController');
const processDetailValidations = require('../middlewares/processDetailValidations');

router.get('/', processDetailController.getAllProcessDetails);
router.get('/active', processDetailController.getActiveProcessDetails);
router.get('/:id', processDetailValidations.getProcessDetailByIdValidation, processDetailController.getProcessDetailById);
router.post('/', processDetailValidations.createProcessDetailValidation, processDetailController.createProcessDetail);
router.put('/:id', processDetailValidations.updateProcessDetailValidation, processDetailController.updateProcessDetail);
router.delete('/:id', processDetailValidations.deleteProcessDetailValidation, processDetailController.deleteProcessDetail);

// Additional routes for getting ProcessDetails by Process and Employee
router.get('/process/:idProcess', 
    processDetailValidations.getProcessDetailsByProcessValidation, 
    processDetailController.getProcessDetailsByProcess);
router.get('/employee/:idEmployee', 
    processDetailValidations.getProcessDetailsByEmployeeValidation, 
    processDetailController.getProcessDetailsByEmployee);

module.exports = router;