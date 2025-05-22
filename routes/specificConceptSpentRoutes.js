// routes/specificConceptSpentRoutes.js
const express = require('express');
const router = express.Router();
const specificConceptSpentController = require('../controllers/specificConceptSpentController');
const validations = require('../middlewares/specificConceptSpentValidations'); // Asegúrate que el nombre del archivo es este

// Path base podría ser /specific-concepts
router.post('/', validations.createSpecificConceptSpentValidation, specificConceptSpentController.createSpecificConceptSpent);
router.get('/', validations.getAllSpecificConceptSpentsQueryValidation, specificConceptSpentController.getAllSpecificConceptSpents);
router.get('/:idSpecificConcept', validations.getSpecificConceptSpentByIdValidation, specificConceptSpentController.getSpecificConceptSpentById);
router.put('/:idSpecificConcept', validations.updateSpecificConceptSpentValidation, specificConceptSpentController.updateSpecificConceptSpent);
router.delete('/:idSpecificConcept', validations.deleteSpecificConceptSpentValidation, specificConceptSpentController.deleteSpecificConceptSpent);
router.patch('/:idSpecificConcept/status', validations.changeStateSpecificConceptSpentValidation, specificConceptSpentController.changeStateSpecificConceptSpent);

module.exports = router;