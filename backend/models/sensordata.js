'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SensorData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Sensor, {
        foreignKey: `sensorId`,
        as: `sensor`
      })
    }
  }
  SensorData.init({
    value: {
      type: DataTypes.FLOAT, 
      allowNull: false
    },
    measuredAt: {
      type: DataTypes.DATE, 
      allowNull: false,
      validate: {
        notNull: { msg: "measuredAt is required" },
        isDate: true
      },
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    type: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    sensorId: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      validate: {
        notNull: { msg: "A record of sensor data must be linked to a sensorId" }
      }
    }
  }, {
    sequelize,
    modelName: 'SensorData',
  });
  return SensorData;
};
