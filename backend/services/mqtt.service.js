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
        this.client.on('message', async (topic, message) => {
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

        eventBus.emit('MQTT_DATA_RECEIVED', data);
    }

    // Khi ESP32 gửi tin nhắn xác nhận về
    handleAck(payload) {
        try {
            const data = JSON.parse(payload);

            if (data.actionId && data.deviceId) {
                console.log(`Received ACK for Action: ${data.actionId}`);
                eventBus.emit('MQTT_ACK_RECEIVED', data);
            } else {
                console.warn('Gói tin ACK thiếu thông tin:', data);
            }
        } catch (e) {
            console.error(' Lỗi xử lý JSON ACK:', e.message);
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