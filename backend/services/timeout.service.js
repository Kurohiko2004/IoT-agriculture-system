const db = require('../models');
const { emitDeviceUpdate } = require('./socket.service');

const activeTimeouts = new Map(); // Sổ tay lưu các bộ đếm đang chạy

const startActionTimeout = (actionId, deviceId, delayMs) => {
    // 1. Nếu đã có bộ đếm cũ cho action này (đề phòng bấm nút quá nhanh), hãy dập nó đi
    if (activeTimeouts.has(actionId)) {
        clearTimeout(activeTimeouts.get(actionId));
    }

    const timer = setTimeout(async () => {
        try {
            // 2. Kiểm tra trong DB xem action.status có còn là PENDING ko
            const record = await db.Action.findByPk(actionId);

            if (record && record.status === 'PENDING') {
                // 3. Update status 
                await record.update(
                    { status: 'TIMEOUT' }
                );

                // 4. Bắn thông báo về FE qua WebSocket
                emitDeviceUpdate({
                    actionId: actionId,
                    deviceId: deviceId,
                    status: 'TIMEOUT',
                    action: record.action,
                    message: `Hết thời gian chờ (${delayMs / 1000}s), thiết bị không phản hồi!`
                });

                console.log(`[TIMEOUT] Lệnh ${actionId} thất bại sau ${delayMs / 1000}s`);
            }
        } catch (error) {
            console.error(`[LỖI TIMEOUT]`, error);
        } finally {
            activeTimeouts.delete(actionId); // Chạy xong thì xóa khỏi sổ tay
        }
    }, delayMs);

    activeTimeouts.set(actionId, timer); // Ghi chú bộ đếm này vào sổ
};

const clearActionTimeout = (actionId) => {
    if (activeTimeouts.has(actionId)) {
        // clearTimeout và xóa khỏi map
        clearTimeout(activeTimeouts.get(actionId)); // Dập tắt bộ đếm ngay!
        activeTimeouts.delete(actionId);
        console.log(`[HỦY TIMEOUT] Đã dập bộ đếm cho lệnh ${actionId} vì nhận ACK sớm`);
    }
};

module.exports = { startActionTimeout, clearActionTimeout };