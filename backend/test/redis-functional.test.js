/**
 * TEST KỊCH BẢN CHỨC NĂNG (FUNCTIONAL TEST)
 * Đường dẫn: /backend/test/redis-functional.test.js
 * 
 * Kiểm tra luồng xử lý:
 * 1. Lần đầu truy cập -> Cache Miss -> Truy vấn MySQL -> Lưu Cache.
 * 2. Lần thứ hai truy cập -> Cache Hit -> Lấy từ Redis -> Không gọi MySQL.
 */

const db = require('../models');
const redisService = require('../services/redis.service');
const assert = require('assert');

// Hàm mô phỏng việc lấy dữ liệu có tích hợp Cache Redis
async function getLatestSensorDataCached() {
    const cacheKey = 'sensor:latest_data';

    // 1. Kiểm tra Redis trước
    const cachedData = await redisService.get(cacheKey);
    if (cachedData) {
        return {
            source: 'Redis (Cache Hit)',
            data: cachedData
        };
    }

    // 2. Cache Miss -> Truy vấn Database (MySQL) sau
    const dbData = await db.SensorData.getLatestSensorData();

    // 3. Lưu dữ liệu vừa lấy được vào Redis với TTL là 10 giây (phục vụ test)
    await redisService.set(cacheKey, dbData, 10);

    return {
        source: 'MySQL (Cache Miss)',
        data: dbData
    };
}

async function runFunctionalTest() {
    console.log('==================================================');
    console.log('🧪 Bắt đầu kiểm thử chức năng Caching Redis...');
    console.log('==================================================');

    try {
        // Khởi động kết nối
        await db.sequelize.authenticate();
        console.log('✔ Đã kết nối MySQL thành công.');
        await redisService.connect();
        console.log('✔ Đã kết nối Redis thành công.');

        const cacheKey = 'sensor:latest_data';
        
        // Bước 0: Đảm bảo Redis sạch trước khi test
        console.log('\n🧹 Bước 0: Xóa cache cũ...');
        await redisService.del(cacheKey);

        // Bước 1: Gọi lần 1 (Mong đợi Cache Miss -> MySQL)
        console.log('\n📡 Bước 1: Gửi yêu cầu lần đầu (Mong đợi Cache Miss)...');
        const start1 = Date.now();
        const result1 = await getLatestSensorDataCached();
        const duration1 = Date.now() - start1;

        console.log(`- Nguồn dữ liệu: ${result1.source}`);
        console.log(`- Thời gian xử lý: ${duration1} ms`);
        assert.strictEqual(result1.source, 'MySQL (Cache Miss)', 'Lỗi: Lần đầu tiên phải truy cập vào MySQL!');

        // Xác minh xem dữ liệu đã được lưu vào Redis chưa
        const checkRedis = await redisService.get(cacheKey);
        assert.ok(checkRedis, 'Lỗi: Dữ liệu chưa được lưu vào Redis sau khi Cache Miss!');
        console.log('✔ Xác nhận dữ liệu đã được ghi nhận vào Redis.');

        // Bước 2: Gọi lần 2 (Mong đợi Cache Hit -> Redis)
        console.log('\n📡 Bước 2: Gửi yêu cầu lần hai (Mong đợi Cache Hit)...');
        const start2 = Date.now();
        const result2 = await getLatestSensorDataCached();
        const duration2 = Date.now() - start2;

        console.log(`- Nguồn dữ liệu: ${result2.source}`);
        console.log(`- Thời gian xử lý: ${duration2} ms`);
        assert.strictEqual(result2.source, 'Redis (Cache Hit)', 'Lỗi: Lần thứ hai phải lấy dữ liệu từ Redis!');
        console.log('✔ Xác nhận lấy dữ liệu trực tiếp từ Redis thành công.');

        // So sánh tốc độ
        const speedUp = (duration1 / (duration2 || 1)).toFixed(1);
        console.log(`\n🎉 KẾT QUẢ: Tốc độ lấy từ Redis nhanh gấp ~${speedUp} lần so với MySQL.`);
        console.log('==================================================');
        console.log('✅ KIỂM THỬ CHỨC NĂNG THÀNH CÔNG!');
        console.log('==================================================');

    } catch (error) {
        console.error('\n❌ KIỂM THỬ THẤT BẠI:', error.message);
        process.exit(1);
    } finally {
        // Đóng các kết nối để giải phóng terminal
        await redisService.disconnect();
        await db.sequelize.close();
        console.log('🔌 Đã ngắt toàn bộ kết nối.');
    }
}

// Chạy test
runFunctionalTest();
