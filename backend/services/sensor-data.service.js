const { SensorData, Sensor, Sequelize } = require('../models');
const { Op } = require('sequelize');

const findAllSensorData = async ({ limit, offset, type, search, sortBy, sortOrder }) => {
    const whereConditions = {};

    if (type) whereConditions.type = type;

    if (search) {
        whereConditions[Op.or] = [
            { type: { [Op.like]: `%${search}%` } },
            Sequelize.where(
                Sequelize.cast(Sequelize.col('measuredAt'), 'CHAR'),
                { [Op.like]: `%${search}%` }
            )
        ];
    }

//     console.log({ sortBy, sortOrder });
// console.log(Object.keys(SensorData.rawAttributes));

    // Trả về kết quả thô từ DB
    return await SensorData.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [{ model: Sensor, as: 'sensor', attributes: ['name'] }]
    });
};

module.exports = { findAllSensorData };