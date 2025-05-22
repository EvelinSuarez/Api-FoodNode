// routes/conceptSpentRoutes.js (NUEVO - para conceptos específicos)
const express = require('express');
const router = express.Router();
const conceptSpentController = require('../controllers/conceptSpentController'); // El NUEVO controlador
const validations = require('../middlewares/conceptSpentValidations'); // Las NUEVAS validaciones

router.post('/', validations.createConceptSpentValidation, conceptSpentController.createConceptSpent);
router.get('/', validations.getAllConceptSpentsValidation, conceptSpentController.getAllConceptSpents); // Con validación de query params
router.get('/:idConceptSpent', validations.getConceptSpentByIdValidation, conceptSpentController.getConceptSpentById);
router.put('/:idConceptSpent', validations.updateConceptSpentValidation, conceptSpentController.updateConceptSpent);
router.delete('/:idConceptSpent', validations.deleteConceptSpentValidation, conceptSpentController.deleteConceptSpent);
router.patch('/:idConceptSpent/status', validations.changeStateConceptSpentValidation, conceptSpentController.changeStateConceptSpent);

module.exports = router;