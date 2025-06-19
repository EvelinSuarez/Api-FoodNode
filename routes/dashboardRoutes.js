// Archivo nuevo: backend/src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Ruta específica para los gastos de mano de obra del dashboard
router.get('/labor-expenses', dashboardController.getLaborExpenses);

module.exports = router;