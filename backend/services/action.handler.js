const eventBus = require('../utils/event-bus');
const db = require('../models');
const timeoutService = require('./timeout.service');
const { emitDeviceUpdate } = require('./socket.service'); // Dùng cho WebSocket

// Đứng nghe loa phát thanh liên tục
eventBus.on('MQTT_ACK_RECEIVED', async (payload) => {
    try {
        const { actionId, deviceId, status } = payload; 
        const record = await db.Action.findByPk(actionId);

        //TODO: thêm validate status

        if (record && 
            record.status === 'PENDING' && 
            Number(record.deviceId) === Number(deviceId)) {
            // 1. Update DB tại bảng Action
            await record.update({ status: status});

            // 2. Nếu status == SUCCESS thì cập nhật trạng thái Device (ON/OFF)
            if (status === 'SUCCESS') {
                // 
                const finalDeviceStatus = (record.action === 'TURN_ON') ? 'ON' : 'OFF';
                await db.Device.update(
                    { status: finalDeviceStatus },
                    { where: { id: deviceId } }
                );
    
                console.log(`[HAPPY CASE] Lệnh ${actionId} khớp lệnh và cập nhật thành công!`);
            }

            // 3. Hủy bộ đếm 10s, bất kể esp32 trả về status = SUCCESS hay FAILED
            timeoutService.clearActionTimeout(actionId);
s
            // 4. Bắn tin qua socket cho FE
            emitDeviceUpdate({
                actionId: actionId,
                deviceId: deviceId,
                status: status,
                action: record.action,
                message: status === 'SUCCESS' ? 'Thực hiện lệnh thành công' : 'Thiết bị phản hồi lỗi'
            });
        }
    } catch (error) {
        console.error('[ACTION HANDLER LỖI]', error);
    }
});