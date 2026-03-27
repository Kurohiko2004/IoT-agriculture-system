const db = require('../models');
const Device = db.Device; // Đảm bảo gọi đúng tên Model đã khai báo trong db
const asyncHandler = require('../utils/async-handler.util');

// Lấy trạng thái hiện tại của toàn bộ thiết bị
const getDeviceStatuses = asyncHandler(async (req, res) => {
    const { status, name } = req.query;

    const dbResult = await db.Device.getCurrentStatuses({ status, name });

    return res.status(200).json({
        success: true,
        data: dbResult
    })

});

module.exports = {
    getDeviceStatuses
};