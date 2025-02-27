const express = require('express');
const router = express.Router();
const aditionalServicesController = require('../controllers/aditionalServicesController');
const aditionalServicesValidations = require('../middlewares/aditionalServicesValidations');

router.get('/', aditionalServicesController.getAllAditionalServices);
router.get('/:id', aditionalServicesValidations.getAditionalServicesByIdValidation, aditionalServicesController.getAditionalServicesById);
router.post('/', aditionalServicesValidations.createAditionalServicesValidation, aditionalServicesController.createAditionalServices);
router.put('/:id', aditionalServicesValidations.updateAditionalServicesValidation, aditionalServicesController.updateAditionalServices);
router.delete('/:id', aditionalServicesValidations.deleteAditionalServicesValidation, aditionalServicesController.deleteAditionalServices);
router.patch('/:id', aditionalServicesValidations.changeStateValidation, aditionalServicesController.changeStateAditionalServices);

module.exports = router;