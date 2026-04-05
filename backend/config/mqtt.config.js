require('dotenv').config();

module.exports = {
    host: process.env.MQTT_HOST || 'localhost',
    port: process.env.MQTT_PORT || 1884,
    options: {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        clientId: `backend_${Math.random().toString(16).slice(2, 8)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    },
    topics: {
        data: 'home/room100/data',      // Dữ liệu sensor gửi lên
        control: 'home/room100/control',  // Server bắn lệnh xuống (ON/OFF)
        ack: 'home/room100/ack'         // ESP32 xác nhận đã làm xong
    }
};