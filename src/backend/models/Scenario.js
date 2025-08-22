const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
  mode: { type: String, enum: ['duel', 'chase', 'tracking'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  details: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scenario', ScenarioSchema);
