'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const ALLOWED_CATEGORIES = ['CARNE', 'VEGETALES', 'LACTEOS', 'FRUTAS', 'ABARROTES', 'LIMPIEZA', 'BEBIDAS', 'CONGELADOS', 'OTROS'];

    await queryInterface.createTable('RegisterPurchases', {
      idRegisterPurchase: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      idProvider: { // FK
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Providers', // Tabla creada en la tanda anterior
          key: 'idProvider'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // No permitir borrar proveedor con compras asociadas
      },
      invoiceNumber: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      purchaseDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      receptionDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM(...ALLOWED_CATEGORIES),
        allowNull: false
      },
      subtotalAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      totalAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('PENDIENTE', 'RECIBIDA_PARCIAL', 'RECIBIDA_COMPLETA', 'PAGADA', 'CANCELADA'),
        allowNull: false,
        defaultValue: 'PENDIENTE'
      },
      paymentStatus: {
        type: Sequelize.ENUM('NO_PAGADA', 'PAGADA_PARCIAL', 'PAGADA'),
        allowNull: false,
        defaultValue: 'NO_PAGADA'
      },
      observations: {
        type: Sequelize.TEXT,
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RegisterPurchases');
    // Para PostgreSQL, también habría que eliminar el tipo ENUM si se creó explícitamente.
    // Para MySQL/MariaDB, no es necesario.
  }
};