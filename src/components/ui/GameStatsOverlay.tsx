import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Leaderboard from './Leaderboard';
import type { GameMode } from '../../types';
import apiConfig from '../../utils/apiConfig';

interface GameStatsOverlayProps {
  gameMode: GameMode;
  userId?: string;
  currentScore: number;
  isVisible: boolean;
  onClose: () => void;
}

const GameStatsOverlay: React.FC<GameStatsOverlayProps> = ({
  gameMode,
  userId,
  currentScore,
  isVisible,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'personal'>('leaderboard');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
            className="glass-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-wild-west-600/30">
              <h2 className="font-western text-3xl text-wild-west-300 text-glow">
                🎯 Game Stats
              </h2>
              <button
                onClick={onClose}
                className="text-wild-west-400 hover:text-wild-west-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Current Score */}
            <div className="p-6 border-b border-wild-west-600/30">
              <div className="text-center">
                <p className="text-wild-west-400 font-elegant mb-2">Current Score</p>
                <p className="font-western text-4xl text-wild-west-200 text-glow">
                  {currentScore.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-wild-west-600/30">
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`
                  flex-1 py-4 px-6 font-elegant font-semibold transition-all duration-200
                  ${activeTab === 'leaderboard'
                    ? 'text-wild-west-200 border-b-2 border-wild-west-500 bg-wild-west-700/20'
                    : 'text-wild-west-400 hover:text-wild-west-300'
                  }
                `}
              >
                🏆 Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`
                  flex-1 py-4 px-6 font-elegant font-semibold transition-all duration-200
                  ${activeTab === 'personal'
                    ? 'text-wild-west-200 border-b-2 border-wild-west-500 bg-wild-west-700/20'
                    : 'text-wild-west-400 hover:text-wild-west-300'
                  }
                `}
              >
                📊 Your Stats
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'leaderboard' && (
                <Leaderboard
                  gameMode={gameMode}
                  limit={10}
                  showUserRank={true}
                  userId={userId}
                />
              )}

              {activeTab === 'personal' && (
                <PersonalStats gameMode={gameMode} userId={userId} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface PersonalStats {
  totalGames: number;
  bestScore: number;
  averageAccuracy: number;
  averageReactionTime: number;
  achievements: string[];
  highScores: {
    [key: string]: {
      score: number;
      accuracy: number;
      reactionTime: number;
      timestamp: Date;
    };
  };
}

interface PersonalStatsProps {
  gameMode: GameMode;
  userId?: string;
}

const PersonalStats: React.FC<PersonalStatsProps> = ({ gameMode, userId }) => {
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPersonalStats = React.useCallback(async () => {
    if (!userId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiConfig.auth.profile, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setStats(data.user.stats);
      }
    } catch (error) {
      console.error('Failed to fetch personal stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    if (userId) {
      fetchPersonalStats();
    }
  }, [userId, gameMode, fetchPersonalStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="spinner-western w-8 h-8 mr-2"></div>
        <span className="text-wild-west-300">Loading your stats...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-wild-west-400">
        <p>Unable to load your statistics.</p>
      </div>
    );
  }

  const gameSpecificStats = stats.highScores?.[gameMode];

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div>
        <h3 className="font-western text-xl text-wild-west-300 mb-4">📈 Overall Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-wild-west-800/30 p-4 rounded-lg">
            <p className="text-wild-west-400 text-sm">Total Games</p>
            <p className="text-2xl font-bold text-wild-west-200">{stats.totalGames}</p>
          </div>
          <div className="bg-wild-west-800/30 p-4 rounded-lg">
            <p className="text-wild-west-400 text-sm">Best Score</p>
            <p className="text-2xl font-bold text-wild-west-200">{stats.bestScore?.toLocaleString()}</p>
          </div>
          <div className="bg-wild-west-800/30 p-4 rounded-lg">
            <p className="text-wild-west-400 text-sm">Avg Accuracy</p>
            <p className="text-2xl font-bold text-wild-west-200">{stats.averageAccuracy?.toFixed(1)}%</p>
          </div>
          <div className="bg-wild-west-800/30 p-4 rounded-lg">
            <p className="text-wild-west-400 text-sm">Avg Reaction</p>
            <p className="text-2xl font-bold text-wild-west-200">{stats.averageReactionTime?.toFixed(0)}ms</p>
          </div>
        </div>
      </div>

      {/* Game-Specific Stats */}
      {gameSpecificStats && (
        <div>
          <h3 className="font-western text-xl text-wild-west-300 mb-4">
            🎯 {gameMode.toUpperCase()} High Score
          </h3>
          <div className="bg-gradient-to-r from-wild-west-700/50 to-wild-west-600/50 border border-wild-west-500/50 p-6 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-wild-west-400 text-sm">Score</p>
                <p className="text-3xl font-bold text-wild-west-200">{gameSpecificStats.score?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-wild-west-400 text-sm">Accuracy</p>
                <p className="text-3xl font-bold text-wild-west-200">{gameSpecificStats.accuracy?.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-wild-west-400 text-sm">Reaction Time</p>
                <p className="text-3xl font-bold text-wild-west-200">{gameSpecificStats.reactionTime?.toFixed(0)}ms</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {stats.achievements?.length > 0 && (
        <div>
          <h3 className="font-western text-xl text-wild-west-300 mb-4">🏆 Achievements</h3>
          <div className="grid grid-cols-2 gap-2">
            {stats.achievements.map((achievement: string, index: number) => (
              <div
                key={index}
                className="bg-wild-west-700/30 border border-wild-west-600/50 p-3 rounded-lg text-center"
              >
                <p className="text-wild-west-200 font-elegant text-sm">{achievement}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStatsOverlay;
