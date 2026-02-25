require('dotenv').config();
const express = require('express');
const db = require('./models')
const connectDB = require('./config/connectDB')

const app = express();
const port = process.env.PORT || 8081;

// app.use() cors, express.json(), routes

connectDB();

app.listen(port, async () => {
    console.log(` Server đang chạy trên cổng ${port}`);
});