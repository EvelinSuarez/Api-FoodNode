const express = require('express');
const router = express.Router();
const conceptSpentController = require('../controllers/conceptSpentController');
const conceptSpentValidations = require('../middlewares/conceptSpentValidations');

router.get('/', conceptSpentController.getAllConceptSpents);
router.get('/:id', conceptSpentValidations.getConceptSpentByIdValidation, conceptSpentController.getConceptSpentById);
router.post('/', conceptSpentValidations.createConceptSpentValidation, conceptSpentController.createConceptSpent);
router.put('/:id', conceptSpentValidations.updateConceptSpentValidation, conceptSpentController.updateConceptSpent);
router.delete('/:id', conceptSpentValidations.deleteConceptSpentValidation, conceptSpentController.deleteConceptSpent);
router.patch('/:id', conceptSpentValidations.changeStateConceptSpentValidation, conceptSpentController.changeStateConceptSpent);

module.exports = router;
