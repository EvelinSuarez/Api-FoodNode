// Archivo nuevo: backend/src/controllers/dashboardController.js

const dashboardService = require('../services/dashboardService');

const getLaborExpenses = async (req, res) => {
    try {
        // req.query contendrá { year, month, idExpenseCategory }
        const expenseItems = await dashboardService.getLaborDashboardData(req.query);
        // Transformamos los datos para que el frontend los entienda como antes
        const formattedExpenses = expenseItems.map(item => ({
            total: item.price, // El valor del gasto ahora es 'price'
            // Mantenemos la estructura que el frontend espera
            specificConceptSpent: item.specificConceptSpent 
        }));
        res.status(200).json(formattedExpenses);
    } catch (error) {
        console.error("Error en el controlador del dashboard:", error);
        res.status(500).json({ message: "Error al obtener datos para el dashboard", error: error.message });
    }
};

module.exports = {
    getLaborExpenses,
};