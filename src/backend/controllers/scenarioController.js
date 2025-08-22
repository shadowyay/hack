const scenarioService = require('../services/scenarioService');

exports.getScenario = async (req, res) => {
  const { mode, difficulty } = req.query;
  try {
    const scenario = await scenarioService.generateScenario(mode, difficulty);
    res.json(scenario);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate scenario', details: err.message });
  }
};
