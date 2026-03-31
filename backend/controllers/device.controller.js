const db = require('../models');
const asyncHandler = require('../utils/async-handler.util');
const mqttService = require('../services/mqtt.service');
const timeoutService = require('../services/timeout.service');
const mqttConfig = require('../config/mqtt.config');

const TIMEOUT_INTERVAL = 5000;

// Lấy trạng thái hiện tại của toàn bộ thiết bị
const getDeviceStatuses = asyncHandler(async (req, res) => {
    const { status, name } = req.query;

    const dbResult = await db.Device.getCurrentStatuses({ status, name });

    return res.status(200).json({
        success: true,
        data: dbResult
    })

});

    /*
    1. lấy deviceId, action ra khỏi req (params và body)
    2. validate device trong csdl, validate action qua joi (TURN_ON, TURN_OFF, ...)
    3. lưu vào bảng action, status = PENDING
    4. Nếu db lưu thành công, lấy actionId từ dbResult
    5. gửi response về FE (response cho req post)

    --- chạy ngầm (timeout-service):
    6. chuẩn bị payload để gửi cho esp32
    7. publish gói tin vào home/room100/devices (actionId, actionName, deviceId, deviceName)
    8. thiết lập timer
        8.1. check bảng action, 
        8.2. nếu tại bản ghi actionId vẫn là status=PENDING
            8.2.1. update bảng action: status=TIMEOUT
            8.2.2. bắn tin qua socket về FE (actionId, actionName, deivceId, err, fallbackStatus)
    
    --- chạy ngầm (happy-)
    1. event: nhận được msg ('message')
    2. nếu topic = home/room100/ack
    3. lấy actionId, actionName, deviceId, deviceName, status ra khỏi JSON
    4. validate payload.actionId trong csdl (record && record.status=PENDING), 
    validate payload.deviceId (record.deviceId == payload.deviceId); 
    validate payload.status (chưa biết qua gì). 
    5. Nếu payload.status=SUCCESS
            5.1. Thực hiện Transaction: 
                5.1.1. update bảng action: status=SUCCESS
                5.1.2. update bảng device: status=ON/OFF dựa theo actionName 
                (actionName nằm trong dbResult khi validate action)
            5.2. Hủy timer
            5.3. Bắn tin qua socket về FE((actionId, actionName, deivceId, status))
             
        */

const controlDevice = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; 

    // 1. Kiểm tra thiết bị có tồn tại
    const device = await db.Device.findByPk(id);
    if (!device) return res.status(404).json({ message: 'Thiết bị không tồn tại' });

    // 2. Tạo bản ghi PENDING trong DB
    const newAction = await db.Action.create({
        deviceId: id,
        deviceName: device.name,
        action: action,
        status: 'PENDING'
    });

    
    const actionId = newAction.id;

    // 3. Phản hồi HTTP 200 ngay lập tức cho Frontend
    res.status(200).json({
        success: true,
        actionId: actionId,
        message: "Lệnh đang được gửi đi..."
    });

    // 4. Bắn lệnh xuống Mạch ESP32
    const payloadObj = {
        actionId: actionId,
        deviceId: Number(id),
        // deviceName: device.name,
        action: action
    };
    mqttService.publishControl(mqttConfig.topics.control, payloadObj);
    
    // 5. Khởi động Timer 10s chạy ngầm
    timeoutService.startActionTimeout(actionId, id, TIMEOUT_INTERVAL);
});


module.exports = {
    getDeviceStatuses,
    controlDevice
};