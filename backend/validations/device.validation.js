const Joi = require('joi');

const controlDeviceSchema = Joi.object({
    // Action phải là string và nằm trong danh sách cho phép
    action: Joi.string()
        .valid('TURN_ON', 'TURN_OFF', 'BLINK_ALL', 'BLINK_EACH', 'ALL_ON', 'ALL_OFF')
        .required()
        .messages({
            'any.only': 'Hành động {#value} không hợp lệ',
            'any.required': 'Hành động là bắt buộc'
        })
});

module.exports = {
    controlDeviceSchema
};