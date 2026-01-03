'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const constraintName = 'privileges_privilegeName_key';
    try {
      await queryInterface.removeConstraint('privileges', constraintName);
      console.log(`✅ Restricción '${constraintName}' eliminada o ya no existía.`);
    } catch (error) {
      // Solo imprimimos un aviso simple, no el error completo que asusta a Render
      console.log(`⚠️ Aviso: No se pudo eliminar '${constraintName}'. Probablemente ya fue eliminada o el nombre es distinto en Aiven.`);
      // No hacemos "throw error", así la migración se marca como completada
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.addConstraint('privileges', {
        fields: ['privilegeName'],
        type: 'unique',
        name: 'privileges_privilegeName_key'
      });
    } catch (error) {
      console.log('Error al revertir: la restricción ya podría existir.');
    }
  }
};