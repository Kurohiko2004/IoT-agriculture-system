'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Devices', 'type');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Devices', 'type', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
