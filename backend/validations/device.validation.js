const Joi = require('joi');

const controlDeviceSchema = Joi.object({
    // Action phải là string và nằm trong danh sách cho phép
    action: Joi.string()
        .valid(...Object.freeze(Action))
        .required()
        .messages({
            'any.only': 'Hành động {#value} không hợp lệ',
            'any.required': 'Hành động là bắt buộc'
        })
});

module.exports = {
    controlDeviceSchema
};  