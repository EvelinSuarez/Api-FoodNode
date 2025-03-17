const express = require('express');
const router = express.Router();
const conceptSpentController = require('../controllers/conceptSpentController');
const conceptSpentValidations = require('../middlewares/conceptSpentValidations');

router.get('/', conceptSpentController.getAllConceptSpents);
router.get('/:idExpenseType', conceptSpentValidations.getConceptSpentByIdValidation, conceptSpentController.getConceptSpentById);
router.post('/', conceptSpentValidations.createConceptSpentValidation, conceptSpentController.createConceptSpent);
router.put('/:idExpenseType', conceptSpentValidations.updateConceptSpentValidation, conceptSpentController.updateConceptSpent);
router.delete('/:idExpenseType', conceptSpentValidations.deleteConceptSpentValidation, conceptSpentController.deleteConceptSpent);
router.patch('/:idExpenseType', conceptSpentValidations.changeStateConceptSpentValidation, conceptSpentController.changeStateConceptSpent);

module.exports = router;
