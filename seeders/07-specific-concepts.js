// seeders/YYYYMMDDHHMMSS-specific-concepts.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Obtener las categorías de la base de datos para usar sus IDs
    const categories = await queryInterface.sequelize.query(
      `SELECT id_expense_category, name FROM expense_category;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 2. Crear un mapa para buscar fácilmente el ID por el nombre de la categoría
    const categoryMap = categories.reduce((map, category) => {
      map[category.name] = category.id_expense_category;
      return map;
    }, {});

    // 3. Definir los conceptos específicos, asociándolos por el nombre de la categoría
    const concepts = [
      // Personal y Honorarios
      { name: 'Sueldo Empleado Auxiliar', categoryName: 'Personal y Honorarios', requires_employee_calculation: true },
      { name: 'Sueldo Empleado Jefe de Cocina', categoryName: 'Personal y Honorarios', requires_employee_calculation: true },
      { name: 'Contador', categoryName: 'Personal y Honorarios' },
      { name: 'Tramitadora de seguridad social', categoryName: 'Personal y Honorarios' },

      // Servicios Públicos y Comunicaciones
      { name: 'Servicios', categoryName: 'Servicios Públicos y Comunicaciones' },
      { name: 'Wifi', categoryName: 'Servicios Públicos y Comunicaciones' },
      { name: 'Plan celular', categoryName: 'Servicios Públicos y Comunicaciones' },

      // Alquiler y Arrendamientos
      { name: 'Alquiler', categoryName: 'Alquiler y Arrendamientos' },

      // Seguros y Obligaciones Legales
      { name: 'Seguro', categoryName: 'Seguros y Obligaciones Legales' },
      { name: 'Pago de impoconsumo', categoryName: 'Seguros y Obligaciones Legales' },
      
      // Equipamiento y Mantenimiento
      { name: 'Maquinaria', categoryName: 'Equipamiento y Mantenimiento' },
      { name: 'Control integrado de plagas', categoryName: 'Equipamiento y Mantenimiento', is_bimonthly: true },
      
      // Publicidad y Marketing
      { name: 'Publicidad', categoryName: 'Publicidad y Marketing' },
    ];

    // 4. Mapear los conceptos para incluir el id_expense_category correcto y valores por defecto
    const conceptsToInsert = concepts.map(concept => ({
      name: concept.name,
      id_expense_category: categoryMap[concept.categoryName], // Obtener ID del mapa
      description: concept.description || null,
      requires_employee_calculation: concept.requires_employee_calculation || false,
      is_bimonthly: concept.is_bimonthly || false,
      status: true,
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Filtrar cualquier concepto que no haya encontrado una categoría (por si acaso)
    const validConcepts = conceptsToInsert.filter(c => c.id_expense_category);

    await queryInterface.bulkInsert('specific_concept_spent', validConcepts, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('specific_concept_spent', null, {});
  }
};