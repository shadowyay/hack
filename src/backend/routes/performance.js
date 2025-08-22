const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

router.post('/', performanceController.postPerformance);
router.post('/save-result', performanceController.saveGameResult);

module.exports = router;
