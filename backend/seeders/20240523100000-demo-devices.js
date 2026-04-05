'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Devices', [
      {
        name: 'cooling fan',
        status: 'OFF',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'misting system',
        status: 'OFF',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ventilation fan',
        status: 'OFF',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'water pump',
        status: 'OFF',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'light',
        status: 'OFF',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Devices', null, {});
  }
};
