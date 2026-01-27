'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ... tu método up() se queda igual ...
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rolePrivileges', {
      idPrivilegedRole: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      idRole: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'idRole'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idPrivilege: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'privileges',
          key: 'idPrivilege'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Añadir índice de forma segura (si no existe)
    const existingIndexes = await queryInterface.showIndex('rolePrivileges');
    const hasUq = existingIndexes && existingIndexes.some(ix => ix.name === 'uq_role_privilege');
    if (!hasUq) {
      await queryInterface.addIndex(
        'rolePrivileges',
        ['idRole', 'idPrivilege'],
        {
          unique: true,
          name: 'uq_role_privilege' // <-- Nombre del índice
        }
      );
    }
  },

  // ***** CAMBIO AQUÍ *****
  async down(queryInterface, Sequelize) {
    // 1. Primero, elimina el índice que creaste si existe.
    const existingIndexes = await queryInterface.showIndex('rolePrivileges');
    const hasUq = existingIndexes && existingIndexes.some(ix => ix.name === 'uq_role_privilege');
    if (hasUq) {
      await queryInterface.removeIndex('rolePrivileges', 'uq_role_privilege');
    }

    // 2. Luego, elimina la tabla.
    await queryInterface.dropTable('rolePrivileges');
  }
};