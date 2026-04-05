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

    static async getCurrentStatuses({ status, name } = {}) {
      const whereConditions = {};

      // Hỗ trợ lọc theo trạng thái hoặc tên nếu Frontend cần truyền query params
      if (status) whereConditions.status = status;
      if (name) whereConditions.name = name;

      return await this.findAll({
          where: whereConditions,
          // Chỉ lấy các cột cần thiết cho Frontend, bỏ qua createdAt để nhẹ payload
          attributes: ['id', 'name', 'status', 'updatedAt'], 
          order: [['id', 'ASC']] // Sắp xếp theo ID để hiển thị UI không bị nhảy vị trí
      });
    }
  }


  Device.init({
    name: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'OFF'
    }
  }, {
    sequelize,
    modelName: 'Device',
  });
  return Device;
};