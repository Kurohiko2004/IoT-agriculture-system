require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD,
    {
        // host: process.env.DB_HOST,
        host: '127.0.0.1',
        dialect: 'mysql',
});

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(' Kết nối CSDL thành công.');
    } catch (error) {
        console.error(' Không thể kết nối tới CSDL:', error);
    }
};

module.exports = connectDB;