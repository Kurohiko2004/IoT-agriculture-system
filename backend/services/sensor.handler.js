'use strict';
const eventBus = require('../utils/event-bus');
const db = require('../models');
const { emitSensorData } = require('./socket.service');

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
