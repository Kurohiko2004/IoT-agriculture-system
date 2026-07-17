const {redisClient} = require('../config/redis.config');

const DEFAULT_TTL = parseInt(process.env.REDIS_CACHE_TTL) || 300; // Mặc định 5 phút

const redisService = {
    // Đảm bảo client đã kết nối
    connect: async () => {
        try {
            if (!redisClient.isOpen) {
                await redisClient.connect();
                console.log('🔌 Đã kết nối tới Redis thành công.');
            }
        } catch (err) {
            console.error('❌ Không thể kết nối tới Redis:', err.message);
        }
    },

    // Ngắt kết nối
    disconnect: async () => {
        if (redisClient.isOpen) {
            await redisClient.disconnect();
        }
    },

    // Lấy dữ liệu từ Cache và tự động parse JSON
    get: async (key) => {
        try {
            await redisService.connect(); // 🌟 Đảm bảo đã kết nối trước khi GET
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`❌ Lỗi Redis GET key "${key}":`, error);
            return null;
        }
    },

    // Lưu dữ liệu vào Cache dưới dạng chuỗi JSON
    set: async (key, value, ttl = DEFAULT_TTL) => {
        try {
            await redisService.connect(); // 🌟 Đảm bảo đã kết nối trước khi SET
            const stringValue = JSON.stringify(value);
            
            if (ttl) {
                // Với redis v4, cấu trúc EX vẫn giữ nguyên
                await redisClient.set(key, stringValue, {
                    EX: ttl
                });
            } else {
                await redisClient.set(key, stringValue);
            }
            return true;
        } catch (error) {
            console.error(`❌ Lỗi Redis SET key "${key}":`, error);
            return false;
        }
    },

    // Xóa Cache theo key
    del: async (key) => {
        try {
            await redisService.connect(); // 🌟 Đảm bảo đã kết nối trước khi DEL
            await redisClient.del(key);
            return true;
        } catch (error) {
            console.error(`❌ Lỗi Redis DEL key "${key}":`, error);
            return false;
        }
    },

    // Thêm phần tử vào danh sách (List)
    rPush: async (key, value) => {
        try {
            await redisService.connect();
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            return await redisClient.rPush(key, stringValue);
        } catch (error) {
            console.error(`❌ Lỗi Redis rPush key "${key}":`, error);
            return null;
        }
    },

    // Lấy toàn bộ danh sách (List)
    lRange: async (key, start = 0, stop = -1) => {
        try {
            await redisService.connect();
            const data = await redisClient.lRange(key, start, stop);
            return data ? data.map(item => JSON.parse(item)) : [];
        } catch (error) {
            console.error(`❌ Lỗi Redis lRange key "${key}":`, error);
            return [];
        }
    },

    // Kiểm tra Key tồn tại
    exists: async (key) => {
        try {
            await redisService.connect();
            const result = await redisClient.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`❌ Lỗi Redis exists key "${key}":`, error);
            return false;
        }
    },

    // Đổi tên Key
    rename: async (oldKey, newKey) => {
        try {
            await redisService.connect();
            await redisClient.rename(oldKey, newKey);
            return true;
        } catch (error) {
            console.error(`❌ Lỗi Redis rename từ "${oldKey}" sang "${newKey}":`, error);
            return false;
        }
    }
};

module.exports = redisService;