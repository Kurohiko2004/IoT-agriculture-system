const eventBus = require('../utils/event-bus');
const db = require('../models');
const timeoutService = require('./timeout.service');
const { emitDeviceUpdate } = require('./socket.service'); // Dùng cho WebSocket

// Đứng nghe loa phát thanh liên tục
eventBus.on('MQTT_ACK_RECEIVED', async (payload) => {
    const t = await db.sequelize.transaction();

    try {
        const { actionId, deviceId, status } = payload; 
        const record = await db.Action.findByPk(actionId, { transaction: t });

        // integrity validation
        if (!record || 
            record.status !== 'PENDING' ||
            Number(record.deviceId) !== Number(deviceId)) 
            {
                console.log("Lỗi dữ liệu không khớp trong bảng action");
                await t.rollback(); 
                return;
        }

        // 1.1. validate action.status, chỉ nhận SUCCESS, còn lại coi là FAILED
        const isSuccess = (status === 'SUCCESS');
        const finalActionStatus = isSuccess ? 'SUCCESS' : 'FAILED';
        // 1.2. Cập nhật action.status trong db
        await record.update(
            { status: finalActionStatus }, 
            { transaction: t }
        );

        // 2. Nếu action.status == SUCCESS thì cập nhật device.status (ON/OFF)
        if (isSuccess) {
            const finalDeviceStatus = (record.action === 'TURN_ON') ? 'ON' : 'OFF';
            await db.Device.update(
                { status: finalDeviceStatus },
                { where: { id: deviceId }, transaction: t }
            );
            console.log(`[HAPPY CASE-1] Lệnh ${actionId} khớp lệnh và cập nhật thành công!`);
        }
        
        // lưu dữ liệu, sau đó mới thực hiện các task không liên quan db
        await t.commit();

        // 3. Hủy bộ đếm 10s, bất kể esp32 trả về status = SUCCESS hay FAILED
        timeoutService.clearActionTimeout(actionId);

        // 4. Bắn tin qua socket cho FE
        emitDeviceUpdate({
            actionId: actionId,
            deviceId: deviceId,
            status: finalActionStatus,
            action: record.action,
            deviceStatus: isSuccess ? (record.action === 'TURN_ON' ? 'ON' : 'OFF') : null,
            message: isSuccess ? 'Thực hiện lệnh thành công' : 'Thiết bị phản hồi lỗi'
        });

        console.log(`[HAPPY CASE-2] Hoàn thành transaction`);
    } catch (error) {
        // Nếu CÓ BẤT KỲ LỖI NÀO ở bước 1 hoặc 2 -> Hủy toàn bộ thay đổi
        if (t) {
            await t.rollback();
        }
        console.error('[ACTION HANDLER LỖI]', error);
    }
});