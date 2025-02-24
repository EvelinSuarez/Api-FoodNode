const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const employeeValidations = require('../middlewares/employeeValidations');

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeValidations.getEmployeeByIdValidation, employeeController.getEmployeeById);
router.post('/', employeeValidations.createEmployeeValidation, employeeController.createEmployee);
router.put('/:id', employeeValidations.updateEmployeeValidation, employeeController.updateEmployee);
router.delete('/:id', employeeValidations.deleteEmployeeValidation, employeeController.deleteEmployee);
router.patch('/:id', employeeValidations.changeStateValidation, employeeController.changeStateEmployee);

module.exports = router;