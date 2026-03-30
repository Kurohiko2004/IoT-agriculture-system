// nơi lắng nghe gói tin ack (listening)

'use strict';
const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt.config');
const db = require('../models');
const eventBus = require('../utils/event-bus');


class MqttService {
    constructor() {
        this.client = null;
        this.callbacks = {}; // Lưu các hàm callback theo ID để xác nhận
    }

    connect() {
        const url = `mqtt://${mqttConfig.host}:${mqttConfig.port}`;
        this.client = mqtt.connect(url, mqttConfig.options);

        // Dùng arrow function để giữ ngữ cảnh 'this'
        this.client.on('connect', () => {
            console.log('MQTT Connected');
            this.client.subscribe([mqttConfig.topics.data, mqttConfig.topics.ack]);
        });

        // Dùng arrow function để giữ ngữ cảnh 'this'
        this.client.on('message', async (topic, message) => {
            const payload = message.toString();
            
            try {
                if (topic === mqttConfig.topics.data) {
                    await this.handleSensorData(payload);
                } 
                
                if (topic === mqttConfig.topics.ack) {
                    this.handleAck(payload);
                }
            } catch (error) {
                console.error('❌ Error processing MQTT message:', error);
            }
        });
    }

    async handleSensorData(payload) {
        let data;

        try {
            data = JSON.parse(payload.toString());
        } catch (err) {
            console.error('❌ JSON Parse Error');
            console.error('Payload:', payload.toString());
            console.error(err);
            return;
        }

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

            if (records.length > 0) {
                await db.SensorData.bulkCreate(records);
                console.log('💾 DB Insert Success');
                // console.log('💾 DB Insert Success:', records);

            }
            

        } catch (err) {
            console.error('❌ Database Error');
            console.error('Records:', records);
            console.error(err.message);
            console.error(err);
        }
    }

    // Khi ESP32 gửi tin nhắn xác nhận về
    handleAck(payload) {
        try {
            const data = JSON.parse(payload);
            // Gói tin chuẩn ESP32 gửi lên: { actionId, deviceId, status }
            
            // HÉT LÊN LOA NỘI BỘ, KHÔNG ĐỤNG DATABASE Ở ĐÂY
            eventBus.emit('MQTT_ACK_RECEIVED', data); 
            
        } catch (e) {
            console.error('❌ Lỗi xử lý JSON ACK:', e.message);
        }
    }

    publishControl(topic, payloadObj) {
        if (this.client && this.client.connected) {
            this.client.publish(topic, JSON.stringify(payloadObj));
            console.log(`[MQTT PUB] Đã gửi lệnh:`, payloadObj);
        } else {
            console.error('❌ MQTT chưa kết nối!');
        }
    }
}

module.exports = new MqttService();