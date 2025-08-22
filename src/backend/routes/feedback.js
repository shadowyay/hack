const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.get('/:playerId', feedbackController.getFeedback);

module.exports = router;
