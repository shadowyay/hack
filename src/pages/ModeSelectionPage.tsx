import React from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import type { GameModeConfig } from '../types';

interface ModeSelectionPageProps {
  onSelectMode: (mode: GameModeConfig) => void;
  onGoBack: () => void;
}

const ModeSelectionPage: React.FC<ModeSelectionPageProps> = ({
  onSelectMode,
  onGoBack,
}) => {
  const gameModes: GameModeConfig[] = [
    {
      mode: 'duel',
      title: 'High Noon Duel',
      description: 'Face off against AI opponents in lightning-fast shootouts. Test your reflexes and accuracy in classic Wild West standoffs.',
      icon: '🔫',
      color: 'from-red-600 to-red-800',
      unlocked: true,
      bestScore: 850,
    },
    {
      mode: 'chase',
      title: 'Outlaw Chase',
      description: 'Pursue dangerous criminals across the frontier. Use strategy and quick thinking to corner your targets.',
      icon: '🐎',
      color: 'from-orange-600 to-orange-800',
      unlocked: true, // Unlocked for testing
    },
    {
      mode: 'tracking',
      title: 'Animal Tracking',
      description: 'Track wild animals across the frontier. Use Eagle Eye to spot tracks and hunt dangerous beasts in the wilderness.',
      icon: '🦌',
      color: 'from-green-600 to-green-800',
      unlocked: true, // Unlocked - this will be the RDR2 tracking game
      bestScore: 1250,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateY: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-stone-900 to-zinc-900 relative overflow-y-auto">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-western-pattern opacity-5" />
      
      {/* Dust particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div
            key={i}
            className="dust-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              repeatType: 'loop',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

  <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Scroll to Begin Button for scenario page */}
        <motion.button
          type="button"
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center focus:outline-none z-50"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
          }}
          onClick={() => {
            const nextSection = document.querySelector('#scenario-content-scroll-target');
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          aria-label="Scroll to scenario content"
        >
          <div className="text-white/60 text-2xl">⬇</div>
          <p className="text-white/60 font-elegant text-sm mt-2">Scroll to Begin</p>
        </motion.button>
  {/* Scroll target for scenario scroll button */}
  <div id="scenario-content-scroll-target" style={{ height: '1px' }} />
  {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-western text-white drop-shadow mb-4">
            CHOOSE YOUR TRAINING
          </h1>
          <p className="text-xl text-white/70 font-elegant max-w-2xl mx-auto">
            Select a training discipline to master the skills of a legendary bounty hunter
          </p>
        </motion.div>

        {/* Mode Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {gameModes.map((mode) => (
            <motion.div key={mode.mode} variants={cardVariants}>
              <Card
                title={mode.title}
                onClick={mode.unlocked ? () => onSelectMode(mode) : undefined}
                hover={mode.unlocked}
                className={`relative overflow-hidden ${
                  mode.unlocked 
                    ? 'cursor-pointer transform hover:scale-105 transition-transform duration-300' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-20`} />
                
                {/* Lock overlay for locked modes */}
                {!mode.unlocked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="text-white font-elegant text-sm">
                        Complete previous modes to unlock
                      </p>
                    </div>
                  </div>
                )}

                <div className="relative z-20 p-6">
                  {/* Icon */}
                  <div className="text-6xl mb-4 text-center">{mode.icon}</div>
                  
                  {/* Description */}
                  <p className="text-white/80 font-elegant mb-4 leading-relaxed">
                    {mode.description}
                  </p>

                  {/* Best Score */}
                  {mode.bestScore && mode.unlocked && (
          <div className="mt-4 p-3 glass">
                      <div className="flex justify-between items-center">
            <span className="text-white/70 font-elegant text-sm">Best Score:</span>
            <span className="text-white font-western text-lg">
                          {mode.bestScore.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Difficulty indicators */}
                  <div className="mt-4 flex justify-center space-x-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (mode.mode === 'duel' ? 1 : mode.mode === 'chase' ? 2 : 3)
                            ? 'bg-orange-400'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Hover glow effect */}
                {mode.unlocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Back Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button
            variant="secondary"
            size="lg"
            onClick={onGoBack}
            className="shadow-lg hover:shadow-xl"
          >
            ← Back to Main Menu
          </Button>
        </motion.div>

        {/* Tips */}
        <motion.div
          className="mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="glass p-6">
            <h3 className="text-xl font-western text-white mb-4 text-center">
              🎯 Training Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <h4 className="font-elegant text-white/80 mb-2">⚡ Speed</h4>
                <p className="text-white/70 text-sm font-elegant">
                  Quick reflexes win duels. Practice your draw speed daily.
                </p>
              </div>
              <div>
                <h4 className="font-elegant text-white/80 mb-2">🎯 Accuracy</h4>
                <p className="text-white/70 text-sm font-elegant">
                  One shot, one kill. Make every bullet count.
                </p>
              </div>
              <div>
                <h4 className="font-elegant text-white/80 mb-2">🧠 Strategy</h4>
                <p className="text-white/70 text-sm font-elegant">
                  Think ahead. Anticipate your opponent's moves.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModeSelectionPage;
