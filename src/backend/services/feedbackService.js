const Player = require('../models/Player');

exports.analyzePerformance = async (playerId) => {
  const player = await Player.findOne({ playerId });
  if (!player || !player.stats.length) {
    return { message: 'No performance data found.' };
  }
  const last = player.stats[player.stats.length - 1];
  let tips = [];
  if (last.reactionTime > 500) tips.push('Work on your reaction speed. Try quick-draw drills.');
  if (last.accuracy < 70) tips.push('Improve your aim with target practice.');
  if (last.strategyScore < 50) tips.push('Study opponent patterns and plan your moves.');
  if (!tips.length) tips.push('Great job! Keep it up.');
  return {
    analysis: {
      reactionTime: last.reactionTime,
      accuracy: last.accuracy,
      strategyScore: last.strategyScore,
      mode: last.mode,
      score: last.score
    },
    tips
  };
};
