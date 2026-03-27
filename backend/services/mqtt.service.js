'use strict';
const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt.config');
const db = require('../models');

const INTERVAL = 10000;

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
            console.log('✅ MQTT Connected');
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

    // Hàm xử lý dữ liệu sensor gửi lên
    // services/mqtt.service.js
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
            const { actionId, status } = JSON.parse(payload);
            if (this.callbacks[actionId]) {
                // Gọi hàm callback để giải phóng Promise đang đợi ở API
                this.callbacks[actionId](status); 
                delete this.callbacks[actionId]; // Xóa sau khi dùng xong
            }
        } catch (e) {
            console.error('❌ Lỗi xử lý ACK:', e.message);
        }
    }

    // Hàm gửi lệnh và đợi xác nhận trong 10s
    sendCommandWithTimeout(actionId, message, timeout = INTERVAL) {
        return new Promise((resolve, reject) => {
            // Thiết lập Timer
            const timer = setTimeout(() => {
                if (this.callbacks[actionId]) {
                    delete this.callbacks[actionId];
                    reject(new Error('TIMEOUT_NO_RESPONSE'));
                }
            }, timeout);

            // Thiết lập callback
            this.callbacks[actionId] = (status) => {
                clearTimeout(timer);
                resolve(status);
            };

            // Gửi lệnh
            this.client.publish(mqttConfig.topics.device, JSON.stringify({ actionId, ...message }));
        });
    }
}

module.exports = new MqttService();