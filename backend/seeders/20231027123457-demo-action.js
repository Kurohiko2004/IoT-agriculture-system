'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Actions', [
      {
        action: 'TURN_ON',
        status: 'SUCCESS',
        interactedAt: new Date(),
        deviceId: 1, // Make sure device with ID 1 exists
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        action: 'TURN_OFF',
        status: 'FAILED',
        interactedAt: new Date(new Date() - 1000 * 60 * 60), // 1 hour ago
        deviceId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        action: 'TURN_ON',
        status: 'PENDING',
        interactedAt: new Date(new Date() - 1000 * 60 * 60 * 24), // 1 day ago
        deviceId: 2, // Make sure device with ID 2 exists
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete('Actions', null, {});
  }
};
