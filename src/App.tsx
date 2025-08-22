import React, { useState, useRef, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import LandingPage from './pages/LandingPage';
import ModeSelectionPage from './pages/ModeSelectionPage';
import GameScenePage from './pages/GameScenePage';
import ResultsPage from './pages/ResultsPage';
import type { GameModeConfig, GameResult } from './types';

type AppState = 
  | 'landing'
  | 'mode-selection'
  | 'game'
  | 'results';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [selectedMode, setSelectedMode] = useState<GameModeConfig | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const handleStartTraining = () => {
    setCurrentState('mode-selection');
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

    setGameResult(gameResult);
    setCurrentState('results');
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
        {/* Volume Control UI */}
        <div style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 1000, background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
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
            style={{ width: 120 }}
            aria-label="Music volume"
          />
        </div>
        {currentState === 'landing' && (
          <>
            <LandingPage onStartTraining={handleStartTraining} />
            <div id="main-content-scroll-target" style={{ height: '1px' }} />
          </>
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
      </div>
    </GameProvider>
  );
};

export default App;
