'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sensor extends Model {
    /**x
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.SensorData, {
        foreignKey: `sensorId`,
        as: `sensorDatas`
      })
    }
  }
  Sensor.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sensor',
  });
  return Sensor;
};