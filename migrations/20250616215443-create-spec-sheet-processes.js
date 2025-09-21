// ...-create-spec-sheet-processes.js
// --- COPIA Y PEGA ESTE CONTENIDO COMPLETO ---
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SpecSheetProcesses', {
      idSpecSheetProcess: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      idSpecSheet: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'SpecSheets', key: 'idSpecSheet' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // ----- ¡EL CAMBIO MÁS IMPORTANTE ESTÁ AQUÍ! -----
      idProcess: {
        type: Sequelize.INTEGER,
        allowNull: true, // ¡Permitimos nulos para pasos personalizados!
        references: { model: 'Processes', key: 'idProcess' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Si se borra el proceso maestro, el paso no se rompe, solo pierde la referencia.
      },
      // ----- FIN DEL CAMBIO -----
      processOrder: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      processNameOverride: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      processDescriptionOverride: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estimatedTimeMinutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    await queryInterface.addIndex('SpecSheetProcesses', ['idSpecSheet', 'processOrder'], {
      unique: true,
      name: 'uq_spec_sheet_process_order'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('SpecSheetProcesses', 'uq_spec_sheet_process_order');
    await queryInterface.dropTable('SpecSheetProcesses');
  }
};