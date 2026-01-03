'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Obtener las categorías reales
    const categories = await queryInterface.sequelize.query(
      `SELECT id_expense_category, name FROM expense_category;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const categoryMap = categories.reduce((map, category) => {
      map[category.name] = category.id_expense_category;
      return map;
    }, {});

    const concepts = [
      { name: 'Sueldo Empleado Auxiliar', categoryName: 'Personal y Honorarios', requires_employee_calculation: true },
      { name: 'Sueldo Empleado Jefe de Cocina', categoryName: 'Personal y Honorarios', requires_employee_calculation: true },
      { name: 'Contador', categoryName: 'Personal y Honorarios' },
      { name: 'Tramitadora de seguridad social', categoryName: 'Personal y Honorarios' },
      { name: 'Servicios', categoryName: 'Servicios Públicos y Comunicaciones' },
      { name: 'Wifi', categoryName: 'Servicios Públicos y Comunicaciones' },
      { name: 'Plan celular', categoryName: 'Servicios Públicos y Comunicaciones' },
      { name: 'Alquiler', categoryName: 'Alquiler y Arrendamientos' },
      { name: 'Seguro', categoryName: 'Seguros y Obligaciones Legales' },
      { name: 'Pago de impoconsumo', categoryName: 'Seguros y Obligaciones Legales' },
      { name: 'Maquinaria', categoryName: 'Equipamiento y Mantenimiento' },
      { name: 'Control integrado de plagas', categoryName: 'Equipamiento y Mantenimiento', is_bimonthly: true },
      { name: 'Publicidad', categoryName: 'Publicidad y Marketing' },
    ];

    try {
      // 2. Verificar qué conceptos ya existen para no duplicar
      const [existingConcepts] = await queryInterface.sequelize.query(
        'SELECT name FROM specific_concept_spent'
      );
      const existingNames = existingConcepts.map(c => c.name);

      // 3. Mapear y filtrar
      const conceptsToInsert = concepts
        .filter(concept => !existingNames.includes(concept.name))
        .map(concept => {
          const idCat = categoryMap[concept.categoryName];
          if (!idCat) return null; // Saltar si la categoría no existe

          return {
            name: concept.name,
            id_expense_category: idCat,
            description: concept.description || null,
            requires_employee_calculation: concept.requires_employee_calculation || false,
            is_bimonthly: concept.is_bimonthly || false,
            status: true,
            created_at: new Date(),
            updated_at: new Date()
          };
        })
        .filter(c => c !== null);

      if (conceptsToInsert.length > 0) {
        await queryInterface.bulkInsert('specific_concept_spent', conceptsToInsert, {});
        console.log(`✅ Se insertaron ${conceptsToInsert.length} conceptos específicos.`);
      } else {
        console.log('🔸 Los conceptos específicos ya están al día.');
      }
    } catch (error) {
      console.error('⚠️ Error en seeder de conceptos específicos:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('specific_concept_spent', null, {});
  }
};