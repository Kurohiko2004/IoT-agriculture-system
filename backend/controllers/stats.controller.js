const db = require('../models');
const asyncHandler = require('../utils/async-handler.util');
const dayjs = require('dayjs');

/**
 * GET /api/stats/device-toggles?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Trả về số lần bật/tắt của mỗi thiết bị theo từng ngày.
 */
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

        // 1. Khởi tạo đối tượng thiết bị nếu chưa có trong map
        if (!deviceMap[deviceId]) {
            deviceMap[deviceId] = { deviceId, deviceName, stats: {} };
        }

        const deviceEntry = deviceMap[deviceId];

        // 2. Khởi tạo thống kê của ngày này nếu chưa có
        if (!deviceEntry.stats[date]) {
            deviceEntry.stats[date] = { date, TURN_ON: 0, TURN_OFF: 0 };
        }

        const dayStats = deviceEntry.stats[date];
        const countNumber = parseInt(count, 10);

        // 3. Gán số liệu vào đúng loại hành động (ON hoặc OFF)
        if (action === 'TURN_ON') {
            dayStats.TURN_ON = countNumber;
        } else if (action === 'TURN_OFF') {
            dayStats.TURN_OFF = countNumber;
        }
    }

    const result = Object.values(deviceMap).map((device) => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        stats: Object.values(device.stats).sort((a, b) => (a.date > b.date ? 1 : -1)),
    }));

    return res.status(200).json({ success: true, from, to, data: result });
});

module.exports = { getDeviceToggleStats };
