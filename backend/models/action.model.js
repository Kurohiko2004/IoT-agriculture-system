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
    static async findAllAction({ limit, offset, status, search, sortBy, sortOrder }) {
        const whereConditions = {};

        if (status) whereConditions.status = status;

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
