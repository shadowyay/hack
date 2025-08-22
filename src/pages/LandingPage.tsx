import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

interface LandingPageProps {
  onStartTraining: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartTraining }) => {
  const titleVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: 'easeOut' as const,
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 1,
        ease: 'backOut' as const,
      },
    },
  };

  const dustParticles = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="dust-particle"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * 100 - 50],
        opacity: [0.6, 0],
      }}
      transition={{
        duration: Math.random() * 3 + 2,
        repeat: Infinity,
        repeatType: 'loop',
        delay: Math.random() * 2,
      }}
    />
  ));

  return (
  <div className="min-h-screen relative bg-vignette bg-grid">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        {dustParticles}
      </div>

      {/* Parallax background layers */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        {/* Hero imagery layers */}
        <img src="/assets/hero-silhouette.png" alt="silhouette" className="absolute bottom-0 right-0 opacity-20 max-w-[55%] pointer-events-none select-none" />
        <img src="/assets/hero-horse.png" alt="horse" className="absolute bottom-6 left-6 opacity-15 max-w-[35%] pointer-events-none select-none" />
      </div>

      {/* Mountains silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-64">
        <svg
          viewBox="0 0 1200 300"
          className="w-full h-full fill-black opacity-20"
          preserveAspectRatio="none"
        >
          <path d="M0,300 L0,200 L100,150 L200,180 L300,120 L400,160 L500,100 L600,140 L700,90 L800,130 L900,80 L1000,120 L1100,70 L1200,110 L1200,300 Z" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Main Title */}
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-western text-white drop-shadow mb-4">
            BOUNTY HUNTER'S
          </h1>
          <h1 className="text-5xl md:text-7xl font-western text-white/90 drop-shadow">
            TRAINING GROUND
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
          className="text-xl md:text-2xl font-elegant text-white/70 mb-12 max-w-2xl leading-relaxed"
        >
          Master the art of the quick draw, chase down outlaws, and track your prey
          in AI-driven scenarios designed to forge legendary bounty hunters.
        </motion.p>

        {/* Call to Action Button */}
        <motion.div
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
        >
          <Button
            variant="western"
            size="xl"
            onClick={onStartTraining}
            className="text-2xl px-12 py-6 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
          >
            🔫 START TRAINING
          </Button>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div className="text-center p-6 glass">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-western text-white mb-2">Lightning Fast Duels</h3>
            <p className="text-white/70 font-elegant text-sm">
              Test your reflexes in high-noon showdowns
            </p>
          </div>

          <div className="text-center p-6 glass">
            <div className="text-4xl mb-4">🐎</div>
            <h3 className="text-lg font-western text-white mb-2">Thrilling Chases</h3>
            <p className="text-white/70 font-elegant text-sm">
              Pursue outlaws across the frontier
            </p>
          </div>

          <div className="text-center p-6 glass">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-western text-white mb-2">Precise Tracking</h3>
            <p className="text-white/70 font-elegant text-sm">
              Hunt down targets with stealth and skill
            </p>
          </div>
        </motion.div>

        {/* Bottom decorative elements */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          <div className="text-white/60 text-2xl">⬇</div>
          <p className="text-white/60 font-elegant text-sm mt-2">Scroll to Begin</p>
        </motion.div>
      </div>

      {/* Atmospheric sounds indicator */}
      <motion.div
        className="absolute top-4 right-4 text-white/70"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-elegant">🔊</span>
          <span className="text-xs font-elegant">Desert Winds</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
