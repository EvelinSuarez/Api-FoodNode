'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('privileges', {
      idPrivilege: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      privilegeName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      privilegeKey: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      idPermission: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'idPermission'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si se borra un permiso, se borran sus privilegios asociados.
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('privileges');
  }
};