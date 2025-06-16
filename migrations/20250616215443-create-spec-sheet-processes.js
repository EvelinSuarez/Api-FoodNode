'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SpecSheetProcesses', {
      idSpecSheetProcess: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      idSpecSheet: { // FK
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SpecSheets',
          key: 'idSpecSheet'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idProcess: { // FK
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Processes', // Tabla de la tanda anterior
          key: 'idProcess'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
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
    
    // Índice para asegurar que un proceso no se repita en el mismo orden para la misma ficha
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