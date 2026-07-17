'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('sensordata', {
      fields: ['sensorId'],
      type: 'foreign key',
      name: 'fk_sensordata_sensors', // Tên của constraint
      references: {
        table: 'sensors',
        field: 'id'
      },
      onDelete: 'CASCADE', // Nếu xóa sensor, dữ liệu đo đạc liên quan sẽ tự động bị xóa theo
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('sensordata', 'fk_sensordata_sensors');
  }
};