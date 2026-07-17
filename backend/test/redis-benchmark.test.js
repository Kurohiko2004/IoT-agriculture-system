/**
 * TEST HIỆU NĂNG & SO SÁNH (BENCHMARK TEST)
 * Đường dẫn: /backend/test/redis-benchmark.test.js
 * 
 * Mô phỏng nhiều truy cập đồng thời/tuần tự để so sánh:
 * 1. Tốc độ phản hồi và throughput trực tiếp từ MySQL.
 * 2. Tốc độ phản hồi và throughput từ Redis Cache.
 */

const db = require('../models');
const redisService = require('../services/redis.service');

async function runBenchmark() {
    console.log('==================================================');
    console.log('⚡ Bắt đầu chạy đo lường: MySQL vs Redis Caching...');
    console.log('==================================================');

    const ITERATIONS = 500; // Số lượng request giả lập tuần tự để test hiệu năng

    try {
        // Đảm bảo kết nối
        await db.sequelize.authenticate();
        await redisService.connect();
        
        console.log(`- Số lượt truy vấn kiểm thử: ${ITERATIONS} lần`);

        // ==========================================
        // 1. ĐO HIỆU NĂNG TRUY VẤN MYSQL TRỰC TIẾP
        // ==========================================
        console.log('\n⌛ 1. Đang đo lường truy vấn trực tiếp từ MySQL (Không Cache)...');
        const startMySQL = Date.now();
        
        for (let i = 0; i < ITERATIONS; i++) {
            await db.SensorData.getLatestSensorData();
        }
        
        const durationMySQL = Date.now() - startMySQL;
        const avgMySQL = (durationMySQL / ITERATIONS).toFixed(2);
        const rpsMySQL = ((ITERATIONS / durationMySQL) * 1000).toFixed(2);

        console.log(`✔ Hoàn thành.`);
        console.log(`  - Tổng thời gian: ${durationMySQL} ms`);
        console.log(`  - Độ trễ trung bình: ${avgMySQL} ms/request`);
        console.log(`  - Tốc độ xử lý (Throughput): ${rpsMySQL} requests/sec`);

        // ==========================================
        // 2. ĐO HIỆU NĂNG TRUY VẤN REDIS CACHE
        // ==========================================
        console.log('\n⌛ 2. Đang đo lường truy vấn từ Redis Cache...');
        
        // Đảm bảo đã có dữ liệu cache sẵn trước khi đo
        const dbData = await db.SensorData.getLatestSensorData();
        const cacheKey = 'sensor:latest_data_benchmark';
        await redisService.set(cacheKey, dbData, 300);

        const startRedis = Date.now();
        
        for (let i = 0; i < ITERATIONS; i++) {
            await redisService.get(cacheKey);
        }
        
        const durationRedis = Date.now() - startRedis;
        const avgRedis = (durationRedis / ITERATIONS).toFixed(2);
        const rpsRedis = ((ITERATIONS / durationRedis) * 1000).toFixed(2);

        console.log(`✔ Hoàn thành.`);
        console.log(`  - Tổng thời gian: ${durationRedis} ms`);
        console.log(`  - Độ trễ trung bình: ${avgRedis} ms/request`);
        console.log(`  - Tốc độ xử lý (Throughput): ${rpsRedis} requests/sec`);

        // ==========================================
        // 3. SO SÁNH KẾT QUẢ
        // ==========================================
        const speedUp = (durationMySQL / (durationRedis || 1)).toFixed(1);
        const efficiencyPercentage = (100 - (durationRedis / durationMySQL * 100)).toFixed(1);

        console.log('\n==================================================');
        console.log('📊 BÁO CÁO KẾT QUẢ SO SÁNH');
        console.log('==================================================');
        console.log(`🚀 Tốc độ truy xuất từ Redis Cache NHANH GẤP ~${speedUp} LẦN so với MySQL.`);
        console.log(`💡 Giảm tải áp lực đọc trực tiếp cho MySQL Database ~${efficiencyPercentage}%.`);
        console.log(`📉 Độ trễ trung bình giảm từ ${avgMySQL} ms xuống còn ${avgRedis} ms.`);
        console.log('==================================================');

    } catch (error) {
        console.error('❌ Lỗi xảy ra trong quá trình benchmark:', error);
    } finally {
        // Đóng các kết nối
        await redisService.disconnect();
        await db.sequelize.close();
        console.log('🔌 Đã ngắt toàn bộ kết nối.');
    }
}

runBenchmark();
