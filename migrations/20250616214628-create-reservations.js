'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reservations', {
      idReservations: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      idCustomers: { // FK
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers', // Referencia a la tabla de clientes que ya creaste
          key: 'idCustomers'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      dateTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      numberPeople: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      matter: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      timeDurationR: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ""
      },
      pass: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      decorationAmount: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      remaining: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      evenType: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      totalPay: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pendiente', 'confirmada', 'en_proceso', 'terminada', 'anulada'),
        allowNull: false,
        defaultValue: "pendiente"
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
    await queryInterface.dropTable('reservations');
  }
};