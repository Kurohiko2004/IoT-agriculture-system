// tiếp nhận thông tin, điều hướng đến hàm xử lý tương ứng dựa vào topic
'use strict';
const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt.config');
const db = require('../models');
const eventBus = require('../utils/event-bus');
const { emitSensorData } = require('./socket.service');


class MqttService {
    constructor() {
        this.client = null;
    }

    connect() {
        const url = `mqtt://${mqttConfig.host}:${mqttConfig.port}`;
        this.client = mqtt.connect(url, mqttConfig.options);

        // Dùng arrow function để giữ ngữ cảnh 'this'
        // 1. event kết nối thành công
        this.client.on('connect', () => {
            console.log('MQTT Connected');
            this.client.subscribe([mqttConfig.topics.data, mqttConfig.topics.ack], (err) => {
                if (!err) {
                    console.log(`📡 Subscribed to: ${mqttConfig.topics.data} & ${mqttConfig.topics.ack}`);
                }
            });
        });

        // 2. event nhận message, gọi hàm xử lý tương ứng với topic 
        // Dùng arrow function để giữ ngữ cảnh 'this'
        this.client.on('message', async (topic, message) => {
            // const payload = message.toString();
            const payloadString = message.toString();
            
            try {
                if (topic === mqttConfig.topics.data) {
                    await this.handleSensorData(payloadString);
                } 
                if (topic === mqttConfig.topics.ack) {
                    this.handleAck(payloadString);
                }
            } catch (error) {
                console.error('❌ Error processing MQTT message:', error);
            }
        });

        // 3. event lỗi
        this.client.on('error', (err) => {
            console.error('❌ MQTT Connection Error:', err);
        });
    }

    async handleSensorData(payload) {
        let data;
        try {
            data = JSON.parse(payload);
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
                // 1. Lưu vào Database
                await db.SensorData.bulkCreate(records);

                // 2. Bắn qua Socket (Hiển thị thời gian thực)
                // Gói tin gửi đi nên gọn gàng để FE dễ xử lý
                emitSensorData({
                    temperature: data.temp,
                    humidity: data.humidity,
                    lux: data.lux,
                    createdAt: new Date()
                });
                console.log(`💾 DB & Socket: Đã xử lý ${records.length} chỉ số cảm biến.`);
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
            
            // validate deviceId và actionId
            if (data.actionId && data.deviceId) {
                console.log(`📩 Received ACK for Action: ${data.actionId}`);
                
                // Phát tín hiệu để action.handler.js xử lý logic DB & Socket
                eventBus.emit('MQTT_ACK_RECEIVED', data); 
            } else {
                console.warn('⚠️ Gói tin ACK thiếu thông tin:', data);
            }
            
        } catch (e) {
            console.error('❌ Lỗi xử lý JSON ACK:', e.message);
        }
    }

    publishControl(topic, payloadObj) {
        if (this.client && this.client.connected) {
            // biến object payload thành string theo định dạng JSON để 
            // gửi đến esp32. Object để dễ code hơn, json string là để 
            // vận chuyển qua mạng
            this.client.publish(topic, JSON.stringify(payloadObj), { qos: 1 });
            console.log(`[MQTT PUB] Topic: ${topic} - Payload:`, payloadObj);
        } else {
            console.error('❌ MQTT chưa kết nối, không thể gửi lệnh!');
        }
    }
}

module.exports = new MqttService();