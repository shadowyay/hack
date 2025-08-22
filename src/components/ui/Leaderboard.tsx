import React, { useState, useEffect, useRef } from 'react';
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
  timestamp?: Date;
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
  compact?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = React.memo(({
  gameMode,
  limit = 10,
  showUserRank = false,
  userId,
  className = '',
  compact = false
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchedRef = useRef(false);
  const currentGameModeRef = useRef(gameMode);
  const lastFetchTimeRef = useRef(0);

  useEffect(() => {
    // Reset if game mode changed
    if (currentGameModeRef.current !== gameMode) {
      fetchedRef.current = false;
      currentGameModeRef.current = gameMode;
    }
    
    // Don't fetch if already fetched for this mode within the last 30 seconds
    const now = Date.now();
    if (fetchedRef.current && (now - lastFetchTimeRef.current) < 30000) {
      setLoading(false);
      return;
    }
    
    // Try to load from cache first
    const cacheKey = `leaderboard_${gameMode || 'overall'}_${limit}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached && !fetchedRef.current) {
      try {
        const cachedData = JSON.parse(cached);
        if (cachedData.timestamp && (now - cachedData.timestamp) < 60000) { // 1 minute cache
          setLeaderboard(cachedData.data);
          setLoading(false);
          fetchedRef.current = true;
          return;
        }
      } catch {
        // Ignore cache errors
      }
    }
    
    let isMounted = true;
    
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching leaderboard for mode:', gameMode);
        const endpoint = gameMode 
          ? `http://localhost:3001/leaderboard/${gameMode}?limit=${limit}`
          : `http://localhost:3001/leaderboard?limit=${limit}`;
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (!isMounted) return;
        
        if (response.ok) {
          setLeaderboard(data);
          setError('');
          fetchedRef.current = true;
          lastFetchTimeRef.current = now;
          
          // Cache the result
          localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: now
          }));
        } else {
          setError(data.error || 'Failed to fetch leaderboard');
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
        if (isMounted) {
          setError('Network error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();
    
    return () => {
      isMounted = false;
    };
  }, [gameMode, limit]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserRank = async () => {
      if (!userId || !showUserRank) return;
      
      try {
        console.log('Fetching user rank for:', userId, gameMode);
        const endpoint = gameMode 
          ? `http://localhost:3001/leaderboard/user/${userId}/${gameMode}`
          : `http://localhost:3001/leaderboard/user/${userId}`;
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (!isMounted) return;
        
        if (response.ok) {
          setUserRank(data);
        }
      } catch (err) {
        console.error('Failed to fetch user rank:', err);
      }
    };

    fetchUserRank();
    
    return () => {
      isMounted = false;
    };
  }, [showUserRank, userId, gameMode]);

  const handleRefresh = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      fetchedRef.current = false; // Reset fetch flag
      lastFetchTimeRef.current = 0; // Reset time
      
      // Clear cache
      const cacheKey = `leaderboard_${gameMode || 'overall'}_${limit}`;
      localStorage.removeItem(cacheKey);
      
      console.log('Manual refresh for mode:', gameMode);
      const endpoint = gameMode 
        ? `http://localhost:3001/leaderboard/${gameMode}?limit=${limit}`
        : `http://localhost:3001/leaderboard?limit=${limit}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        setLeaderboard(data);
        setError('');
        fetchedRef.current = true;
        lastFetchTimeRef.current = Date.now();
        
        // Cache the new result
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } else {
        setError(data.error || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [gameMode, limit]);

  const getGameModeInfo = (mode: GameMode) => {
    switch (mode) {
      case 'duel':
        return {
          title: 'Duel Masters',
          subtitle: 'Fast Draw Champions',
          emoji: '🤠',
          color: 'from-red-600/50 to-orange-600/50',
          borderColor: 'border-red-500/50'
        };
      case 'chase':
        return {
          title: 'Chase Champions',
          subtitle: 'High-Speed Pursuit Leaders',
          emoji: '🐎',
          color: 'from-blue-600/50 to-cyan-600/50',
          borderColor: 'border-blue-500/50'
        };
      case 'tracking':
        return {
          title: 'Tracking Legends',
          subtitle: 'Precision Masters',
          emoji: '🎯',
          color: 'from-green-600/50 to-emerald-600/50',
          borderColor: 'border-green-500/50'
        };
      default:
        return {
          title: 'Leaderboard',
          subtitle: 'Top Players',
          emoji: '🏆',
          color: 'from-wild-west-600/50 to-wild-west-700/50',
          borderColor: 'border-wild-west-500/50'
        };
    }
  };

  const gameModeInfo = gameMode ? getGameModeInfo(gameMode) : {
    title: 'Leaderboard',
    subtitle: 'Top Players',
    emoji: '🏆',
    color: 'from-wild-west-600/50 to-wild-west-700/50',
    borderColor: 'border-wild-west-500/50'
  };

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
      <div className={`glass ${compact ? 'p-4' : 'p-6'} rounded-xl ${className}`}>
        <div className="flex items-center justify-center">
          <div className="spinner-western w-8 h-8"></div>
          <span className="ml-2 text-wild-west-300 font-elegant">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass ${compact ? 'p-4' : 'p-6'} rounded-xl ${className}`}>
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
      className={`glass ${compact ? 'p-4' : 'p-6'} rounded-xl ${className}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-6'}`}>
        <div>
          <h3 className={`font-western ${compact ? 'text-xl' : 'text-2xl'} text-wild-west-300 text-glow`}>
            {gameModeInfo.emoji} {gameModeInfo.title}
          </h3>
          {!compact && (
            <p className="text-sm text-wild-west-400 font-elegant mt-1">
              {gameModeInfo.subtitle}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className={`text-wild-west-400 hover:text-wild-west-300 ${compact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2'} rounded-lg hover:bg-wild-west-700/30 transition-colors`}
        >
          🔄 {compact ? '' : 'Refresh'}
        </button>
      </div>

      {/* Game Mode Stats Summary */}
      {!compact && gameMode && leaderboard.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className={`bg-gradient-to-r ${gameModeInfo.color} border ${gameModeInfo.borderColor} rounded-lg p-4`}>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-wild-west-200 font-bold text-lg">
                  {Math.max(...leaderboard.map(e => e.score)).toLocaleString()}
                </div>
                <div className="text-wild-west-400 text-xs">Highest Score</div>
              </div>
              <div>
                <div className="text-wild-west-200 font-bold text-lg">
                  {Math.max(...leaderboard.map(e => e.accuracy)).toFixed(1)}%
                </div>
                <div className="text-wild-west-400 text-xs">Best Accuracy</div>
              </div>
              <div>
                <div className="text-wild-west-200 font-bold text-lg">
                  {Math.min(...leaderboard.map(e => e.reactionTime)).toFixed(0)}ms
                </div>
                <div className="text-wild-west-400 text-xs">Fastest Time</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* User Rank (if shown) */}
      {showUserRank && userRank && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`bg-gradient-to-r ${gameModeInfo.color} border ${gameModeInfo.borderColor} rounded-lg ${compact ? 'p-3 mb-3' : 'p-4 mb-4'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-wild-west-200 font-elegant text-sm">Your Rank in {gameModeInfo.title}:</span>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-wild-west-3 00 ${compact ? 'text-base' : 'text-lg'}`}>{getRankIcon(userRank.rank)}</span>
                <div>
                  <span className={`text-wild-west-100 font-bold ${compact ? 'text-base' : 'text-lg'}`}>{userRank.score} pts</span>
                  {gameMode && (
                    <div className="text-xs text-wild-west-300">
                      {gameMode === 'duel' && 'Fast Draw Score'}
                      {gameMode === 'chase' && 'Pursuit Score'}
                      {gameMode === 'tracking' && 'Tracking Score'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`${compact ? 'text-xl' : 'text-2xl'}`}>{gameModeInfo.emoji}</div>
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
                flex items-center justify-between ${compact ? 'p-2' : 'p-3'} rounded-lg transition-all duration-200
                ${entry.rank <= 3 
                  ? `bg-gradient-to-r ${gameModeInfo.color} border ${gameModeInfo.borderColor}` 
                  : 'bg-wild-west-800/20 border border-wild-west-700/30 hover:bg-wild-west-700/30'
                }
              `}
            >
              {/* Rank and Username */}
              <div className="flex items-center gap-3">
                <span className={`
                  ${compact ? 'text-base' : 'text-lg'} font-bold
                  ${entry.rank <= 3 ? 'text-wild-west-200' : 'text-wild-west-400'}
                `}>
                  {getRankIcon(entry.rank)}
                </span>
                <div>
                  <p className={`
                    font-elegant font-semibold ${compact ? 'text-sm' : ''}
                    ${entry.rank <= 3 ? 'text-wild-west-100' : 'text-wild-west-200'}
                  `}>
                    {entry.username}
                  </p>
                  {!compact && gameMode && (
                    <div className="flex gap-3 text-xs text-wild-west-400">
                      <span title="Accuracy">🎯 {entry.accuracy.toFixed(1)}%</span>
                      <span title="Reaction Time">⚡ {formatTime(entry.reactionTime)}</span>
                      {entry.timestamp && (
                        <span title="Date Achieved">📅 {new Date(entry.timestamp).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className={`
                  font-bold ${compact ? 'text-base' : 'text-lg'}
                  ${entry.rank <= 3 ? 'text-wild-west-200' : 'text-wild-west-300'}
                `}>
                  {entry.score.toLocaleString()}
                </p>
                {!compact && <p className="text-xs text-wild-west-500">points</p>}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      {!compact && (
        <div className="mt-4 text-center text-xs text-wild-west-500">
          <div>Showing top {Math.min(limit, leaderboard.length)} {gameModeInfo.title.toLowerCase()}</div>
          {gameMode && (
            <div className="mt-1 text-wild-west-600">
              {gameMode === 'duel' && 'Fastest draw wins • Accuracy and speed matter'}
              {gameMode === 'chase' && 'High-speed pursuit scores • Endurance and precision'}
              {gameMode === 'tracking' && 'Target tracking mastery • Accuracy is everything'}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
});

export default Leaderboard;
