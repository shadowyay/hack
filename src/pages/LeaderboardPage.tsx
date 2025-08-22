import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Leaderboard from '../components/ui/Leaderboard';
import type { GameMode } from '../types';

interface LeaderboardPageProps {
  onGoBack: () => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onGoBack }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const modes: { mode: GameMode | null; label: string; icon: string }[] = [
    { mode: null, label: 'Overall', icon: '🏆' },
    { mode: 'duel', label: 'Duel', icon: '🤠' },
    { mode: 'chase', label: 'Chase', icon: '🐎' },
    { mode: 'tracking', label: 'Tracking', icon: '🎯' },
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
            The fastest guns in the West
          </motion.p>
        </div>

        {/* Mode Selection Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass p-2 rounded-xl">
            <div className="flex gap-2">
              {modes.map((modeData) => (
                <button
                  key={modeData.label}
                  onClick={() => setSelectedMode(modeData.mode)}
                  className={`
                    px-6 py-3 rounded-lg font-elegant font-semibold transition-all duration-200
                    ${selectedMode === modeData.mode
                      ? 'bg-wild-west-600 text-white shadow-lg'
                      : 'text-wild-west-300 hover:text-white hover:bg-wild-west-700/50'
                    }
                  `}
                >
                  <span className="mr-2">{modeData.icon}</span>
                  {modeData.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <motion.div
          key={selectedMode || 'overall'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Leaderboard
            gameMode={selectedMode || undefined}
            limit={20}
            showUserRank={!!user}
            userId={user?.id}
          />
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
            <div className="glass p-6 rounded-xl max-w-md mx-auto">
              <h3 className="font-western text-xl text-wild-west-300 mb-4">
                Your Legacy, {user.username}
              </h3>
              <UserStats userId={user.id} />
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
}

interface UserStatsProps {
  userId: string;
}

const UserStats: React.FC<UserStatsProps> = ({ userId }) => {
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

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="text-center">
        <p className="text-wild-west-400">Total Games</p>
        <p className="text-2xl font-bold text-wild-west-200">{stats.totalGames}</p>
      </div>
      <div className="text-center">
        <p className="text-wild-west-400">Best Score</p>
        <p className="text-2xl font-bold text-wild-west-200">{stats.bestScore?.toLocaleString()}</p>
      </div>
      <div className="text-center">
        <p className="text-wild-west-400">Avg Accuracy</p>
        <p className="text-xl font-bold text-wild-west-200">{stats.averageAccuracy?.toFixed(1)}%</p>
      </div>
      <div className="text-center">
        <p className="text-wild-west-400">Achievements</p>
        <p className="text-xl font-bold text-wild-west-200">{stats.achievements?.length || 0}</p>
      </div>
    </div>
  );
};

export default LeaderboardPage;
