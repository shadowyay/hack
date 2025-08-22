import React, { createContext, useReducer, useEffect } from 'react';
import type { 
  GameContextType, 
  GameState, 
  PlayerStats, 
  GameSettings, 
  GameMode, 
  GameScenario, 
  GameResult,
  ThemeConfig,
  SoundSettings,
  ControlSettings
} from '../types';
import { getPlayerStats, savePlayerStats, updatePlayerStatsWithResult, checkAchievements } from '../utils';

// Initial States
const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  gameMode: null,
  currentScenario: null,
  stats: {
    health: 100,
    ammo: 6,
    score: 0,
    time: 0,
    accuracy: 0,
    streak: 0,
  },
  timer: {
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  },
  results: null,
};

const initialTheme: ThemeConfig = {
  isDark: false,
  primaryColor: '#d97a3e',
  secondaryColor: '#b45f34',
  fontFamily: 'Cinzel',
};

const initialSoundSettings: SoundSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.7,
  musicVolume: 0.5,
  ambientVolume: 0.3,
  muted: false,
};

const initialControlSettings: ControlSettings = {
  shootKey: 'Space',
  moveKeys: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
  },
  sensitivity: 1.0,
};

const initialSettings: GameSettings = {
  difficulty: 'Medium',
  theme: initialTheme,
  sound: initialSoundSettings,
  controls: initialControlSettings,
};

// Action Types
type GameAction =
  | { type: 'START_GAME'; payload: { mode: GameMode; scenario: GameScenario } }
  | { type: 'END_GAME'; payload: GameResult }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_STATS'; payload: Partial<GameState['stats']> }
  | { type: 'UPDATE_TIMER'; payload: Partial<GameState['timer']> }
  | { type: 'UPDATE_GAME_STATE'; payload: Partial<GameState> };

type PlayerStatsAction =
  | { type: 'UPDATE_PLAYER_STATS'; payload: Partial<PlayerStats> }
  | { type: 'LOAD_PLAYER_STATS'; payload: PlayerStats }
  | { type: 'RESET_PLAYER_STATS' };

type SettingsAction =
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'UPDATE_THEME'; payload: Partial<ThemeConfig> }
  | { type: 'UPDATE_SOUND'; payload: Partial<SoundSettings> }
  | { type: 'UPDATE_CONTROLS'; payload: Partial<ControlSettings> }
  | { type: 'LOAD_SETTINGS'; payload: GameSettings };

// Reducers
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
        gameMode: action.payload.mode,
        currentScenario: action.payload.scenario,
        stats: {
          ...initialGameState.stats,
        },
        timer: {
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        },
        results: null,
      };

    case 'END_GAME':
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        results: action.payload,
      };

    case 'PAUSE_GAME':
      return {
        ...state,
        isPaused: true,
      };

    case 'RESUME_GAME':
      return {
        ...state,
        isPaused: false,
      };

    case 'RESET_GAME':
      return {
        ...initialGameState,
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload,
        },
      };

    case 'UPDATE_TIMER':
      return {
        ...state,
        timer: {
          ...state.timer,
          ...action.payload,
        },
      };

    case 'UPDATE_GAME_STATE':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

const playerStatsReducer = (state: PlayerStats, action: PlayerStatsAction): PlayerStats => {
  switch (action.type) {
    case 'UPDATE_PLAYER_STATS':
      return {
        ...state,
        ...action.payload,
      };

    case 'LOAD_PLAYER_STATS':
      return action.payload;

    case 'RESET_PLAYER_STATS':
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

    default:
      return state;
  }
};

const settingsReducer = (state: GameSettings, action: SettingsAction): GameSettings => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        ...action.payload,
      };

    case 'UPDATE_THEME':
      return {
        ...state,
        theme: {
          ...state.theme,
          ...action.payload,
        },
      };

    case 'UPDATE_SOUND':
      return {
        ...state,
        sound: {
          ...state.sound,
          ...action.payload,
        },
      };

    case 'UPDATE_CONTROLS':
      return {
        ...state,
        controls: {
          ...state.controls,
          ...action.payload,
        },
      };

    case 'LOAD_SETTINGS':
      return action.payload;

    default:
      return state;
  }
};

// Context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider Component
interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, gameDispatch] = useReducer(gameReducer, initialGameState);
  const [playerStats, playerStatsDispatch] = useReducer(playerStatsReducer, getPlayerStats());
  const [settings, settingsDispatch] = useReducer(settingsReducer, initialSettings);

  // Load player stats on mount
  useEffect(() => {
    const stats = getPlayerStats();
    playerStatsDispatch({ type: 'LOAD_PLAYER_STATS', payload: stats });
  }, []);

  // Save player stats when they change
  useEffect(() => {
    savePlayerStats(playerStats);
  }, [playerStats]);

  // Context value
  const contextValue: GameContextType = {
    gameState,
    playerStats,
    settings,

    updateGameState: (state: Partial<GameState>) => {
      gameDispatch({ type: 'UPDATE_GAME_STATE', payload: state });
    },

    updatePlayerStats: (stats: Partial<PlayerStats>) => {
      playerStatsDispatch({ type: 'UPDATE_PLAYER_STATS', payload: stats });
    },

    updateSettings: (newSettings: Partial<GameSettings>) => {
      settingsDispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
    },

    startGame: (mode: GameMode, scenario: GameScenario) => {
      gameDispatch({ type: 'START_GAME', payload: { mode, scenario } });
    },

    endGame: (result: GameResult) => {
      gameDispatch({ type: 'END_GAME', payload: result });
      
      // Update player stats with the result
      const updatedStats = updatePlayerStatsWithResult(playerStats, result);
      
      // Check for new achievements
      const newAchievements = checkAchievements(updatedStats, result);
      if (newAchievements.length > 0) {
        updatedStats.achievements = [...updatedStats.achievements, ...newAchievements];
      }
      
      playerStatsDispatch({ type: 'UPDATE_PLAYER_STATS', payload: updatedStats });
    },

    pauseGame: () => {
      gameDispatch({ type: 'PAUSE_GAME' });
    },

    resumeGame: () => {
      gameDispatch({ type: 'RESUME_GAME' });
    },

    resetGame: () => {
      gameDispatch({ type: 'RESET_GAME' });
    },
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Export context for testing purposes
export { GameContext };
