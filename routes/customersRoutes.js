const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');
const customersValidations = require('../middlewares/customersValidate');

router.get('/', customersController.getAllCustomers);
router.get('/:id', customersValidations.getCustomersByIdValidation, customersController.getCustomersById);
router.post('/', customersValidations.createCustomersValidation, customersController.createCustomers);
router.put('/:id', customersValidations.updateCustomersValidation, customersController.updateCustomers);
router.delete('/:id', customersValidations.deleteCustomersValidation, customersController.deleteCustomers);
router.patch('/:id', customersValidations.changeStateValidation, customersController.changeStateCustomers);

module.exports = router;