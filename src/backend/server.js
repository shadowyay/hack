const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:5001';
const AI_SERVICE_TIMEOUT = parseInt(process.env.AI_SERVICE_TIMEOUT) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (optional - can work without it)
let db = null;
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/wildwest_duel';
const DB_NAME = process.env.DB_NAME || 'wildwest_duel';

async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`✅ Connected to MongoDB: ${DB_NAME}`);
  } catch (error) {
    console.log('⚠️  MongoDB not available, running without database:', error.message);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Wild West Duel Backend Server',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected',
    aiService: PYTHON_AI_URL
  });
});

// AI Service Proxy Endpoint
app.post('/api/ai/decision', async (req, res) => {
  try {
    console.log('🤖 Forwarding AI decision request to:', PYTHON_AI_URL);
    const response = await axios.post(`${PYTHON_AI_URL}/ai_decision`, req.body, {
      timeout: AI_SERVICE_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ AI decision received:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('❌ AI service error:', error.message);
    
    // Fallback AI behavior when service is unavailable
    const fallbackDecision = {
      should_shoot: Math.random() < 0.3,
      should_jump: Math.random() < 0.1,
      move_direction: Math.random() < 0.5 ? 'left' : 'right',
      reaction_time_ms: Math.random() * 1000 + 500,
      accuracy_modifier: 0.7,
      strategy: 'fallback_mode'
    };
    
    console.log('🔄 Using fallback AI decision:', fallbackDecision);
    res.json(fallbackDecision);
  }
});

// AI Health Check
app.get('/api/ai/health', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_AI_URL}/health`, {
      timeout: 3000
    });
    res.json({
      aiServiceStatus: 'connected',
      aiServiceUrl: PYTHON_AI_URL,
      aiResponse: response.data
    });
  } catch (error) {
    res.status(503).json({
      aiServiceStatus: 'disconnected',
      aiServiceUrl: PYTHON_AI_URL,
      error: error.message
    });
  }
});

// AI Personality Endpoint
app.get('/api/ai/personality', async (req, res) => {
  try {
    const difficulty = req.query.difficulty || 'medium';
    console.log('🎭 Fetching AI personality for difficulty:', difficulty);
    
    const response = await axios.get(`${PYTHON_AI_URL}/ai_personality?difficulty=${difficulty}`, {
      timeout: AI_SERVICE_TIMEOUT
    });
    
    console.log('✅ AI personality received:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('❌ AI personality error:', error.message);
    
    // Fallback personality
    const fallbackPersonality = {
      name: "Generic Gunslinger",
      aggression: 0.5,
      accuracy: 0.7,
      reaction_speed: 0.6,
      jump_ability: 0.4,
      strategy: "fallback_mode"
    };
    
    console.log('🔄 Using fallback AI personality:', fallbackPersonality);
    res.json(fallbackPersonality);
  }
});

// Game session endpoints
app.post('/api/game/start', async (req, res) => {
  try {
    const { playerName, mode, difficulty } = req.body;
    
    const gameSession = {
      playerId: `player_${Date.now()}`,
      playerName: playerName || 'Anonymous',
      mode: mode || 'ai',
      difficulty: difficulty || 'medium',
      startTime: new Date(),
      status: 'active',
      score: 0,
      shots: 0,
      hits: 0,
      reactionTimes: []
    };

    // Save to database if available
    if (db) {
      await db.collection('game_sessions').insertOne(gameSession);
    }

    res.json({
      success: true,
      sessionId: gameSession.playerId,
      message: 'Game session started',
      gameSession
    });
  } catch (error) {
    console.error('Error starting game session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/game/end', async (req, res) => {
  try {
    const { sessionId, result } = req.body;
    const { score, accuracy, reactionTime, strategyRating, winner } = result;

    const gameResult = {
      sessionId,
      endTime: new Date(),
      finalScore: score,
      accuracy,
      averageReactionTime: reactionTime,
      strategyRating,
      winner,
      status: 'completed'
    };

    // Update database if available
    if (db) {
      await db.collection('game_sessions').updateOne(
        { playerId: sessionId },
        { 
          $set: {
            ...gameResult,
            updatedAt: new Date()
          }
        }
      );
    }

    res.json({
      success: true,
      message: 'Game session ended',
      result: gameResult
    });
  } catch (error) {
    console.error('Error ending game session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  try {
    let leaderboard = [];
    
    if (db) {
      leaderboard = await db.collection('game_sessions')
        .find({ status: 'completed' })
        .sort({ finalScore: -1 })
        .limit(10)
        .toArray();
    } else {
      // Mock data when no database
      leaderboard = [
        { playerName: 'QuickDraw McGraw', finalScore: 950, accuracy: 85, averageReactionTime: 180 },
        { playerName: 'Annie Oakley', finalScore: 920, accuracy: 92, averageReactionTime: 220 },
        { playerName: 'Wild Bill', finalScore: 890, accuracy: 78, averageReactionTime: 160 }
      ];
    }

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Player stats endpoint
app.get('/api/player/:playerId/stats', async (req, res) => {
  try {
    const { playerId } = req.params;
    let stats = null;

    if (db) {
      const sessions = await db.collection('game_sessions')
        .find({ playerId })
        .toArray();

      if (sessions.length > 0) {
        const completedSessions = sessions.filter(s => s.status === 'completed');
        stats = {
          totalGames: sessions.length,
          completedGames: completedSessions.length,
          averageScore: completedSessions.reduce((sum, s) => sum + (s.finalScore || 0), 0) / completedSessions.length || 0,
          averageAccuracy: completedSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / completedSessions.length || 0,
          bestScore: Math.max(...completedSessions.map(s => s.finalScore || 0)),
          wins: completedSessions.filter(s => s.winner === 'player').length
        };
      }
    }

    res.json({
      success: true,
      stats: stats || {
        totalGames: 0,
        completedGames: 0,
        averageScore: 0,
        averageAccuracy: 0,
        bestScore: 0,
        wins: 0
      }
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Game state sync endpoint (for multiplayer future support)
app.post('/api/game/sync', (req, res) => {
  try {
    const { sessionId, gameState } = req.body;
    
    // For now, just echo back the game state
    // In a real multiplayer system, this would sync with other players
    res.json({
      success: true,
      message: 'Game state synced',
      gameState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing game state:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /api/game/start',
      'POST /api/game/end',
      'GET /api/leaderboard',
      'GET /api/player/:playerId/stats',
      'POST /api/game/sync'
    ]
  });
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🤠 Wild West Duel Backend Server running on port ${PORT}`);
    console.log(`🎯 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
  });
}

startServer().catch(console.error);
