const axios = require('axios');
const Scenario = require('../models/Scenario');

// Mock AI logic for fallback
function mockScenario(mode, difficulty) {
  return {
    mode,
    difficulty,
    details: {
      positions: [
        { x: Math.random() * 100, y: Math.random() * 100 },
        { x: Math.random() * 100, y: Math.random() * 100 }
      ],
      objectives: ['Capture the flag', 'Defeat the opponent', 'Evade detection'][Math.floor(Math.random()*3)],
      opponentSkill: ['novice', 'intermediate', 'expert'][['easy','medium','hard'].indexOf(difficulty)],
      environment: ['desert', 'forest', 'urban'][Math.floor(Math.random()*3)]
    }
  };
}

exports.generateScenario = async (mode, difficulty) => {
  try {
    const response = await axios.get(process.env.PYTHON_AI_URL, { params: { mode, difficulty } });
    if (response.data) {
      // Save scenario to DB
      await Scenario.create({ mode, difficulty, details: response.data });
      return response.data;
    }
    throw new Error('No data from AI service');
  } catch (err) {
    // Fallback to mock
    const mock = mockScenario(mode, difficulty);
    await Scenario.create({ mode, difficulty, details: mock });
    return mock;
  }
};
