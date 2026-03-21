'use strict';
const sensorDataService = require('../services/sensor-data.service.js');
const { getPagination, getPagingData } = require('../utils/pagination.util');
const asyncHandler = require('../utils/async-handler.util');


const getAllSensorData = asyncHandler(async (req, res) => {
    const { page, items, type, sortBy, sortOrder, search } = req.query;

    const { limit, offset, currentPage } = getPagination(page, items);

    console.log("Dữ liệu sau Validation:", { sortBy, sortOrder });

    const dbResult = await sensorDataService.findAllSensorData({
        limit, offset, type, search, sortBy, sortOrder
    });

    return res.status(200).json(getPagingData(dbResult, currentPage, limit));
}); 

module.exports = { getAllSensorData };


// const getAllSensorData = async (req, res, next) => {
//     try {
//         // 1. Dữ liệu đã sạch nhờ Joi Middleware trước đó
//         const { page, items, type, sortBy, sortOrder, search } = req.query;

//         // 2. Tính toán thông số phân trang
//         const { limit, offset, currentPage } = getPagination(page, items);

//         // 3. Gọi Service để lấy dữ liệu (Controller không quan tâm DB query thế nào)
//         const dbResult = await sensorService.findAllSensorData({
//             limit, offset, type, search, sortBy, sortOrder
//         });

//         // 4. Format và trả về response
//         const response = getPagingData(dbResult, currentPage, limit);
//         return res.status(200).json(response);

//     } catch (error) {
//         next(error); // Đẩy lỗi cho Error Middleware xử lý
//     }
// };