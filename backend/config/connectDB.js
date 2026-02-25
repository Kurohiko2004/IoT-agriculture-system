require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    null, {
        host: process.env.DB_HOST,
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