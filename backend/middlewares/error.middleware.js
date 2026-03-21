'use strict';

const errorHandler = (err, req, res, next) => {
    console.error(`[Error Log]: ${err.stack}`); // Log lỗi ra console để debug

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return res.status(statusCode).json({
        success: false,
        message: message,
        // Chỉ hiện stack trace khi đang ở môi trường development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;