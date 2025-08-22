// Game Types
export interface GameResult {
  id: string;
  mode: GameMode;
  score: number;
  accuracy: number;
  reactionTime: number;
  strategyRating: number;
  timestamp: Date;
  duration: number;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  averageAccuracy: number;
  averageReactionTime: number;
  bestScore: number;
  totalPlayTime: number;
  achievements: string[];
}

export interface GameScenario {
  id: string;
  mode: GameMode;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  environment: Environment;
  aiOpponent: AIOpponent;
  objectives: string[];
}

export interface AIOpponent {
  name: string;
  skill: number;
  personality: string;
  reactionTime: number;
  accuracy: number;
  aggressiveness: number;
}

export interface Environment {
  name: string;
  background: string;
  ambientSound: string;
  weather: 'Clear' | 'Dusty' | 'Stormy' | 'Foggy';
  timeOfDay: 'Dawn' | 'Morning' | 'Noon' | 'Dusk' | 'Night';
}

// UI Types
export interface ThemeConfig {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface SoundSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  ambientVolume: number;
  muted: boolean;
}

export interface GameSettings {
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  theme: ThemeConfig;
  sound: SoundSettings;
  controls: ControlSettings;
}

export interface ControlSettings {
  shootKey: string;
  moveKeys: {
    up: string;
    down: string;
    left: string;
    right: string;
  };
  sensitivity: number;
}

// Game Modes
export type GameMode = 'duel' | 'chase' | 'tracking';

export interface GameModeConfig {
  mode: GameMode;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  bestScore?: number;
}

// UI Component Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'western' | 'saloon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  onClick?: () => void;
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

// HUD Types
export interface HUDStats {
  health: number;
  ammo: number;
  score: number;
  time: number;
  accuracy: number;
  streak: number;
}

export interface Timer {
  minutes: number;
  seconds: number;
  milliseconds: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  mode: GameMode;
  difficulty: string;
  date: Date;
  accuracy: number;
  reactionTime: number;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
  loop?: boolean;
}

// Game State Types
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameMode: GameMode | null;
  currentScenario: GameScenario | null;
  stats: HUDStats;
  timer: Timer;
  results: GameResult | null;
}

// Context Types
export interface GameContextType {
  gameState: GameState;
  playerStats: PlayerStats;
  settings: GameSettings;
  updateGameState: (state: Partial<GameState>) => void;
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startGame: (mode: GameMode, scenario: GameScenario) => void;
  endGame: (result: GameResult) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
}

// Event Types
export interface GameEvent {
  type: 'SHOOT' | 'HIT' | 'MISS' | 'RELOAD' | 'MOVE' | 'PAUSE' | 'RESUME';
  timestamp: number;
  data?: Record<string, unknown>;
}

// Canvas/Phaser Types
export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
}

export interface Bullet extends GameObject {
  damage: number;
  speed: number;
  owner: 'player' | 'ai';
}

export interface Character extends GameObject {
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  reloadTime: number;
  accuracy: number;
  isReloading: boolean;
  isDead: boolean;
}
