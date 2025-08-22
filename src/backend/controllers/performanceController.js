const performanceService = require('../services/performanceService');

exports.postPerformance = async (req, res) => {
  try {
    const result = await performanceService.savePerformance(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save performance', details: err.message });
  }
};
