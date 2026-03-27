const express = require('express');
const router = express.Router();
const actionController = require('../controllers/action.controller');
const validate = require('../middlewares/validate.middleware');
const { getActionSchema } = require('../validations/action.validation');

router.get('/', validate(getActionSchema), actionController.getAction);

module.exports = router;