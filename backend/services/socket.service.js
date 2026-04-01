const socketIo = require('socket.io');

let io;

const init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Trong thực tế nên để domain của ReactJS (ví dụ: http://localhost:3000)
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Một client đã kết nối: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log('❌ Client đã ngắt kết nối');
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io chưa được khởi tạo!');
    }
    return io;
};

// Hàm tiện ích để bắn tin nhắn cho nhanh
const emitDeviceUpdate = (data) => {
    if (io) {
        io.emit('device_status_update', data);
    }
};

const emitSensorData = (data) => {
    if (io) {
        io.emit('sensor_data_update', data);
    }
};

module.exports = { init, getIo, emitDeviceUpdate, emitSensorData };