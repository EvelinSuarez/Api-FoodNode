'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
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

    // Añadir el índice compuesto para asegurar que un rol no tenga el mismo privilegio dos veces
    await queryInterface.addIndex(
      'rolePrivileges',
      ['idRole', 'idPrivilege'],
      {
        unique: true,
        name: 'uq_role_privilege'
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rolePrivileges');
  }
};