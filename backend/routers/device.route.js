const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller.js');

const validate = require('../middlewares/validate.middleware.js');
const { controlDeviceSchema } = require('../validations/device.validation.js');
const { idSchema } = require('../validations/common.validation.js');


// Định nghĩa Endpoint GET /api/devices/status
router.get('/status', deviceController.getDeviceStatuses);
router.post(
    '/:id/action', 
    validate(idSchema, 'params'), 
    validate(controlDeviceSchema, 'body'), 
    deviceController.controlDevice);

module.exports = router;