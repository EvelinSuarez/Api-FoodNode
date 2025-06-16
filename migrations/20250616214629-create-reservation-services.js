'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reservationServices', {
      idReservationService: { // Clave primaria para la tabla de unión
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      idReservations: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'reservations', // IMPORTANTE: Asume que la tabla 'reservations' existe
          key: 'idReservations'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idAditionalServices: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'aditionalservices', // Hace referencia a la tabla que creaste arriba
          key: 'idAditionalServices'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
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

    // Añadir un índice único para evitar duplicados (una misma reservación no puede tener el mismo servicio dos veces)
    await queryInterface.addIndex(
      'reservationServices',
      ['idReservations', 'idAditionalServices'],
      {
        unique: true,
        name: 'uq_reservation_aditional_service'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Primero, se elimina el índice
    await queryInterface.removeIndex('reservationServices', 'uq_reservation_aditional_service');
    
    // Luego, se elimina la tabla
    await queryInterface.dropTable('reservationServices');
  }
};