import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { formatTime, calculateScore } from '../utils';
import type { GameResult } from '../types';

interface ResultsPageProps {
  result: GameResult;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onNextMode?: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  result,
  onPlayAgain,
  onMainMenu,
  onNextMode,
}) => {
  const [animatedStats, setAnimatedStats] = useState({
    score: 0,
    accuracy: 0,
    reactionTime: 0,
    strategyRating: 0,
  });

  // Animate numbers counting up
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

      setAnimatedStats({
        score: Math.floor(result.score * easeProgress),
        accuracy: result.accuracy * easeProgress,
        reactionTime: result.reactionTime * easeProgress,
        strategyRating: result.strategyRating * easeProgress,
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats({
          score: result.score,
          accuracy: result.accuracy,
          reactionTime: result.reactionTime,
          strategyRating: result.strategyRating,
        });
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [result]);

  const getPerformanceGrade = (score: number): { grade: string; color: string; description: string } => {
    if (score >= 90) return { grade: 'S', color: 'text-yellow-400', description: 'Legendary' };
    if (score >= 80) return { grade: 'A', color: 'text-green-400', description: 'Excellent' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-400', description: 'Good' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-400', description: 'Fair' };
    if (score >= 50) return { grade: 'D', color: 'text-red-400', description: 'Poor' };
    return { grade: 'F', color: 'text-red-600', description: 'Try Again' };
  };

  const getReactionTimeRating = (time: number): { rating: string; color: string } => {
    if (time < 200) return { rating: 'Lightning Fast', color: 'text-yellow-400' };
    if (time < 300) return { rating: 'Very Fast', color: 'text-green-400' };
    if (time < 400) return { rating: 'Fast', color: 'text-blue-400' };
    if (time < 500) return { rating: 'Average', color: 'text-orange-400' };
    return { rating: 'Slow', color: 'text-red-400' };
  };

  const getAccuracyRating = (accuracy: number): { rating: string; color: string } => {
    if (accuracy >= 95) return { rating: 'Perfect Shot', color: 'text-yellow-400' };
    if (accuracy >= 85) return { rating: 'Sharpshooter', color: 'text-green-400' };
    if (accuracy >= 75) return { rating: 'Marksman', color: 'text-blue-400' };
    if (accuracy >= 60) return { rating: 'Decent', color: 'text-orange-400' };
    return { rating: 'Needs Practice', color: 'text-red-400' };
  };

  const performance = getPerformanceGrade(animatedStats.score);
  const reactionRating = getReactionTimeRating(animatedStats.reactionTime);
  const accuracyRating = getAccuracyRating(animatedStats.accuracy);

  const isWin = result.score >= 70;
  const showNextMode = onNextMode && isWin && result.score >= 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-wild-west-900 via-desert-800 to-saloon-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-western-pattern opacity-5" />
      
      {/* Celebration particles for wins */}
      {isWin && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-10, -50],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className={`text-8xl md:text-9xl font-western mb-4 ${performance.color} text-glow`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, type: 'spring', stiffness: 100 }}
          >
            {performance.grade}
          </motion.div>
          
          <h1 className={`text-4xl md:text-5xl font-western mb-2 ${isWin ? 'text-green-400' : 'text-red-400'} text-glow`}>
            {isWin ? '🎯 VICTORY!' : '💀 DEFEAT!'}
          </h1>
          
          <p className={`text-xl font-elegant ${performance.color}`}>
            {performance.description} Performance
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Score */}
          <Card className="text-center p-6 bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border-yellow-600">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="font-western text-yellow-400 mb-2">Score</h3>
            <div className="text-3xl font-western text-yellow-300 text-glow">
              {animatedStats.score.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-500 mt-2">
              of {calculateScore(100, 0, 1, 1).toLocaleString()} possible
            </div>
          </Card>

          {/* Accuracy */}
          <Card className="text-center p-6 bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-600">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-western text-green-400 mb-2">Accuracy</h3>
            <div className="text-3xl font-western text-green-300 text-glow">
              {animatedStats.accuracy.toFixed(1)}%
            </div>
            <div className={`text-sm mt-2 ${accuracyRating.color}`}>
              {accuracyRating.rating}
            </div>
          </Card>

          {/* Reaction Time */}
          <Card className="text-center p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-600">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-western text-blue-400 mb-2">Reaction Time</h3>
            <div className="text-3xl font-western text-blue-300 text-glow">
              {Math.round(animatedStats.reactionTime)}ms
            </div>
            <div className={`text-sm mt-2 ${reactionRating.color}`}>
              {reactionRating.rating}
            </div>
          </Card>

          {/* Strategy Rating */}
          <Card className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-600">
            <div className="text-4xl mb-2">🧠</div>
            <h3 className="font-western text-purple-400 mb-2">Strategy</h3>
            <div className="text-3xl font-western text-purple-300 text-glow">
              {(animatedStats.strategyRating * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-purple-500 mt-2">
              Tactical Execution
            </div>
          </Card>
        </motion.div>

        {/* Performance Breakdown */}
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="p-8 bg-gradient-to-br from-saloon-900/40 to-wild-west-900/40">
            <h3 className="text-2xl font-western text-wild-west-300 mb-6 text-center">
              📊 Performance Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-elegant text-wild-west-400 mb-3">Strengths</h4>
                <ul className="space-y-2">
                  {result.accuracy > 80 && (
                    <li className="flex items-center text-green-400">
                      <span className="mr-2">✓</span>
                      <span className="font-elegant">Excellent accuracy</span>
                    </li>
                  )}
                  {result.reactionTime < 350 && (
                    <li className="flex items-center text-green-400">
                      <span className="mr-2">✓</span>
                      <span className="font-elegant">Quick reflexes</span>
                    </li>
                  )}
                  {result.strategyRating > 0.8 && (
                    <li className="flex items-center text-green-400">
                      <span className="mr-2">✓</span>
                      <span className="font-elegant">Smart strategy</span>
                    </li>
                  )}
                  {result.score > 80 && (
                    <li className="flex items-center text-green-400">
                      <span className="mr-2">✓</span>
                      <span className="font-elegant">Outstanding performance</span>
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-elegant text-wild-west-400 mb-3">Areas for Improvement</h4>
                <ul className="space-y-2">
                  {result.accuracy < 70 && (
                    <li className="flex items-center text-yellow-400">
                      <span className="mr-2">⚠</span>
                      <span className="font-elegant">Work on aim precision</span>
                    </li>
                  )}
                  {result.reactionTime > 500 && (
                    <li className="flex items-center text-yellow-400">
                      <span className="mr-2">⚠</span>
                      <span className="font-elegant">Practice faster draws</span>
                    </li>
                  )}
                  {result.strategyRating < 0.6 && (
                    <li className="flex items-center text-yellow-400">
                      <span className="mr-2">⚠</span>
                      <span className="font-elegant">Study opponent patterns</span>
                    </li>
                  )}
                  {result.score < 60 && (
                    <li className="flex items-center text-red-400">
                      <span className="mr-2">✗</span>
                      <span className="font-elegant">More training needed</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <Button
            variant="western"
            size="lg"
            onClick={onPlayAgain}
            className="shadow-lg hover:shadow-xl"
          >
            🔄 Try Again
          </Button>

          {showNextMode && (
            <Button
              variant="primary"
              size="lg"
              onClick={onNextMode}
              className="shadow-lg hover:shadow-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              ➡ Next Challenge
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            onClick={onMainMenu}
            className="shadow-lg hover:shadow-xl"
          >
            🏠 Main Menu
          </Button>
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          className="mt-16 max-w-2xl mx-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="bg-black/20 rounded-lg p-6 border border-wild-west-600/30">
            <h4 className="font-western text-wild-west-400 mb-4">Session Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm font-elegant text-wild-west-500">
              <div>
                <span>Mode:</span>
                <span className="float-right text-wild-west-300 capitalize">{result.mode}</span>
              </div>
              <div>
                <span>Duration:</span>
                <span className="float-right text-wild-west-300">
                  {formatTime(result.duration)}
                </span>
              </div>
              <div>
                <span>Date:</span>
                <span className="float-right text-wild-west-300">
                  {result.timestamp.toLocaleDateString()}
                </span>
              </div>
              <div>
                <span>Time:</span>
                <span className="float-right text-wild-west-300">
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;
