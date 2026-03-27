'use strict';
const db = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination.util');
const asyncHandler = require('../utils/async-handler.util');

const getAllSensorData = asyncHandler(async (req, res) => {
    const { page, items, type, sortBy, sortOrder, search } = req.query;

    const { limit, offset, currentPage } = getPagination(page, items);

    // console.log("Dữ liệu sau Validation:", { sortBy, sortOrder });

    const dbResult = await db.SensorData.findAllData({
        limit, offset, type, search, sortBy, sortOrder
    });

    return res.status(200).json(
        getPagingData(dbResult, currentPage, limit)
    );
}); 

module.exports = { getAllSensorData };
