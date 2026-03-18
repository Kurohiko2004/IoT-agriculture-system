'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SensorData', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      value: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      measuredAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      // foreign key
      sensorId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Sensors', 
          key: 'id'
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SensorData');
  }
};