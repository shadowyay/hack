const Player = require('../models/Player');

exports.getTopPlayers = async () => {
  const players = await Player.find().sort({ totalScore: -1 }).limit(10).select('playerId name totalScore');
  return players;
};
