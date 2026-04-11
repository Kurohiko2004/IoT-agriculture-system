require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/connectDB')
const mqttService = require('./services/mqtt.service');
const http = require('http'); 
const socketService = require('./services/socket.service');
require('./services/action.handler');
const { cleanupPendingActions } = require('./services/startup.service');


const sensorDataRoutes = require('./routers/sensor-data.route')
const actionRoutes = require('./routers/action.route')
const deviceRoutes = require('./routers/device.route')
const errorHandler = require('./middlewares/error.middleware');

const app = express();
const server = http.createServer(app); // Tạo server từ app express
const port = process.env.PORT || 8081;

socketService.init(server);

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true  // nếu dùng cookie/session
}));
app.use(express.json());

app.use('/api/sensor-data', sensorDataRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/devices', deviceRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

connectDB();

server.listen(port, async () => {
    console.log(` Server đang chạy trên cổng ${port}`);
    mqttService.connect();
    try {
        await cleanupPendingActions();
        console.log('✅ Hoàn tất kiểm tra và dọn dẹp lệnh cũ.');
    } catch (error) {
        console.error('❌ Lỗi dọn dẹp khi khởi động:', error);
    }
});




