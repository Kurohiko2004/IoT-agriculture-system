const express = require('express');
const router = express.Router();
const actionController = require('../controllers/action.controller');
const validate = require('../middlewares/validate.middleware');
const { getActionHistorySchema } = require('../validations/action.validation');

router.get('/', validate(getActionHistorySchema), actionController.getActionHistory);

module.exports = router;