const leaderboardService = require('../services/leaderboardService');

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await leaderboardService.getTopPlayers();
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaderboard', details: err.message });
  }
};
