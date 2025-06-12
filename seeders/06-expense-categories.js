// seeders/YYYYMMDDHHMMSS-expense-categories.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
      { name: 'Personal y Honorarios', description: 'Gastos asociados al pago de salarios, prestaciones, y contratación de servicios profesionales.' },
      { name: 'Servicios Públicos y Comunicaciones', description: 'Costos mensuales relacionados con el uso de servicios esenciales como energía, agua, internet y telefonía móvil.' },
      { name: 'Alquiler y Arrendamientos', description: 'Pagos periódicos por el arrendamiento de locales comerciales, bodegas, oficinas, etc.' },
      { name: 'Seguros y Obligaciones Legales', description: 'Gastos relacionados con la protección de bienes, cumplimiento de normativas legales y pagos fiscales.' },
      { name: 'Equipamiento y Mantenimiento', description: 'Inversiones y gastos para la adquisición y mantenimiento de maquinaria e infraestructura.' },
      { name: 'Publicidad y Marketing', description: 'Gastos destinados a la promoción del negocio y atracción de nuevos clientes.' },
    ];

    const categoriesWithTimestamps = categories.map(cat => ({
      ...cat,
      status: true,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('expense_category', categoriesWithTimestamps, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Esto borrará TODAS las categorías. Útil para resetear.
    await queryInterface.bulkDelete('expense_category', null, {});
  }
};