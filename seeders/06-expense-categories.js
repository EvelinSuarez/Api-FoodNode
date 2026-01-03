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

    try {
      // 1. Verificar cuáles ya existen por nombre
      const [existingCategories] = await queryInterface.sequelize.query(
        'SELECT name FROM expense_category'
      );
      const existingNames = existingCategories.map(c => c.name);

      // 2. Filtrar y agregar Timestamps (en snake_case por el 'underscored: true')
      const categoriesToInsert = categories
        .filter(cat => !existingNames.includes(cat.name))
        .map(cat => ({
          name: cat.name,
          description: cat.description,
          status: true,
          created_at: new Date(), // Requerido por timestamps: true
          updated_at: new Date()
        }));

      if (categoriesToInsert.length > 0) {
        await queryInterface.bulkInsert('expense_category', categoriesToInsert, {});
        console.log(`✅ Se insertaron ${categoriesToInsert.length} categorías de gastos.`);
      } else {
        console.log('🔸 Las categorías de gastos ya están al día.');
      }
    } catch (error) {
      console.error('⚠️ Error en seeder de categorías de gastos:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('expense_category', null, {});
  }
};