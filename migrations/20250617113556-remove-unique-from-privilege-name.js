'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Nombre de la restricción por defecto en MySQL/PostgreSQL suele ser 'tabla_columna_key'
    // Si usas otro motor de BD o un nombre personalizado, podrías necesitar cambiarlo.
    const constraintName = 'privileges_privilegeName_key';
    try {
      await queryInterface.removeConstraint('privileges', constraintName);
      console.log(`Restricción '${constraintName}' eliminada exitosamente.`);
    } catch (error) {
      // Si el nombre de la restricción no es el esperado, Sequelize puede dar un error.
      // Este bloque ayuda a depurar si el nombre no es el correcto.
      console.error(`Error al eliminar la restricción '${constraintName}'. Puede que el nombre no sea correcto.`, error);
      // Opcionalmente, puedes buscar el nombre correcto en tu base de datos y reintentar.
    }
  },

  async down(queryInterface, Sequelize) {
    // Esto vuelve a añadir la restricción si necesitas revertir la migración
    await queryInterface.addConstraint('privileges', {
      fields: ['privilegeName'],
      type: 'unique',
      name: 'privileges_privilegeName_key'
    });
  }
};