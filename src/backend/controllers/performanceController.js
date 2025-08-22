const performanceService = require('../services/performanceService');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.postPerformance = async (req, res) => {
  try {
    const result = await performanceService.savePerformance(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save performance', details: err.message });
  }
};

exports.saveGameResult = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const gameData = req.body;
    
    // Add to user's game history
    user.gameHistory.push({
      mode: gameData.mode,
      score: gameData.score,
      accuracy: gameData.accuracy,
      reactionTime: gameData.reactionTime,
      strategyRating: gameData.strategyRating,
      duration: gameData.duration,
      timestamp: new Date()
    });

    // Update user stats
    user.stats.totalGames += 1;
    if (gameData.score > user.stats.bestScore) {
      user.stats.bestScore = gameData.score;
    }
    
    // Update game-specific high scores
    const currentHighScore = user.stats.highScores[gameData.mode];
    if (!currentHighScore || gameData.score > currentHighScore.score) {
      user.stats.highScores[gameData.mode] = {
        score: gameData.score,
        accuracy: gameData.accuracy,
        reactionTime: gameData.reactionTime,
        timestamp: new Date()
      };
    }
    
    // Update average accuracy
    const totalAccuracy = user.stats.averageAccuracy * (user.stats.totalGames - 1) + gameData.accuracy;
    user.stats.averageAccuracy = totalAccuracy / user.stats.totalGames;
    
    // Update average reaction time
    const totalReactionTime = user.stats.averageReactionTime * (user.stats.totalGames - 1) + gameData.reactionTime;
    user.stats.averageReactionTime = totalReactionTime / user.stats.totalGames;
    
    // Update total play time
    user.stats.totalPlayTime += gameData.duration;

    // Check for achievements
    const achievements = checkAchievements(user, gameData);
    if (achievements.length > 0) {
      user.stats.achievements.push(...achievements);
    }

    await user.save();

    res.json({ 
      message: 'Game result saved successfully',
      stats: user.stats,
      newAchievements: achievements,
      isNewHighScore: !currentHighScore || gameData.score > currentHighScore.score
    });

  } catch (error) {
    console.error('Save game result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to check for achievements
function checkAchievements(user, gameData) {
  const achievements = [];
  
  // First game achievement
  if (user.stats.totalGames === 1) {
    achievements.push('First Draw');
  }
  
  // Perfect accuracy achievement
  if (gameData.accuracy === 100) {
    achievements.push('Sharpshooter');
  }
  
  // Fast draw achievement (less than 500ms reaction time)
  if (gameData.reactionTime < 500) {
    achievements.push('Lightning Fast');
  }
  
  // High score achievements
  if (gameData.score >= 1000) {
    achievements.push('High Roller');
  }
  
  if (gameData.score >= 5000) {
    achievements.push('Legendary Gunslinger');
  }
  
  // Game count achievements
  if (user.stats.totalGames >= 10) {
    achievements.push('Veteran');
  }
  
  if (user.stats.totalGames >= 50) {
    achievements.push('Bounty Hunter');
  }
  
  // Filter out already earned achievements
  return achievements.filter(achievement => 
    !user.stats.achievements.includes(achievement)
  );
}
