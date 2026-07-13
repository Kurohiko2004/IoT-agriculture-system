'use strict';

const eventBus = require('../utils/event-bus');
const db = require('../models');
const { emitDeviceUpdate, emitSensorData } = require('./socket.service');

const activeTimeouts = new Map(); // Sổ tay lưu các bộ đếm đang chạy

// TODO: move startActionTimeout to controller? 

const startActionTimeout = (actionId, deviceId, delayMs) => {
    // 1. Nếu đã có bộ đếm cũ cho action này (đề phòng bấm nút quá nhanh), hãy dập nó đi
    if (activeTimeouts.has(actionId)) {
        clearTimeout(activeTimeouts.get(actionId));
    }

    const timer = setTimeout(async () => {
        try {
            // 2. Kiểm tra trong DB xem action.status có còn là PENDING ko
            const record = await db.Action.findByPk(actionId);

            if (record && record.status === 'PENDING') {
                // 3. Update status 
                await record.update(
                    { status: 'TIMEOUT' }
                );

                // 4. Bắn thông báo về FE qua WebSocket
                emitDeviceUpdate({
                    actionId: actionId,
                    deviceId: deviceId,
                    status: 'TIMEOUT',
                    action: record.action,
                    message: `Hết thời gian chờ (${delayMs / 1000}s), thiết bị không phản hồi!`
                });

                console.log(`[TIMEOUT] Lệnh ${actionId} thất bại sau ${delayMs / 1000}s`);
            }
        } catch (error) {
            console.error(`[LỖI TIMEOUT]`, error);
        } finally {
            activeTimeouts.delete(actionId); // Chạy xong thì xóa khỏi sổ tay
        }
    }, delayMs);

    activeTimeouts.set(actionId, timer); // Ghi chú bộ đếm này vào sổ
};

const clearActionTimeout = (actionId) => {
    if (activeTimeouts.has(actionId)) {
        // clearTimeout và xóa khỏi map
        clearTimeout(activeTimeouts.get(actionId)); // Dập tắt bộ đếm ngay!
        activeTimeouts.delete(actionId);
        console.log(`[HỦY TIMEOUT] Đã dập bộ đếm cho lệnh ${actionId} vì nhận ACK sớm`);
    }
};

eventBus.on('MQTT_DATA_RECEIVED', async (data) => {
    const records = [];
    try {
        if (data.temp !== undefined) {
            records.push({ value: data.temp, type: 'temperature', sensorId: 1 });
        }
        if (data.humidity !== undefined) {
            records.push({ value: data.humidity, type: 'humidity', sensorId: 1 });
        }
        if (data.lux !== undefined) {
            records.push({ value: data.lux, type: 'light', sensorId: 2 });
        }
        if (data.moisture !== undefined) {
            records.push({ value: data.moisture, type: 'moisture', sensorId: 3 });
        }

        if (records.length > 0) {
            // 1. Lưu vào Database
            await db.SensorData.bulkCreate(records);

            // 2. Bắn qua Socket (Hiển thị thời gian thực cho Dashboard)
            emitSensorData({
                temperature: data.temp,
                humidity: data.humidity,
                lux: data.lux,
                moisture: data.moisture,
                createdAt: new Date()
            });
            console.log(`💾 DB & Socket: Đã xử lý ${records.length} chỉ số cảm biến từ EventBus.`);
        }
    } catch (err) {
        console.error('❌ Lỗi xử lý dữ liệu cảm biến trong SensorHandler:', err.message);
    }
});

eventBus.on('MQTT_ACK_RECEIVED', async (payload) => {
    const t = await db.sequelize.transaction();

    try {
        const { actionId, deviceId, status } = payload;
        const record = await db.Action.findByPk(actionId, { transaction: t });

        // integrity validation
        if (!record || record.status !== 'PENDING' || Number(record.deviceId) !== Number(deviceId)) {
            console.log("Lỗi dữ liệu không khớp trong bảng action");
            await t.rollback();
            return;
        }


        // TODO: change save logic here, too messy (finalActionStatus = isSuccess)
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
        clearActionTimeout(actionId);

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
        if (t) {
            await t.rollback();
        }
        console.error('[ACTION HANDLER LỖI]', error);
    }
});

module.exports = {
    startActionTimeout,
    clearActionTimeout
};
