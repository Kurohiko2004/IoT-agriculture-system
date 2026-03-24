'use strict';
const actionService = require('../services/action.service');
const { getPagination, getPagingData } = require('../utils/pagination.util');
const asyncHandler = require('../utils/async-handler.util');

const getActionHistory = asyncHandler(async (req, res) => {
    // Dữ liệu đã sạch 100% nhờ Joi Middleware
    const { page, items, status, sortBy, sortOrder, search } = req.query;

    const { limit, offset, currentPage } = getPagination(page, items);

    const dbResult = await actionService.findAllActions({
        limit, offset, status, search, sortBy, sortOrder
    });

    // Trả về response theo format chuẩn của dự án
    return res.status(200).json(getPagingData(dbResult, currentPage, limit));
});

module.exports = { getActionHistory };