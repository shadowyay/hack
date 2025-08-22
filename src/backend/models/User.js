const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  stats: {
    totalGames: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0
    },
    averageReactionTime: {
      type: Number,
      default: 0
    },
    bestScore: {
      type: Number,
      default: 0
    },
    totalPlayTime: {
      type: Number,
      default: 0
    },
    achievements: [{
      type: String
    }],
    // Game-specific high scores
    highScores: {
      duel: {
        score: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        reactionTime: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now }
      },
      chase: {
        score: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        reactionTime: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now }
      },
      tracking: {
        score: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        reactionTime: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now }
      }
    }
  },
  gameHistory: [{
    mode: {
      type: String,
      enum: ['duel', 'chase', 'tracking']
    },
    score: Number,
    accuracy: Number,
    reactionTime: Number,
    strategyRating: Number,
    duration: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
