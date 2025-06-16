'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Employees', {
      idEmployee: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      typeDocument: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      document: {
        type: Sequelize.INTEGER, // Si puede tener letras, cámbialo a STRING
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      cellPhone: {
        type: Sequelize.STRING(25),
        allowNull: false
      },
      dateOfEntry: {
        type: Sequelize.DATE,
        allowNull: false
      },
      emergencyContact: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      Relationship: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      nameFamilyMember: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      BloodType: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      socialSecurityNumber: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      Address: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      contractType: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
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
    await queryInterface.dropTable('Employees');
  }
};