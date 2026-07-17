'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Lấy danh sách ID các cảm biến hiện có để tránh lỗi khóa ngoại (Foreign Key)
    let sensors = await queryInterface.sequelize.query(
      'SELECT id FROM Sensors;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Nếu chưa có cảm biến nào, tự động thêm các cảm biến mẫu
    if (!sensors || sensors.length === 0) {
      await queryInterface.bulkInsert('Sensors', [
        { id: 1, name: 'DHT11', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'LM393', createdAt: new Date(), updatedAt: new Date() },
        { id: 3, name: 'CMS (Capacitive Soil Moisture)', createdAt: new Date(), updatedAt: new Date() }
      ], {});
      
      sensors = await queryInterface.sequelize.query(
        'SELECT id FROM Sensors;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
    }

    const sensorIds = sensors.map(s => s.id);
    const types = ['temperature', 'humidity', 'light', 'moisture'];
    
    const totalRecords = 50000;
    const chunkSize = 5000; // Chia nhỏ thành nhiều lần insert để tối ưu hóa bộ nhớ
    
    console.log(`🚀 Bắt đầu tạo ${totalRecords} bản ghi SensorData...`);

    for (let i = 0; i < totalRecords; i += chunkSize) {
      const chunk = [];
      for (let j = 0; j < chunkSize; j++) {
        const type = types[Math.floor(Math.random() * types.length)];
        let value = 0;
        let sensorId = sensorIds[0]; // Mặc định dùng cảm biến đầu tiên

        // Tạo giá trị ngẫu nhiên thực tế theo từng loại cảm biến
        if (type === 'temperature') {
          value = parseFloat((Math.random() * 15 + 20).toFixed(2)); // 20 - 35 °C
          // Chọn cảm biến DHT11 (thường là ID đầu tiên hoặc bất kỳ cảm biến nào chứa tên DHT)
          sensorId = sensorIds.find(id => id === 1) || sensorIds[0];
        } else if (type === 'humidity') {
          value = parseFloat((Math.random() * 40 + 50).toFixed(2)); // 50 - 90 %
          sensorId = sensorIds.find(id => id === 1) || sensorIds[0];
        } else if (type === 'light') {
          value = parseFloat((Math.random() * 900 + 100).toFixed(2)); // 100 - 1000 Lux
          sensorId = sensorIds.find(id => id === 2) || sensorIds[1] || sensorIds[0];
        } else if (type === 'moisture') {
          value = parseFloat((Math.random() * 50 + 30).toFixed(2)); // 30 - 80 %
          sensorId = sensorIds.find(id => id === 3) || sensorIds[2] || sensorIds[0];
        }

        // Phân bổ thời gian ngẫu nhiên trong vòng 30 ngày qua
        const timeOffset = Math.random() * 30 * 24 * 60 * 60 * 1000;
        const measuredAt = new Date(Date.now() - timeOffset);

        chunk.push({
          value,
          type,
          sensorId,
          measuredAt,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      await queryInterface.bulkInsert('SensorData', chunk, {});
      console.log(`Đã chèn xong chunk ${i + chunkSize}/${totalRecords}`);
    }
    
    console.log('✅ Đã tạo thành công 50,000 bản ghi SensorData.');
  },

  async down(queryInterface, Sequelize) {
    // Xóa tất cả dữ liệu SensorData để dọn dẹp
    await queryInterface.bulkDelete('SensorData', null, {});
    console.log('🗑️ Đã xóa sạch dữ liệu trong bảng SensorData.');
  }
};
