'use strict';

// TODO: remove demo-sensor, name should be type of sensor

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Sensors', [
      {
        name: 'DHT11',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'LM393',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Sensors', null, {});
  }
};
