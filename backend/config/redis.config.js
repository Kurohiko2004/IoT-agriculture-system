require('dotenv').config();
const { createClient } = require('redis');
DEFAULT_EXPIRATION = 3600
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('🔄 Đang kết nối tới Redis...');
});

redisClient.on('ready', () => {
    console.log('✅ Kết nối Redis thành công.');
});

module.exports = {redisClient, DEFAULT_EXPIRATION};