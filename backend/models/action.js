'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Action extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Device, {
        foreignKey: `deviceId`,
        as: `device`
      });
    }
  }
  Action.init({
    action: {
      type: DataTypes.STRING,
      // type: DataTypes.ENUM('TURN_ON', 'TURN_OFF'),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      // type: DataTypes.ENUM('success', 'failed'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    interactedAt: {
      type: DataTypes.DATE, 
      allowNull: false,
      validate: {
        notNull: { msg: "interactedAt is required" },
        isDate: true
      },
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // No need for 'references' here if the associate block handles it,
      // but it doesn't hurt to have it for clarity.
    },
  }, {
    sequelize,
    modelName: 'Action',
  });
  return Action;
};