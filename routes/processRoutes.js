const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');
const processValidations = require('../middlewares/processValidations');

router.get('/', processController.getAllProcesses);
router.get('/:id', processValidations.getProcessByIdValidation, processController.getProcessById);
router.post('/', processValidations.createProcessValidation, processController.createProcess);
router.put('/:id', processValidations.updateProcessValidation, processController.updateProcess);
router.delete('/:id', processValidations.deleteProcessValidation, processController.deleteProcess);

// Additional routes for getting Processes by SpecSheet and ProcessDetail
router.get('/specsheet/:idSpecSheet', 
    processValidations.getProcessesBySpecSheetValidation, 
    processController.getProcessesBySpecSheet);
router.get('/processdetail/:idProcessDetail', 
    processValidations.getProcessesByProcessDetailValidation, 
    processController.getProcessesByProcessDetail);

module.exports = router;