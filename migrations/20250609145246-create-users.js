'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      idUser: { // Corregido a idUser por consistencia
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      document_type: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      document: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      cellphone: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      resetCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      resetCodeExp: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      idRole: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'idRole',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // CORREGIDO: No se puede borrar un rol si tiene usuarios.
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable('users');
  }
};