const db = require('../models');
// const { getIo } = require('./socket.service'); // Bỏ comment khi bạn làm xong WebSocket

const activeTimeouts = new Map(); // Sổ tay lưu các bộ đếm đang chạy

const startActionTimeout = (actionId, deviceId, delayMs = 10000) => {
    const timer = setTimeout(async () => {
        try {
            const record = await db.Action.findByPk(actionId);

            if (record && record.status === 'PENDING') {
                // 1. Phán quyết lỗi
                await record.update({ status: 'TIMEOUT' });

                // 2. Bắn thông báo về FE qua WebSocket
                // const io = getIo();
                // io.emit('device_action_result', { actionId, deviceId, status: 'TIMEOUT' });

                console.log(`[TIMEOUT] Lệnh ${actionId} thất bại sau 10s`);
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
        clearTimeout(activeTimeouts.get(actionId)); // Dập tắt bộ đếm ngay!
        activeTimeouts.delete(actionId);
        console.log(`[HỦY TIMEOUT] Đã dập bộ đếm cho lệnh ${actionId} vì nhận ACK sớm`);
    }
};

module.exports = { startActionTimeout, clearActionTimeout };