const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const employeeValidations = require('../middlewares/employeeValidations');

router.get('/', employeeController.getAllEmployees);
router.get('/:idEmployee', employeeValidations.getEmployeeByIdValidation, employeeController.getEmployeeById);
router.post('/', employeeValidations.createEmployeeValidation, employeeController.createEmployee);
router.put('/:idEmployee', employeeValidations.updateEmployeeValidation, employeeController.updateEmployee);
router.delete('/:idEmployee', employeeValidations.deleteEmployeeValidation, employeeController.deleteEmployee);
router.patch('/:idEmployee', employeeValidations.changeStateValidation, employeeController.changeStateEmployee);
router.get('/performance/overview', employeeController.getEmployeesWithOrderCounts);

module.exports = router;