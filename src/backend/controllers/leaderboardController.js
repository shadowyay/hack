const leaderboardService = require('../services/leaderboardService');

exports.getLeaderboard = async (req, res) => {
  try {
    const { mode, limit = 10 } = req.query;
    const leaderboard = await leaderboardService.getTopPlayers(mode, parseInt(limit));
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaderboard', details: err.message });
  }
};

exports.getLeaderboardByMode = async (req, res) => {
  try {
    const { mode } = req.params;
    const { limit = 10 } = req.query;
    
    if (!['duel', 'chase', 'tracking'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid game mode' });
    }
    
    const leaderboard = await leaderboardService.getTopPlayersByMode(mode, parseInt(limit));
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaderboard', details: err.message });
  }
};

exports.getUserRank = async (req, res) => {
  try {
    const { userId, mode } = req.params;
    const rank = await leaderboardService.getUserRank(userId, mode);
    res.json(rank);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user rank', details: err.message });
  }
};
