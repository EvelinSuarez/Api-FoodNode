const express = require('express');
const router = express.Router();
const reservationServicesController = require('../controllers/reservationServicesController');
const reservationServicesValidations = require('../middlewares/reservationServicesValidations');

router.post('/', reservationServicesValidations.addServiceToReservationValidation, reservationServicesController.addServiceToReservation);
router.get('/:idReservations', reservationServicesValidations.getServicesByReservationValidation, reservationServicesController.getServicesByReservation);
router.delete('/:idReservations/:idAditionalServices', reservationServicesValidations.removeServiceFromReservationValidation,reservationServicesController.removeServiceFromReservation);
router.get('/', reservationServicesController.getAllServices);

module.exports = router;
