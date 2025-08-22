import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Leaderboard from '../components/ui/Leaderboard';
import type { GameMode } from '../types';

interface LeaderboardPageProps {
  onGoBack: () => void;
  onPlayGame?: (mode: GameMode) => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onGoBack, onPlayGame }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('duel');

  const modes: { mode: GameMode; label: string; icon: string; description: string }[] = [
    { mode: 'duel', label: 'Duel Masters', icon: '🤠', description: 'Fast draw showdowns' },
    { mode: 'chase', label: 'Chase Champions', icon: '🐎', description: 'High-speed pursuits' },
    { mode: 'tracking', label: 'Tracking Legends', icon: '🎯', description: 'Precision tracking' },
  ];

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="font-western text-5xl text-wild-west-300 text-glow mb-4"
          >
            🏆 Hall of Fame
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-elegant text-wild-west-200 text-xl"
          >
            The fastest guns in the West - Choose your challenge
          </motion.p>
        </div>

        {/* Mode Selection Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass p-3 rounded-xl">
            <div className="flex gap-3">
              {modes.map((modeData) => (
                <button
                  key={modeData.mode}
                  onClick={() => setSelectedMode(modeData.mode)}
                  className={`
                    px-6 py-4 rounded-lg font-elegant font-semibold transition-all duration-200 text-center min-w-[180px]
                    ${selectedMode === modeData.mode
                      ? 'bg-wild-west-600 text-white shadow-lg transform scale-105'
                      : 'text-wild-west-300 hover:text-white hover:bg-wild-west-700/50 hover:transform hover:scale-102'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{modeData.icon}</div>
                  <div className="font-bold">{modeData.label}</div>
                  <div className="text-xs opacity-80">{modeData.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <motion.div
          key={selectedMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Leaderboard
            gameMode={selectedMode}
            limit={20}
            showUserRank={!!user}
            userId={user?.id}
          />
          
          {/* Challenge Button */}
          {onPlayGame && (
            <div className="text-center mt-6">
              <Button
                onClick={() => onPlayGame(selectedMode)}
                variant="western"
                size="lg"
                className="min-w-[240px]"
              >
                🎯 Challenge {modes.find(m => m.mode === selectedMode)?.label}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            onClick={onGoBack}
            variant="saloon"
            size="lg"
            className="min-w-[200px]"
          >
            ← Back to Main Menu
          </Button>
        </div>

        {/* Stats Summary */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="glass p-6 rounded-xl max-w-4xl mx-auto">
              <h3 className="font-western text-xl text-wild-west-300 mb-6">
                Your Legacy, {user.username}
              </h3>
              <GameSpecificStats userId={user.id} selectedMode={selectedMode} />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

interface UserStatsData {
  totalGames: number;
  bestScore: number;
  averageAccuracy: number;
  achievements: string[];
  highScores: {
    duel?: { score: number; accuracy: number; reactionTime: number; timestamp: Date };
    chase?: { score: number; accuracy: number; reactionTime: number; timestamp: Date };
    tracking?: { score: number; accuracy: number; reactionTime: number; timestamp: Date };
  };
}

interface GameSpecificStatsProps {
  userId: string;
  selectedMode: GameMode;
}

const GameSpecificStats: React.FC<GameSpecificStatsProps> = ({ userId, selectedMode }) => {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchUserStats();
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setStats(data.user.stats);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameModeInfo = (mode: GameMode) => {
    switch (mode) {
      case 'duel':
        return { name: 'Duel Master', icon: '🤠', color: 'text-red-400' };
      case 'chase':
        return { name: 'Chase Champion', icon: '🐎', color: 'text-blue-400' };
      case 'tracking':
        return { name: 'Tracking Legend', icon: '🎯', color: 'text-green-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="spinner-western w-6 h-6 mr-2"></div>
        <span className="text-wild-west-300 text-sm">Loading stats...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-wild-west-400 text-sm">
        No statistics available
      </div>
    );
  }

  const currentGameStats = stats.highScores[selectedMode];
  const gameInfo = getGameModeInfo(selectedMode);

  return (
    <div className="space-y-6">
      {/* Current Game Mode Stats */}
      <div className="glass p-4 rounded-lg">
        <h4 className={`font-western text-lg mb-4 ${gameInfo.color}`}>
          {gameInfo.icon} {gameInfo.name} Performance
        </h4>
        {currentGameStats ? (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-wild-west-400">Best Score</p>
              <p className="text-2xl font-bold text-wild-west-200">{currentGameStats.score?.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-wild-west-400">Best Accuracy</p>
              <p className="text-xl font-bold text-wild-west-200">{currentGameStats.accuracy?.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-wild-west-400">Best Reaction</p>
              <p className="text-xl font-bold text-wild-west-200">{currentGameStats.reactionTime?.toFixed(0)}ms</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-wild-west-400 py-4">
            <p>No {selectedMode} games played yet</p>
            <p className="text-sm mt-2">Start playing to see your stats!</p>
          </div>
        )}
      </div>

      {/* All Game Modes Overview */}
      <div className="grid grid-cols-3 gap-4">
        {(['duel', 'chase', 'tracking'] as GameMode[]).map((mode) => {
          const modeStats = stats.highScores[mode];
          const modeInfo = getGameModeInfo(mode);
          
          return (
            <div 
              key={mode}
              className={`
                glass p-3 rounded-lg text-center transition-all duration-200
                ${mode === selectedMode ? 'ring-2 ring-wild-west-400' : 'hover:bg-wild-west-700/20'}
              `}
            >
              <div className="text-lg mb-2">{modeInfo.icon}</div>
              <div className="text-xs text-wild-west-400 mb-1">{mode.toUpperCase()}</div>
              {modeStats ? (
                <>
                  <div className={`font-bold ${modeInfo.color}`}>{modeStats.score?.toLocaleString()}</div>
                  <div className="text-xs text-wild-west-500">{modeStats.accuracy?.toFixed(1)}% acc</div>
                </>
              ) : (
                <div className="text-xs text-wild-west-600">Not played</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <p className="text-wild-west-400">Total Games</p>
          <p className="text-2xl font-bold text-wild-west-200">{stats.totalGames}</p>
        </div>
        <div className="text-center">
          <p className="text-wild-west-400">Achievements</p>
          <p className="text-2xl font-bold text-wild-west-200">{stats.achievements?.length || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
