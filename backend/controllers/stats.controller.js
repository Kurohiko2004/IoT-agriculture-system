const db = require('../models');
const asyncHandler = require('../utils/async-handler.util');
const dayjs = require('dayjs');

/**
 * GET /api/stats/device-toggles?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Trả về số lần bật/tắt của mỗi thiết bị theo từng ngày.
 */

// TODO: refactor to action.controller.js?

const getDeviceToggleStats = asyncHandler(async (req, res) => {
    // --- 1. Lấy và validate query params ---
    let { from, to } = req.query;

    // Mặc định: 7 ngày gần nhất (tính theo giờ VN)
    if (!to) to = dayjs().format('YYYY-MM-DD');
    if (!from) from = dayjs().subtract(6, 'day').format('YYYY-MM-DD');

    // Validate định dạng ngày
    if (!dayjs(from, 'YYYY-MM-DD', true).isValid() || !dayjs(to, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({
            success: false,
            message: 'Định dạng ngày không hợp lệ. Vui lòng dùng YYYY-MM-DD.',
        });
    }

    // Kiểm tra from phải nhỏ hơn hoặc bằng to
    if (dayjs(from).isAfter(dayjs(to))) {
        return res.status(400).json({
            success: false,
            message: '"from" phải nhỏ hơn hoặc bằng "to".',
        });
    }

    const rawRows = await db.Action.getToggleStats({ from, to });

    // Transform: gộp theo deviceId → { deviceId, deviceName, stats: [...] }
    const deviceMap = {};
    for (const row of rawRows) {
        const { deviceId, date, action, count } = row.dataValues;
        const deviceName = row.device?.name ?? `Device #${deviceId}`;

        // 1. Khởi tạo đối tượng thiết bị nếu chưa có trong deviceMap
        if (!deviceMap[deviceId]) {
            deviceMap[deviceId] = { deviceId, deviceName, stats: {} };
        }

        const deviceEntry = deviceMap[deviceId]; // device hiện tại

        // 2. Khởi tạo thống kê của ngày này nếu chưa có
        if (!deviceEntry.stats[date]) {
            deviceEntry.stats[date] = { date, TURN_ON: 0, TURN_OFF: 0 };
        }

        const dayStats = deviceEntry.stats[date]; // stat của ngày hiện tại
        const countNumber = parseInt(count, 10);

        // 3. Gán số liệu vào đúng loại hành động (ON hoặc OFF)
        if (action === 'TURN_ON') {
            dayStats.TURN_ON = countNumber;
        } else if (action === 'TURN_OFF') {
            dayStats.TURN_OFF = countNumber;
        }
    }

    // deviceMap: {
    //     1: {
    //         deviceId: 1,
    //         deviceName: 'Lamp',
    //         stats: {
    //             '2026-05-01': {
    //                 date: '2026-05-01',
    //                 TURN_ON: 5,
    //                 TURN_OFF: 3
    //             }
    //         }
    //     }
    // }

    const result = [];

    for (const deviceKey in deviceMap) {
        const device = deviceMap[deviceKey];

        const statsArray = [];

        // chuyển stats từ object sang array
        for (const dateKey in device.stats) {
            statsArray.push(device.stats[dateKey]);
        }

        // sort theo ngày
        statsArray.sort((a, b) => {
            if (a.date > b.date) return 1; // đẩy a xuống dưới
            if (a.date < b.date) return -1; // đẩy a lên trước
            return 0;
        });

        // push vào result
        result.push({
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            stats: statsArray
        });
    }


    // result = [
    //     {
    //         deviceId: 1,
    //         deviceName: 'Lamp',
    //         stats: [
    //             { date: '2026-05-01', TURN_ON: 5, TURN_OFF: 3 },
    //             { date: '2026-05-02', TURN_ON: 2, TURN_OFF: 1 }
    //         ]
    //     }
    // ]

    return res.status(200).json({ success: true, from, to, data: result });
});


module.exports = { getDeviceToggleStats };
