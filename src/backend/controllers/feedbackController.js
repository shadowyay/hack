const feedbackService = require('../services/feedbackService');

exports.getFeedback = async (req, res) => {
  try {
    const feedback = await feedbackService.analyzePerformance(req.params.playerId);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get feedback', details: err.message });
  }
};
