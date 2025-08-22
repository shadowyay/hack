const User = require('../models/User');

exports.getTopPlayers = async (mode = null, limit = 10) => {
  let query = {};
  let sortField = 'stats.bestScore';
  
  if (mode && ['duel', 'chase', 'tracking'].includes(mode)) {
    sortField = `stats.highScores.${mode}.score`;
  }
  
  const users = await User.find(query)
    .sort({ [sortField]: -1 })
    .limit(limit)
    .select(`username stats.bestScore stats.highScores createdAt`);
  
  return users.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    score: mode ? user.stats.highScores[mode]?.score || 0 : user.stats.bestScore,
    accuracy: mode ? user.stats.highScores[mode]?.accuracy || 0 : 0,
    reactionTime: mode ? user.stats.highScores[mode]?.reactionTime || 0 : 0,
    joinDate: user.createdAt,
    mode: mode || 'overall'
  }));
};

exports.getTopPlayersByMode = async (mode, limit = 10) => {
  const users = await User.find({
    [`stats.highScores.${mode}.score`]: { $gt: 0 }
  })
  .sort({ [`stats.highScores.${mode}.score`]: -1 })
  .limit(limit)
  .select(`username stats.highScores.${mode} createdAt`);
  
  return users.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    score: user.stats.highScores[mode]?.score || 0,
    accuracy: user.stats.highScores[mode]?.accuracy || 0,
    reactionTime: user.stats.highScores[mode]?.reactionTime || 0,
    timestamp: user.stats.highScores[mode]?.timestamp,
    joinDate: user.createdAt,
    mode: mode
  }));
};

exports.getUserRank = async (userId, mode = null) => {
  let sortField = 'stats.bestScore';
  let scoreField = 'stats.bestScore';
  
  if (mode && ['duel', 'chase', 'tracking'].includes(mode)) {
    sortField = `stats.highScores.${mode}.score`;
    scoreField = `stats.highScores.${mode}.score`;
  }
  
  const user = await User.findById(userId).select(`username ${scoreField}`);
  if (!user) {
    throw new Error('User not found');
  }
  
  const userScore = mode ? 
    user.stats.highScores[mode]?.score || 0 : 
    user.stats.bestScore;
  
  const betterPlayersCount = await User.countDocuments({
    [sortField]: { $gt: userScore }
  });
  
  return {
    username: user.username,
    rank: betterPlayersCount + 1,
    score: userScore,
    mode: mode || 'overall'
  };
};
