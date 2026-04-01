'use strict';
const {
  Model, Op
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

    /**
     * Retrieves all sensor data with pagination, filtering, searching, and sorting.
     */
    static async findAllData({ limit, offset, type, search, sortBy, sortOrder }) {
        const whereConditions = {};

        if (type) whereConditions.type = type;

        if (search) {
            whereConditions[Op.or] = [
                { type: { [Op.like]: `%${search}%` } },
                sequelize.where(
                    sequelize.cast(sequelize.col('measuredAt'), 'CHAR'),
                    { [Op.like]: `%${search}%` }
                )
            ];
        }

        return await this.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            order: [[sortBy, sortOrder]],
            include: [{ 
              association: 'sensor', 
              attributes: ['name'] 
            }]
        });
    }

// models/sensordata.js

    static async getLatestSensorData() {
        // 1. Lấy 50 bản ghi gần nhất để vẽ Chart
        const rawData = await this.findAll({
            attributes: ['type', 'value', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        if (!rawData || rawData.length === 0) {
            return {
                latest: { temperature: 0, humidity: 0, lux: 0 },
                history: [],
                lastUpdate: null
            };
        }

        // 2. Logic lọc lấy giá trị mới nhất cho 3 thẻ Cards
        const latestMap = {};
        rawData.forEach(item => {
            if (!latestMap[item.type]) {
                latestMap[item.type] = item.value;
            }
        });

        // 3. Đóng gói dữ liệu trả về
        return {
            latest: {
                temperature: latestMap['temperature'] || 0,
                humidity: latestMap['humidity'] || 0,
                lux: latestMap['light'] || 0 // Khớp với type 'light' trong mqtt.service
            },
            // Đảo ngược mảng để Chart chạy từ Cũ -> Mới
            history: [...rawData].reverse(), 
            lastUpdate: rawData[0].createdAt
        };
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
