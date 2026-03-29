const eventBus = require('../utils/event-bus');
const db = require('../models');
const timeoutService = require('./timeout.service');
// const { getIo } = require('./socket.service'); // Dùng cho WebSocket

// Đứng nghe loa phát thanh liên tục
eventBus.on('MQTT_ACK_RECEIVED', async (payload) => {
    try {
        const { actionId, deviceId, status } = payload; 

        const record = await db.Action.findByPk(actionId);

        if (record && record.status === 'PENDING') {
            // 1. Ghi nhận thành công vào DB Action
            await record.update({ status: status || 'SUCCESS' });

            // 2. Cập nhật trạng thái Device (ON/OFF)
            const finalDeviceStatus = (record.action === 'TURN_ON') ? 'ON' : 'OFF';
            await db.Device.update(
                { status: finalDeviceStatus },
                { where: { id: deviceId } }
            );

            // 3. TUYỆT CHIÊU: Hủy bộ đếm 10s ngay lập tức
            timeoutService.clearActionTimeout(actionId);

            // 4. Báo tin vui cho Frontend
            // const io = getIo();
            // io.emit('device_action_result', { actionId, deviceId, status: finalDeviceStatus });

            console.log(`[HAPPY CASE] Lệnh ${actionId} khớp lệnh và cập nhật thành công!`);
        }
    } catch (error) {
        console.error('[ACTION HANDLER LỖI]', error);
    }
});