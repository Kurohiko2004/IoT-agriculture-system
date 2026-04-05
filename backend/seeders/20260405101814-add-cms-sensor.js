'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Sensors', [
      {
        id: 3, // ID này phải khớp với sensorId bạn dùng trong mqtt.service.js
        name: 'CMS (Capacitive Soil Moisture)',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {
      // Nếu ID 4 đã tồn tại, nó sẽ cập nhật lại tên thay vì báo lỗi
      updateOnDuplicate: ['name', 'updatedAt']
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Xóa cảm biến CMS nếu muốn rollback
     */
    return queryInterface.bulkDelete('Sensors', { id: 4 }, {});
  }
};