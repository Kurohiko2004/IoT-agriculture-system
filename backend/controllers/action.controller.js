'use strict';
const db = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination.util');
const asyncHandler = require('../utils/async-handler.util');

const getAction = asyncHandler(async (req, res) => {
    const { page, items, status, sortBy, sortOrder, search } = req.query;

    const { limit, offset, currentPage } = getPagination(page, items);

    // Gọi trực tiếp Model method (Fat Model)
    const dbResult = await db.Action.findAllAction({
        limit, offset, status, search, sortBy, sortOrder
    });

    // Trả về response theo format chuẩn của dự án
    return res.status(200).json(
        getPagingData(dbResult, currentPage, limit)
    );
});

module.exports = { getAction };
