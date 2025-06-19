// Archivo nuevo: backend/src/services/dashboardService.js

const dashboardRepository = require('../repositories/dashboardRepository');

const getLaborDashboardData = async (filters) => {
    // Aquí puedes añadir más lógica si es necesario
    return dashboardRepository.findExpenseItemsByFilter(filters);
};

module.exports = {
    getLaborDashboardData,
};