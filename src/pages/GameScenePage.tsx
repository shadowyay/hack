import React, { useState, useEffect, useCallback } from 'react';
import '../assets/modernButton.css';
import { motion, AnimatePresence } from 'framer-motion';
import GameCanvas from '../components/game/GameCanvas';
import HUD from '../components/game/HUD';
import TrackingGame from '../components/game2/TrackingGame';
import ChaseGame from '../components/game2/ChaseGame';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useGame } from '../hooks/useGame';
import { useTimer } from '../hooks/useTimer';
import type { GameModeConfig, GameScenario } from '../types';
import { randomChoice } from '../utils';

interface GameScenePageProps {
  mode: GameModeConfig;
  onGameEnd: (result: { score: number; accuracy: number; reactionTime: number; strategyRating: number }) => void;
  onGoBack: () => void;
}

const GameScenePage: React.FC<GameScenePageProps> = ({
  mode,
  onGameEnd,
  onGoBack,
}) => {
  const { gameState, startGame, pauseGame, resumeGame } = useGame();
  const { startTimer, pauseTimer, resumeTimer } = useTimer();
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showScenarioIntro, setShowScenarioIntro] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<GameScenario | null>(null);

  // Generate scenario on mount
  useEffect(() => {
    const duelScenarios: GameScenario[] = [
      {
        id: 'town-square-duel',
        mode: 'duel',
        description: 'High noon in Dusty Creek. The town square is empty except for you and your opponent. The church bell chimes twelve times as tumbleweeds roll by. Draw fast or die faster.',
        difficulty: 'Medium',
        environment: {
          name: 'Town Square',
          background: 'dusty-town',
          ambientSound: 'town-ambient',
          weather: 'Clear',
          timeOfDay: 'Noon',
        },
        aiOpponent: {
          name: 'Black Hat McGraw',
          skill: 0.7,
          personality: 'Aggressive and unpredictable',
          reactionTime: 350,
          accuracy: 0.8,
          aggressiveness: 0.9,
        },
        objectives: [
          'Draw your weapon when "DRAW!" appears',
          'Shoot your opponent before they shoot you',
          'Maintain accuracy under pressure',
        ],
      },
      {
        id: 'canyon-standoff',
        mode: 'duel',
        description: 'A narrow canyon echoes with tension. Red rocks tower above as you face your most dangerous adversary yet. The wind carries whispers of past gunfighters who met their end here.',
        difficulty: 'Hard',
        environment: {
          name: 'Dead Man\'s Canyon',
          background: 'red-canyon',
          ambientSound: 'canyon-wind',
          weather: 'Dusty',
          timeOfDay: 'Dusk',
        },
        aiOpponent: {
          name: 'Canyon Kate',
          skill: 0.9,
          personality: 'Cold and calculating',
          reactionTime: 280,
          accuracy: 0.9,
          aggressiveness: 0.6,
        },
        objectives: [
          'React faster than 300ms',
          'Hit your target with 90%+ accuracy',
          'Don\'t let the intimidating atmosphere affect your aim',
        ],
      },
    ];

    const trackingScenarios: GameScenario[] = [
      {
        id: 'wilderness-hunt',
        mode: 'tracking',
        description: 'The wilderness calls to you, hunter. Track dangerous beasts across the frontier using your Eagle Eye ability. Read the signs, follow the tracks, and prove your skills as a legendary tracker.',
        difficulty: 'Medium',
        environment: {
          name: 'Wild Frontier',
          background: 'wilderness',
          ambientSound: 'nature-ambient',
          weather: 'Clear',
          timeOfDay: 'Morning',
        },
        aiOpponent: {
          name: 'Wild Beasts',
          skill: 0.6,
          personality: 'Unpredictable and evasive',
          reactionTime: 400,
          accuracy: 0.7,
          aggressiveness: 0.5,
        },
        objectives: [
          'Use Eagle Eye (E) to track animals',
          'Hunt down various wild beasts',
          'Score points by tracking and hunting',
          'Survive the wilderness encounter',
        ],
      },
    ];

    const chaseScenarios: GameScenario[] = [
      {
        id: 'outlaw-pursuit',
        mode: 'chase',
        description: 'Coming soon: Chase down notorious outlaws across the dusty frontier.',
        difficulty: 'Medium',
        environment: {
          name: 'Desert Plains',
          background: 'desert',
          ambientSound: 'chase-ambient',
          weather: 'Clear',
          timeOfDay: 'Dusk',
        },
        aiOpponent: {
          name: 'Wanted Outlaw',
          skill: 0.8,
          personality: 'Desperate and cunning',
          reactionTime: 320,
          accuracy: 0.8,
          aggressiveness: 0.7,
        },
        objectives: [
          'Chase down the outlaw',
          'Use strategy to corner your target',
          'Bring them to justice',
        ],
      },
    ];

    let scenarios: GameScenario[] = [];
    if (mode.mode === 'duel') {
      scenarios = duelScenarios;
    } else if (mode.mode === 'tracking') {
      scenarios = trackingScenarios;
    } else if (mode.mode === 'chase') {
      scenarios = chaseScenarios;
    }

    const scenario = scenarios.length > 0 ? randomChoice(scenarios) : null;
    setCurrentScenario(scenario);
  }, [mode.mode]);

  const togglePause = useCallback(() => {
    if (gameState.isPaused) {
      resumeGame();
      resumeTimer();
      setShowPauseMenu(false);
    } else {
      pauseGame();
      pauseTimer();
      setShowPauseMenu(true);
    }
  }, [gameState.isPaused, resumeGame, resumeTimer, pauseGame, pauseTimer]);

  // Handle pause
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && gameState.isPlaying) {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isPlaying, togglePause]);

  const handleStartGame = () => {
    if (currentScenario) {
      setShowScenarioIntro(false);
      startGame(mode.mode, currentScenario);
      startTimer();
    }
  };

  const handleQuitGame = useCallback(() => {
    onGoBack();
  }, [onGoBack]);

  // Listen for game end events from the Phaser game
  useEffect(() => {
    const handleGameEndEvent = (event: CustomEvent) => {
      onGameEnd(event.detail);
    };

    window.addEventListener('GAME_END', handleGameEndEvent as EventListener);
    return () => window.removeEventListener('GAME_END', handleGameEndEvent as EventListener);
  }, [onGameEnd]);

  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-western w-16 h-16 mx-auto mb-4" />
          <p className="text-white/70 font-elegant text-lg">
            Generating scenario...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-zinc-900 relative overflow-y-auto">
      {/* Scenario Introduction Modal */}
      <Modal
        isOpen={showScenarioIntro}
        onClose={() => setShowScenarioIntro(false)}
        title={currentScenario.environment.name}
        className="max-w-3xl"
      >
        <div className="space-y-6">
          {/* Scenario Description */}
          <div className="glass p-6">
            <h3 className="text-2xl font-western text-white mb-4 text-center">
              📜 The Scenario
            </h3>
            <p className="text-white/80 font-elegant text-lg leading-relaxed text-center italic">
              "{currentScenario.description}"
            </p>
          </div>

          {/* Environment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass p-4">
              <h4 className="font-western text-white mb-3">🌍 Environment</h4>
              <div className="space-y-2 text-sm font-elegant text-white/80">
                <div>Time: {currentScenario.environment.timeOfDay}</div>
                <div>Weather: {currentScenario.environment.weather}</div>
                <div>Difficulty: {currentScenario.difficulty}</div>
              </div>
            </div>

            <div className="glass p-4">
              <h4 className="font-western text-white mb-3">🤠 Opponent</h4>
              <div className="space-y-2 text-sm font-elegant text-white/80">
                <div className="font-bold">{currentScenario.aiOpponent.name}</div>
                <div>{currentScenario.aiOpponent.personality}</div>
                <div>Skill Level: {Math.round(currentScenario.aiOpponent.skill * 100)}%</div>
              </div>
            </div>
          </div>

          {/* Objectives */}
          <div className="glass p-4">
            <h4 className="font-western text-white mb-3">🎯 Objectives</h4>
            <ul className="space-y-2">
              {currentScenario.objectives.map((objective, index) => (
                <li key={index} className="flex items-center text-white/80 font-elegant">
                  <span className="text-white/60 mr-2">•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          {/* Start Button */}
          <div className="text-center pt-4">
            <Button
              variant="western"
              size="xl"
              onClick={handleStartGame}
              className="button-modern text-xl px-8 py-4"
            >
              🔫 BEGIN DUEL
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pause Menu */}
      <Modal
        isOpen={showPauseMenu}
        onClose={togglePause}
        title="Game Paused"
        className="max-w-md"
      >
        <div className="space-y-4 text-center">
          <p className="text-white/80 font-elegant">
            Take a breather, partner. The showdown will wait.
          </p>
          
          <div className="space-y-3">
            <Button
              variant="western"
              size="lg"
              onClick={togglePause}
              className="button-modern w-full"
            >
              ▶ Resume Game
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={handleQuitGame}
              className="button-modern w-full"
            >
              🚪 Quit to Menu
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-white/70 font-elegant text-sm">
              Press <kbd className="bg-white/10 px-2 py-1 rounded text-xs">ESC</kbd> to pause/resume
            </p>
          </div>
        </div>
      </Modal>

  {/* Game Canvas */}
  <div className="relative w-full" style={{ minHeight: '600px' }}>
        <AnimatePresence>
          {gameState.isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {mode.mode === 'tracking' ? (
                <TrackingGame />
              ) : mode.mode === 'chase' ? (
                <ChaseGame />
              ) : (
                <GameCanvas
                  mode={mode.mode}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Overlay - Only show for non-tracking games */}
        {gameState.isPlaying && mode.mode !== 'tracking' && <HUD />}

        {/* Pause Button */}
        {gameState.isPlaying && !gameState.isPaused && (
          <motion.div
            className="absolute top-4 right-4 z-50"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={togglePause}
              className="button-modern bg-black/50 backdrop-blur-sm border border-white/20"
            >
              ⏸ Pause
            </Button>
          </motion.div>
        )}

        {/* Pause Overlay */}
        {gameState.isPaused && gameState.isPlaying && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-6xl font-western text-white text-glow mb-4">
                PAUSED
              </h2>
              <p className="text-white/80 font-elegant text-lg">
                Press ESC to resume
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GameScenePage;
