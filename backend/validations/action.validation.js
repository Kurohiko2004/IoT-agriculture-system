const Joi = require('joi');

const getActionSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    items: Joi.number().integer().valid(5, 10, 15, 20).default(10),
    
    // Lọc theo trạng thái (PENDING, on, off, auto_off...)
    status: Joi.string().max(20).optional().empty(''),
    
    // Lọc theo deviceId
    deviceId: Joi.number().integer().optional().empty(''),
    
    // Tìm kiếm theo tên hành động hoặc thời gian
    search: Joi.string().max(50).optional().allow('', null),
    
    sortBy: Joi.string().valid('interactedAt', 'id').default('interactedAt'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
});

module.exports = { getActionSchema };