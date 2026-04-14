const express = require('express');
const router = express.Router();
const { getDeviceToggleStats } = require('../controllers/stats.controller');

// GET /api/stats/device-toggles?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get(
    '/device-toggles',
    getDeviceToggleStats
);

module.exports = router;
