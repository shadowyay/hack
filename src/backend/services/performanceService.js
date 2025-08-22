const Player = require('../models/Player');

exports.savePerformance = async (data) => {
  const { playerId, name, reactionTime, accuracy, strategyScore, mode } = data;
  const score = Math.round((accuracy * 0.5 + strategyScore * 0.3 + (1000 - reactionTime) * 0.2));
  let player = await Player.findOne({ playerId });
  if (!player) {
    player = new Player({ playerId, name, stats: [], totalScore: 0 });
  }
  player.stats.push({ reactionTime, accuracy, strategyScore, mode, score });
  player.totalScore += score;
  await player.save();
  return { success: true, score, totalScore: player.totalScore };
};
