const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

router.get('/', leaderboardController.getLeaderboard);
router.get('/:mode', leaderboardController.getLeaderboardByMode);
router.get('/user/:userId/:mode?', leaderboardController.getUserRank);

module.exports = router;
