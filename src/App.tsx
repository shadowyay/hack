import React, { useState } from 'react';
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

  return (
    <GameProvider>
  <div className="App bg-vignette bg-grid min-h-screen">
        {currentState === 'landing' && (
          <LandingPage onStartTraining={handleStartTraining} />
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
