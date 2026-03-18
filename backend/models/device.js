'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Action, { 
        foreignKey: 'deviceId',
        as: 'actions' // This lets you use device.actions in your code
      });
    }
  }
  Device.init({
    name: DataTypes.STRING,
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Device',
  });
  return Device;
};