const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');
const processValidations = require('../middlewares/processValidations');

router.get('/', processController.getAllProcesses);
router.get('/:id', processValidations.getProcessByIdValidation, processController.getProcessById);
router.post('/', processValidations.createProcessValidation, processController.createProcess);
router.put('/:id', processValidations.updateProcessValidation, processController.updateProcess);
router.delete('/:id', processValidations.deleteProcessValidation, processController.deleteProcess);
router.patch('/:id', processValidations.changeStateValidation, processController.changeStateProcess);
router.post('/search', processValidations.searchProcessValidation, processController.searchProcesses);

module.exports = router;