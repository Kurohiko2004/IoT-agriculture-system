const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.query, { 
        abortEarly: false, // Liệt kê tất cả các lỗi thay vì dừng ở lỗi đầu tiên
        stripUnknown: true // Loại bỏ các tham số lạ không có trong schema
    });

    // console.log("Input của Joi:", req.query);
    // console.log("Output của Joi (value):", value);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return res.status(400).json({ success: false, message: errorMessage });
    }

    // Gán lại dữ liệu đã chuẩn hóa (có default values) vào req.query
    req.query = value;
    next();
};

module.exports = validate;