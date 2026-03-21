const express = require('express');
const router = express.Router();
const sensorDataController = require('../controllers/sensor-data.controller');
const validate = require('../middlewares/validate.middleware');
const { getSensorDataSchema } = require('../validations/sensor.validation');

router.get('/', validate(getSensorDataSchema), sensorDataController.getAllSensorData);

module.exports = router;