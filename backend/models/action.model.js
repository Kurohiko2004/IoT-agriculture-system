'use strict';
const {
  Model, Op
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

    /**
     * Retrieves all actions with pagination, filtering, searching, and sorting.
     */
    static async findAllAction({ limit, offset, status, search, sortBy, sortOrder, deviceId }) {
      const whereConditions = {};

      if (status) whereConditions.status = status;
      if (deviceId) whereConditions.deviceId = deviceId;

      if (search) {
        whereConditions[Op.or] = [

          // action
          { action: { [Op.like]: `%${search}%` } },

          // status
          { status: { [Op.like]: `%${search}%` } },

          // interactedAt (convert UTC → VN time)
          sequelize.where(
            sequelize.fn(
              'CONVERT_TZ',
              sequelize.col('interactedAt'),
              '+00:00',
              '+07:00'
            ),
            { [Op.like]: `%${search}%` }
          ),

          // device name
          { '$device.name$': { [Op.like]: `%${search}%` } }
        ];
      }

      console.log(JSON.stringify(whereConditions, null, 2))
      console.log('search received:', JSON.stringify(search))

      return await this.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset) || 0,
        order: [[sortBy || 'interactedAt', sortOrder || 'DESC']],
        include: [{
          association: 'device',
          attributes: ['name']
        }]
      });
    }

    /**
     * Thống kê số lần bật/tắt (TURN_ON / TURN_OFF) của mỗi thiết bị theo ngày.
     * Chỉ tính các action có status = 'SUCCESS'.
     * Kết quả: [{ deviceId, deviceName, date, action, count }]
     *
     * @param {string} from - Ngày bắt đầu (YYYY-MM-DD, giờ VN)
     * @param {string} to   - Ngày kết thúc  (YYYY-MM-DD, giờ VN)
     */
    static async getToggleStats({ from, to }) {
      return await this.findAll({
        attributes: [
          'deviceId',
          // Ngày theo giờ VN (+07:00)
          [
            sequelize.fn('DATE', sequelize.fn('CONVERT_TZ', sequelize.col('interactedAt'), '+00:00', '+07:00')),
            'date',
          ],
          'action',
          [sequelize.fn('COUNT', sequelize.col('Action.id')), 'count'],
        ],
        where: {
          status: 'SUCCESS',
          action: { [Op.in]: ['TURN_ON', 'TURN_OFF'] },
          interactedAt: {
            [Op.between]: [
              // Convert từ giờ VN về UTC để so sánh đúng với cột interactedAt (UTC)
              sequelize.literal(`CONVERT_TZ('${from} 00:00:00', '+07:00', '+00:00')`),
              sequelize.literal(`CONVERT_TZ('${to} 23:59:59', '+07:00', '+00:00')`),
            ],
          },
        },
        include: [{ association: 'device', attributes: ['name'] }],
        group: [
          'deviceId',
          'date',
          'action',
          'device.id',   // Cần thiết cho MySQL ONLY_FULL_GROUP_BY
          'device.name',
        ],
        order: [['date', 'ASC'], ['deviceId', 'ASC']],
      });
    }
  }



  Action.init({
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
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
    },
  }, {
    sequelize,
    modelName: 'Action',
  });
  return Action;
};
