'use strict';
const db = require('../models');
const { Op } = require('sequelize');

const findAllActions = async ({ limit, offset, status, search, sortBy, sortOrder }) => {
    const whereConditions = {};

    if (status) whereConditions.status = status;

    if (search) {
        whereConditions[Op.or] = [
            { action: { [Op.like]: `%${search}%` } },
            // Tìm kiếm trong cột thời gian tương tự Sensor Data
            db.Sequelize.where(
                db.Sequelize.cast(db.Sequelize.col('interactedAt'), 'CHAR'),
                { [Op.like]: `%${search}%` }
            )
        ];
    }

    return await db.Action.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit) || 10,
        offset: parseInt(offset) || 0,
        order: [[sortBy || 'interactedAt', sortOrder || 'DESC']],
        include: [{ 
            model: db.Device, 
            as: 'device', 
            attributes: ['name', 'type'] 
        }]
    });
};

module.exports = { findAllActions };