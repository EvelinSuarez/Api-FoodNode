const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const authRoutes = require('./authRoutes');
const employeeRoutes = require('./employeeRoutes');
const providerRoutes = require('./providerRoutes');
const purchaseRecordRoutes = require('./purchaseRecordRoutes');
const conceptSpentRoutes = require('./conceptSpentRoutes');
const monthlyOverallExpenseRoutes = require('./monthlyOverallExpenseRoutes');
const customersRoutes = require('./customersRoutes');
const roleRoutes = require('./roleRoutes');
const permissionRoutes = require('./permissionRoutes');
const privilegeRoutes = require('./privilegeRoutes');
const aditionalServicesRoutes = require('./aditionalServicesRoutes');
const reservationsRoutes = require('./reservationsRoutes');
const supplierRoutes = require('./supplierRoutes');


const router = express.Router();

// 🔐 Aplicamos autenticación a todas las rutas
router.use('/auth', authRoutes);
router.use('/empleados', authMiddleware(), employeeRoutes);
router.use('/proveedores', authMiddleware(), providerRoutes);
router.use('/registrosCompras', authMiddleware(), purchaseRecordRoutes);
router.use('/conceptosGastos', authMiddleware(), conceptSpentRoutes);
router.use('/gastosMensuales', authMiddleware(), monthlyOverallExpenseRoutes);
router.use('/clientes', authMiddleware(), customersRoutes);
router.use('/roles', authMiddleware(), roleRoutes);
router.use('/permisos', authMiddleware(), permissionRoutes);
router.use('/privilegios', authMiddleware(), privilegeRoutes);
router.use('/serviciosAdicionales', authMiddleware(), aditionalServicesRoutes);
router.use('/reservas', authMiddleware(), reservationsRoutes);
router.use('/proveedores', authMiddleware(), supplierRoutes);


module.exports = router;