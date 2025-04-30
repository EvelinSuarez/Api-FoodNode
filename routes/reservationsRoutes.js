const express = require('express');
const router = express.Router();
const reservationsController = require('../controllers/reservationsController');
const reservationsValidations = require('../middlewares/reservationsValidations');

router.get('/', reservationsController.getAllReservations);
router.get('/:id', reservationsValidations.getReservationsByIdValidation, reservationsController.getReservationsById);
router.post('/', reservationsValidations.createReservationsValidation, reservationsController.createReservations);
router.put('/:id', reservationsValidations.updateReservationsValidation, reservationsController.updateReservations);
router.delete('/:id', reservationsValidations.deleteReservationsValidation, reservationsController.deleteReservations);
router.patch('/:id', reservationsValidations.changeStateValidation, reservationsController.changeStateReservations);


module.exports = router;
