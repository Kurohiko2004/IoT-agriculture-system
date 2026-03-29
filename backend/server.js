require('dotenv').config();
const express = require('express');

const connectDB = require('./config/connectDB')
const mqttService = require('./services/mqtt.service');
require('./services/action.handler');

const sensorDataRoutes = require('./routers/sensor-data.route')
const actionRoutes = require('./routers/action.route')
const deviceRoutes = require('./routers/device.route')



const app = express();
const port = process.env.PORT || 8081;

// app.use() cors, express.json(), routes

app.use(express.json());
app.use('/api/sensor-data', sensorDataRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/devices', deviceRoutes);


connectDB();

app.listen(port, async () => {
    console.log(` Server đang chạy trên cổng ${port}`);
    mqttService.connect();
});




