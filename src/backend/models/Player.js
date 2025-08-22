const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  playerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  stats: [{
    reactionTime: Number,
    accuracy: Number,
    strategyScore: Number,
    mode: String,
    score: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  totalScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('Player', PlayerSchema);
