import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GameMode } from '../../types';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  joinDate: Date;
  mode: string;
}

interface UserRank {
  username: string;
  rank: number;
  score: number;
  mode: string;
}

interface LeaderboardProps {
  gameMode?: GameMode;
  limit?: number;
  showUserRank?: boolean;
  userId?: string;
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  gameMode,
  limit = 10,
  showUserRank = false,
  userId,
  className = ''
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = React.useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = gameMode 
        ? `http://localhost:3001/leaderboard/${gameMode}?limit=${limit}`
        : `http://localhost:3001/leaderboard?limit=${limit}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        setLeaderboard(data);
      } else {
        setError(data.error || 'Failed to fetch leaderboard');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [gameMode, limit]);

  const fetchUserRank = React.useCallback(async () => {
    if (!userId) return;
    
    try {
      const endpoint = gameMode 
        ? `http://localhost:3001/leaderboard/user/${userId}/${gameMode}`
        : `http://localhost:3001/leaderboard/user/${userId}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        setUserRank(data);
      }
    } catch (err) {
      console.error('Failed to fetch user rank:', err);
    }
  }, [userId, gameMode]);

  useEffect(() => {
    fetchLeaderboard();
    if (showUserRank && userId) {
      fetchUserRank();
    }
  }, [fetchLeaderboard, fetchUserRank, showUserRank, userId]);

  const formatTime = (ms: number) => {
    return `${ms.toFixed(0)}ms`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className={`glass p-6 rounded-xl ${className}`}>
        <div className="flex items-center justify-center">
          <div className="spinner-western w-8 h-8"></div>
          <span className="ml-2 text-wild-west-300 font-elegant">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass p-6 rounded-xl ${className}`}>
        <div className="text-center text-red-400">
          <p>Error loading leaderboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass p-6 rounded-xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-western text-2xl text-wild-west-300 text-glow">
          🎯 {gameMode ? `${gameMode.toUpperCase()} ` : ''}Leaderboard
        </h3>
        <button
          onClick={fetchLeaderboard}
          className="text-wild-west-400 hover:text-wild-west-300 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* User Rank (if shown) */}
      {showUserRank && userRank && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-wild-west-800/30 border border-wild-west-600/50 rounded-lg p-3 mb-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-wild-west-200 font-elegant">Your Rank:</span>
            <div className="flex items-center gap-2">
              <span className="text-wild-west-300">{getRankIcon(userRank.rank)}</span>
              <span className="text-wild-west-100 font-bold">{userRank.score} pts</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center text-wild-west-400 py-8">
            <p>No scores recorded yet.</p>
            <p className="text-sm mt-2">Be the first to make your mark!</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <motion.div
              key={`${entry.username}-${entry.rank}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center justify-between p-3 rounded-lg transition-all duration-200
                ${entry.rank <= 3 
                  ? 'bg-gradient-to-r from-wild-west-700/50 to-wild-west-600/50 border border-wild-west-500/50' 
                  : 'bg-wild-west-800/20 border border-wild-west-700/30 hover:bg-wild-west-700/30'
                }
              `}
            >
              {/* Rank and Username */}
              <div className="flex items-center gap-3">
                <span className={`
                  text-lg font-bold
                  ${entry.rank <= 3 ? 'text-wild-west-200' : 'text-wild-west-400'}
                `}>
                  {getRankIcon(entry.rank)}
                </span>
                <div>
                  <p className={`
                    font-elegant font-semibold
                    ${entry.rank <= 3 ? 'text-wild-west-100' : 'text-wild-west-200'}
                  `}>
                    {entry.username}
                  </p>
                  {gameMode && (
                    <div className="flex gap-3 text-xs text-wild-west-400">
                      <span>Acc: {entry.accuracy.toFixed(1)}%</span>
                      <span>RT: {formatTime(entry.reactionTime)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className={`
                  font-bold text-lg
                  ${entry.rank <= 3 ? 'text-wild-west-200' : 'text-wild-west-300'}
                `}>
                  {entry.score.toLocaleString()}
                </p>
                <p className="text-xs text-wild-west-500">points</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-wild-west-500">
        Showing top {Math.min(limit, leaderboard.length)} {gameMode || 'overall'} scores
      </div>
    </motion.div>
  );
};

export default Leaderboard;
