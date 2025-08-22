import type { GameResult, PlayerStats, LeaderboardEntry } from '../types';

// Local Storage Keys
export const STORAGE_KEYS = {
  PLAYER_STATS: 'bounty_hunter_player_stats',
  GAME_SETTINGS: 'bounty_hunter_settings',
  LEADERBOARD: 'bounty_hunter_leaderboard',
  ACHIEVEMENTS: 'bounty_hunter_achievements',
} as const;

// Player Stats Management
export const getPlayerStats = (): PlayerStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading player stats:', error);
  }
  
  // Default stats
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    averageAccuracy: 0,
    averageReactionTime: 0,
    bestScore: 0,
    totalPlayTime: 0,
    achievements: [],
  };
};

export const savePlayerStats = (stats: PlayerStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving player stats:', error);
  }
};

export const updatePlayerStatsWithResult = (currentStats: PlayerStats, result: GameResult): PlayerStats => {
  const newStats = { ...currentStats };
  
  newStats.totalGames += 1;
  
  // Determine if it's a win (score > 70 as threshold)
  if (result.score >= 70) {
    newStats.wins += 1;
  } else {
    newStats.losses += 1;
  }
  
  // Update averages
  newStats.averageAccuracy = (
    (newStats.averageAccuracy * (newStats.totalGames - 1) + result.accuracy) / 
    newStats.totalGames
  );
  
  newStats.averageReactionTime = (
    (newStats.averageReactionTime * (newStats.totalGames - 1) + result.reactionTime) / 
    newStats.totalGames
  );
  
  // Update best score
  if (result.score > newStats.bestScore) {
    newStats.bestScore = result.score;
  }
  
  // Add play time
  newStats.totalPlayTime += result.duration;
  
  return newStats;
};

// Leaderboard Management
export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (stored) {
      const entries = JSON.parse(stored);
      // Convert date strings back to Date objects
      return entries.map((entry: LeaderboardEntry) => ({
        ...entry,
        date: new Date(entry.date),
      }));
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
  }
  
  return [];
};

export const addToLeaderboard = (entry: LeaderboardEntry): void => {
  try {
    const leaderboard = getLeaderboard();
    leaderboard.push(entry);
    
    // Sort by score (descending) and keep top 100
    leaderboard.sort((a, b) => b.score - a.score);
    const topEntries = leaderboard.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(topEntries));
  } catch (error) {
    console.error('Error saving to leaderboard:', error);
  }
};

// Time Formatting
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

// Score Calculation
export const calculateScore = (
  accuracy: number,
  reactionTime: number,
  strategyRating: number,
  timeBonus: number = 0
): number => {
  const accuracyScore = accuracy * 40; // Max 40 points
  const reactionScore = Math.max(0, 30 - (reactionTime / 100)); // Max 30 points (faster is better)
  const strategyScore = strategyRating * 20; // Max 20 points
  const timeBonusScore = timeBonus * 10; // Max 10 points
  
  return Math.round(accuracyScore + reactionScore + strategyScore + timeBonusScore);
};

// Random Utilities
export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomBetween(min, max + 1));
};

export const randomChoice = <T>(array: T[]): T => {
  return array[randomInt(0, array.length - 1)];
};

// Validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPlayerName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(name);
};

// Color Utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Animation Utilities
export const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export const easeOut = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

// Sound Management
export const playSound = (soundPath: string, volume: number = 1): void => {
  try {
    const audio = new Audio(soundPath);
    audio.volume = volume;
    audio.play().catch(error => {
      console.warn('Could not play sound:', error);
    });
  } catch (error) {
    console.warn('Error creating audio:', error);
  }
};

// Device Detection
export const isMobile = (): boolean => {
  return window.innerWidth <= 768;
};

export const isTablet = (): boolean => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktop = (): boolean => {
  return window.innerWidth > 1024;
};

// Performance Utilities
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as unknown as number;
  };
};

export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Achievement System
export const checkAchievements = (stats: PlayerStats, result: GameResult): string[] => {
  const newAchievements: string[] = [];
  
  // First Win
  if (stats.wins === 1 && !stats.achievements.includes('first_win')) {
    newAchievements.push('first_win');
  }
  
  // Perfect Accuracy
  if (result.accuracy === 100 && !stats.achievements.includes('perfect_accuracy')) {
    newAchievements.push('perfect_accuracy');
  }
  
  // Fast Draw (< 200ms reaction time)
  if (result.reactionTime < 200 && !stats.achievements.includes('fast_draw')) {
    newAchievements.push('fast_draw');
  }
  
  // Win Streak
  if (stats.wins >= 5 && !stats.achievements.includes('win_streak')) {
    newAchievements.push('win_streak');
  }
  
  // Veteran (100 games)
  if (stats.totalGames >= 100 && !stats.achievements.includes('veteran')) {
    newAchievements.push('veteran');
  }
  
  return newAchievements;
};
