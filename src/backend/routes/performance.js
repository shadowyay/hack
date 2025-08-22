const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

router.post('/', performanceController.postPerformance);

module.exports = router;
