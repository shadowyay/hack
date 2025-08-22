import React, { useState, useRef, useEffect } from 'react';
import './assets/volumeSlider.css';
import { GameProvider } from './context/GameContext';
import LandingPage from './pages/LandingPage';
import ModeSelectionPage from './pages/ModeSelectionPage';
import GameScenePage from './pages/GameScenePage';
import ResultsPage from './pages/ResultsPage';
import AuthPage from './pages/AuthPage';
import LeaderboardPage from './pages/LeaderboardPage';
import type { GameModeConfig, GameResult } from './types';

type AppState = 
  | 'landing'
  | 'auth'
  | 'mode-selection'
  | 'game'
  | 'results'
  | 'leaderboard';

interface User {
  id: string;
  username: string;
  email: string;
}

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [selectedMode, setSelectedMode] = useState<GameModeConfig | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing login on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleStartTraining = () => {
    if (user) {
      setCurrentState('mode-selection');
    } else {
      setCurrentState('auth');
    }
    // Play music on first user interaction
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        // If blocked, set up a one-time fallback
        const resumeAudio = () => {
          audioRef.current?.play();
          setIsPlaying(true);
          document.removeEventListener('click', resumeAudio);
        };
        document.addEventListener('click', resumeAudio);
      });
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentState('mode-selection');
  };

  const handleShowLeaderboard = () => {
    setCurrentState('leaderboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentState('landing');
    setSelectedMode(null);
    setGameResult(null);
  };

  const handleSelectMode = (mode: GameModeConfig) => {
    setSelectedMode(mode);
    setCurrentState('game');
  };

  const handleGameEnd = (result: { score: number; accuracy: number; reactionTime: number; strategyRating: number }) => {
    if (!selectedMode) return;

    // Create full game result
    const gameResult: GameResult = {
      id: `game_${Date.now()}`,
      mode: selectedMode.mode,
      score: result.score,
      accuracy: result.accuracy,
      reactionTime: result.reactionTime,
      strategyRating: result.strategyRating,
      timestamp: new Date(),
      duration: 30000, // Placeholder - should be actual game duration
    };

    // TODO: Save game result to backend
    if (user) {
      saveGameResult(gameResult);
    }

    setGameResult(gameResult);
    setCurrentState('results');
  };

  const saveGameResult = async (result: GameResult) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('http://localhost:3001/performance/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(result)
      });
    } catch (error) {
      console.error('Failed to save game result:', error);
    }
  };

  const handlePlayAgain = () => {
    if (selectedMode) {
      setCurrentState('game');
    }
  };

  const handleMainMenu = () => {
    setCurrentState('landing');
    setSelectedMode(null);
    setGameResult(null);
  };

  const handleGoBack = () => {
    switch (currentState) {
      case 'auth':
        setCurrentState('landing');
        break;
      case 'leaderboard':
        setCurrentState('landing');
        break;
      case 'mode-selection':
        setCurrentState('landing');
        break;
      case 'game':
        setCurrentState('mode-selection');
        setSelectedMode(null);
        break;
      case 'results':
        setCurrentState('mode-selection');
        setGameResult(null);
        break;
      default:
        setCurrentState('landing');
    }
  };

  const handleNextMode = () => {
    // Logic to unlock and select next mode
    setCurrentState('mode-selection');
    setGameResult(null);
  };

  // Background music logic
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <GameProvider>
      {/* Background Music (RDR2 soundtrack, replace src with your own if needed) */}
      <audio
        ref={audioRef}
        src="/country-cowboy-texas-music-346559.mp3"
        autoPlay
        loop
        style={{ display: 'none' }}
      />
      <div className="App bg-vignette bg-grid min-h-screen overflow-y-auto">
        {/* User Info & Volume Control UI */}
        <div style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* User Info */}
          {user && (
            <div style={{ background: 'rgba(0,0,0,0.7)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="text-wild-west-300 font-elegant text-sm">Welcome, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 text-xs underline"
              >
                Logout
              </button>
            </div>
          )}
          
          {/* Volume Control */}
          <div className="volume-control-hover-group" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            <button
              className="btn-western"
              style={{ fontSize: 22, padding: '0.3rem 0.7rem' }}
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
            >
              {isPlaying ? '🎵' : '🔇'}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="volume-slider-modern volume-slider-hideable"
              aria-label="Music volume"
            />
          </div>
        </div>

        {currentState === 'landing' && (
          <>
            <LandingPage 
              onStartTraining={handleStartTraining}
              onShowLeaderboard={handleShowLeaderboard}
            />
            <div id="main-content-scroll-target" style={{ height: '1px' }} />
          </>
        )}

        {currentState === 'auth' && (
          <AuthPage 
            onLogin={handleLogin}
            onGoBack={handleGoBack}
          />
        )}

        {currentState === 'mode-selection' && (
          <ModeSelectionPage 
            onSelectMode={handleSelectMode}
            onGoBack={handleGoBack}
          />
        )}

        {currentState === 'game' && selectedMode && (
          <GameScenePage
            mode={selectedMode}
            onGameEnd={handleGameEnd}
            onGoBack={handleGoBack}
          />
        )}

        {currentState === 'results' && gameResult && (
          <ResultsPage
            result={gameResult}
            onPlayAgain={handlePlayAgain}
            onMainMenu={handleMainMenu}
            onNextMode={handleNextMode}
          />
        )}

        {currentState === 'leaderboard' && (
          <LeaderboardPage 
            onGoBack={handleGoBack}
          />
        )}
      </div>
    </GameProvider>
  );
};

export default App;
