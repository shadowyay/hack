import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGame';
import { formatTime } from '../../utils';

interface HUDProps {
  onShowStats?: () => void;
}

const HUD: React.FC<HUDProps> = ({ onShowStats }) => {
  const { gameState, updateGameState } = useGame();

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      updateGameState({ stats: e.detail });
    };
    
    window.addEventListener('GAME_STATS', handler as EventListener);
    return () => window.removeEventListener('GAME_STATS', handler as EventListener);
  }, [updateGameState]);
  const { stats, timer } = gameState;

  const hudVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="absolute top-4 left-4 right-4 z-40 pointer-events-none"
      variants={hudVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-start">
        {/* Left Side - Player Stats */}
        <div className="hud-overlay rounded-lg p-4 pointer-events-auto">
          <div className="space-y-2">
            {/* Health Bar */}
            <div className="flex items-center space-x-3">
              <span className="text-white font-elegant text-sm w-16">Health</span>
              <div className="w-32 h-3 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full progress-bar"
                  style={{
                    background: stats.health > 50 
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                      : stats.health > 25 
                        ? 'linear-gradient(90deg, #eab308, #ca8a04)'
                        : 'linear-gradient(90deg, #ef4444, #dc2626)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.health}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-white font-bold text-sm min-w-[40px]">
                {stats.health}%
              </span>
            </div>

            {/* Ammo */}
            <div className="flex items-center space-x-3">
              <span className="text-white font-elegant text-sm w-16">Ammo</span>
              <div className="flex space-x-1">
                {Array.from({ length: 10 }).map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-6 rounded-sm ${
                      index < stats.ammo 
                        ? 'bg-gradient-to-t from-wild-west-600 to-wild-west-400' 
                        : 'bg-black/30'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>
              <span className="text-white font-bold text-sm">
                {stats.ammo}/10
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center space-x-3">
              <span className="text-white font-elegant text-sm w-16">Score</span>
              <span className="text-wild-west-300 font-western text-lg text-glow">
                {stats.score.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Center - Timer */}
        <div className="hud-overlay rounded-lg p-4 pointer-events-auto">
          <div className="text-center">
            <div className="text-white font-elegant text-sm mb-1">Time</div>
            <div className="text-wild-west-300 font-western text-xl text-glow">
              {formatTime(timer.minutes * 60000 + timer.seconds * 1000 + timer.milliseconds)}
            </div>
          </div>
        </div>

        {/* Right Side - Performance Stats */}
        <div className="hud-overlay rounded-lg p-4 pointer-events-auto">
          <div className="space-y-2 text-right">
            {/* Accuracy */}
            <div className="flex items-center justify-end space-x-3">
              <span className="text-wild-west-300 font-western text-lg text-glow">
                {stats.accuracy.toFixed(1)}%
              </span>
              <span className="text-white font-elegant text-sm w-20">Accuracy</span>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-end space-x-3">
              <span className="text-wild-west-300 font-western text-lg text-glow">
                {stats.streak}
              </span>
              <span className="text-white font-elegant text-sm w-20">Streak</span>
            </div>

            {/* Hits Indicator */}
            {stats.streak > 0 && (
              <motion.div
                className="text-green-400 font-bold text-sm"
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                🎯 Hot Streak!
              </motion.div>
            )}

            {/* Stats Button */}
            {onShowStats && (
              <button
                onClick={onShowStats}
                className="bg-wild-west-600/80 hover:bg-wild-west-500/80 text-white px-3 py-1 rounded-lg text-sm font-elegant transition-all duration-200 mt-2"
              >
                📊 Stats
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Additional HUD Elements */}
      <div className="mt-4 flex justify-center">
        {/* Crosshair indicator when aiming */}
        <motion.div
          className="w-8 h-8 pointer-events-none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
            <div className="absolute top-1/2 left-1/2 w-4 h-[1px] bg-red-500 transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-[1px] h-4 bg-red-500 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HUD;
