const Joi = require('joi');

const idSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID phải là một con số',
        'number.integer': 'ID phải là số nguyên',
        'number.positive': 'ID phải là số dương',
        'any.required': 'Thiếu ID định danh trên URL'
    })
});

module.exports = { idSchema };