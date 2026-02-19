const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    'database', 'username', 'password', {

});