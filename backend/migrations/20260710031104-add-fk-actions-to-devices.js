'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('actions', {
      fields: ['deviceId'],
      type: 'foreign key',
      name: 'fk_actions_devices', // Tên ràng buộc
      references: {
        table: 'devices', // Tên bảng đích
        field: 'id'       // Cột đích
      },
      onDelete: 'CASCADE', // Nếu xóa thiết bị, các hành động liên quan sẽ bị xóa theo
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('actions', 'fk_actions_devices');
  }
};