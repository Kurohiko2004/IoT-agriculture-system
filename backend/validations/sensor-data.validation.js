const Joi = require('joi');

const getSensorDataSchema = Joi.object({
    // Page phải là số nguyên, tối thiểu là 1, mặc định là 1
    page: Joi.number().integer().min(1).default(1),

    items: Joi.number().integer().valid(5, 10, 15, 20).default(10),

    // Type chỉ được phép là 1 trong 3 loại này

    type: Joi.string().valid('temperature', 'humidity', 'light', 'moisture').optional(),

    // Search tối đa 50 ký tự để tránh spam chuỗi dài gây lag DB
    search: Joi.string().max(50).allow('', null).optional(),

    // Sắp xếp theo các cột hợp lệ
    sortBy: Joi.string().valid('measuredAt', 'value').default('measuredAt'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
});

module.exports = { getSensorDataSchema };