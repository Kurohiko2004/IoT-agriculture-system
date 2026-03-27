const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller.js');

// Định nghĩa Endpoint GET /api/devices/status
router.get('/status', deviceController.getDeviceStatuses);

module.exports = router;