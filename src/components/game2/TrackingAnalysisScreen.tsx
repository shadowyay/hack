import React, { useMemo } from 'react';
import Leaderboard from '../ui/Leaderboard';

type KillStat = { animalName: string; killTime: number; accuracy: boolean };

export interface TrackingSummary {
  time: number;
  score: number;
  trackedAnimals: number;
  killedAnimals: number;
  killStats: KillStat[];
}

interface Props {
  summary: TrackingSummary;
  onRestart: () => void;
}

const TrackingAnalysisScreen: React.FC<Props> = ({ summary, onRestart }) => {
  const {
    time,
    score,
    trackedAnimals,
    killedAnimals,
    killStats
  } = summary;

  const computed = useMemo(() => {
    const totalTime = Math.floor(time / 60);
    const averageKillTime = killStats.length > 0
      ? Math.floor(killStats.reduce((sum, stat) => sum + stat.killTime, 0) / killStats.length / 60)
      : 0;
    const accurateKills = killStats.filter(stat => stat.accuracy).length;
    const accuracyPercentage = killStats.length > 0
      ? Math.round((accurateKills / killStats.length) * 100)
      : 0;

    const animalCounts = killStats.reduce((counts, stat) => {
      counts[stat.animalName] = (counts[stat.animalName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const getHunterGrade = (accuracy: number, t: number, s: number): { grade: string; color: string; description: string } => {
      const performanceScore = (accuracy * 0.4) + ((300 - Math.min(t, 300)) / 300 * 30) + (Math.min(s, 1000) / 1000 * 30);
      if (performanceScore >= 85) return { grade: 'S', color: 'text-yellow-400', description: 'Legendary Hunter' };
      if (performanceScore >= 75) return { grade: 'A', color: 'text-green-400', description: 'Master Tracker' };
      if (performanceScore >= 65) return { grade: 'B', color: 'text-blue-400', description: 'Skilled Hunter' };
      if (performanceScore >= 50) return { grade: 'C', color: 'text-orange-400', description: 'Average Hunter' };
      if (performanceScore >= 35) return { grade: 'D', color: 'text-red-400', description: 'Novice Hunter' };
      return { grade: 'F', color: 'text-red-600', description: 'Practice More' };
    };

    const getAccuracyRating = (accuracy: number): { rating: string; color: string } => {
      if (accuracy >= 90) return { rating: 'Deadeye', color: 'text-yellow-400' };
      if (accuracy >= 80) return { rating: 'Sharpshooter', color: 'text-green-400' };
      if (accuracy >= 70) return { rating: 'Marksman', color: 'text-blue-400' };
      if (accuracy >= 50) return { rating: 'Decent Shot', color: 'text-orange-400' };
      return { rating: 'Needs Practice', color: 'text-red-400' };
    };

    const getSpeedRating = (t: number): { rating: string; color: string } => {
      if (t <= 60) return { rating: 'Lightning Fast', color: 'text-yellow-400' };
      if (t <= 90) return { rating: 'Very Fast', color: 'text-green-400' };
      if (t <= 120) return { rating: 'Fast', color: 'text-blue-400' };
      if (t <= 180) return { rating: 'Average', color: 'text-orange-400' };
      return { rating: 'Slow', color: 'text-red-400' };
    };

    const performance = getHunterGrade(accuracyPercentage, totalTime, score);
    const accuracyRating = getAccuracyRating(accuracyPercentage);
    const speedRating = getSpeedRating(totalTime);
    const isExcellent = performance.grade === 'S' || performance.grade === 'A';

    return {
      totalTime,
      averageKillTime,
      accurateKills,
      accuracyPercentage,
      animalCounts,
      performance,
      accuracyRating,
      speedRating,
      isExcellent
    };
  }, [time, score, trackedAnimals, killedAnimals, killStats]);

  const {
    totalTime,
    averageKillTime,
    accurateKills,
    accuracyPercentage,
    animalCounts,
    performance,
    accuracyRating,
    speedRating,
    isExcellent
  } = computed;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900 z-50 overflow-y-auto">
      {/* Background effects */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Celebration particles for excellent performance */}
      {isExcellent && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 2}s infinite ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`text-8xl md:text-9xl font-bold mb-4 ${performance.color} drop-shadow-lg`}>
            {performance.grade}
          </div>
          
          <h1 className={"text-4xl md:text-5xl font-bold mb-2 text-amber-300 drop-shadow-md"}>
            🦌 HUNT COMPLETE
          </h1>
          
          <p className={`text-xl ${performance.color} font-semibold`}>
            {performance.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {/* Score */}
          <div className="text-center p-6 bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border-2 border-yellow-600/50 rounded-lg backdrop-blur-sm">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="font-bold text-yellow-400 mb-2">Score</h3>
            <div className="text-3xl font-bold text-yellow-300 drop-shadow-md">
              {score.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-500 mt-2">
              Total Points Earned
            </div>
          </div>

          {/* Accuracy */}
          <div className="text-center p-6 bg-gradient-to-br from-green-900/40 to-green-800/40 border-2 border-green-600/50 rounded-lg backdrop-blur-sm">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-bold text-green-400 mb-2">Accuracy</h3>
            <div className="text-3xl font-bold text-green-300 drop-shadow-md">
              {accuracyPercentage}%
            </div>
            <div className={`text-sm mt-2 ${accuracyRating.color}`}>
              {accuracyRating.rating}
            </div>
          </div>

          {/* Hunt Time */}
          <div className="text-center p-6 bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-2 border-blue-600/50 rounded-lg backdrop-blur-sm">
            <div className="text-4xl mb-2">⏱️</div>
            <h3 className="font-bold text-blue-400 mb-2">Hunt Time</h3>
            <div className="text-3xl font-bold text-blue-300 drop-shadow-md">
              {totalTime}s
            </div>
            <div className={`text-sm mt-2 ${speedRating.color}`}>
              {speedRating.rating}
            </div>
          </div>

          {/* Animals Tracked */}
          <div className="text-center p-6 bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-2 border-purple-600/50 rounded-lg backdrop-blur-sm">
            <div className="text-4xl mb-2">🦅</div>
            <h3 className="font-bold text-purple-400 mb-2">Tracked</h3>
            <div className="text-3xl font-bold text-purple-300 drop-shadow-md">
              {trackedAnimals}
            </div>
            <div className="text-sm text-purple-500 mt-2">
              Eagle Eye Usage
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="p-8 bg-gradient-to-br from-black/40 to-gray-900/40 border-2 border-amber-600/50 rounded-lg backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-amber-300 mb-6 text-center">
              📊 Hunting Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-green-400 mb-4 text-lg">🎯 Strengths</h4>
                <ul className="space-y-3">
                  {accuracyPercentage >= 80 && (
                    <li className="flex items-center text-green-300">
                      <span className="mr-3 text-green-400">✓</span>
                      <span>Excellent shooting accuracy</span>
                    </li>
                  )}
                  {totalTime <= 90 && (
                    <li className="flex items-center text-green-300">
                      <span className="mr-3 text-green-400">✓</span>
                      <span>Quick and efficient hunting</span>
                    </li>
                  )}
                  {trackedAnimals >= 5 && (
                    <li className="flex items-center text-green-300">
                      <span className="mr-3 text-green-400">✓</span>
                      <span>Good use of tracking skills</span>
                    </li>
                  )}
                  {score >= 400 && (
                    <li className="flex items-center text-green-300">
                      <span className="mr-3 text-green-400">✓</span>
                      <span>High-value target selection</span>
                    </li>
                  )}
                  {Object.values(animalCounts).some(count => count >= 3) && (
                    <li className="flex items-center text-green-300">
                      <span className="mr-3 text-green-400">✓</span>
                      <span>Focused hunting strategy</span>
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-orange-400 mb-4 text-lg">⚠️ Areas for Improvement</h4>
                <ul className="space-y-3">
                  {accuracyPercentage < 70 && (
                    <li className="flex items-center text-orange-300">
                      <span className="mr-3 text-orange-400">⚠</span>
                      <span>Practice aim and precision shooting</span>
                    </li>
                  )}
                  {totalTime > 150 && (
                    <li className="flex items-center text-orange-300">
                      <span className="mr-3 text-orange-400">⚠</span>
                      <span>Work on hunting efficiency</span>
                    </li>
                  )}
                  {trackedAnimals < 3 && (
                    <li className="flex items-center text-orange-300">
                      <span className="mr-3 text-orange-400">⚠</span>
                      <span>Use Eagle Eye more frequently</span>
                    </li>
                  )}
                  {score < 200 && (
                    <li className="flex items-center text-red-300">
                      <span className="mr-3 text-red-400">✗</span>
                      <span>Target higher-value animals</span>
                    </li>
                  )}
                  {accuracyPercentage < 50 && (
                    <li className="flex items-center text-red-300">
                      <span className="mr-3 text-red-400">✗</span>
                      <span>More shooting practice needed</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Kill Breakdown */}
            <div className="mt-8 pt-6 border-t border-amber-600/30">
              <h4 className="font-bold text-amber-400 mb-4 text-lg">🔎 Hunt Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(animalCounts).map(([animal, count]) => (
                  <div key={animal} className="text-center p-3 bg-black/20 rounded-lg">
                    <div className="text-lg font-bold text-white">{count}</div>
                    <div className="text-sm text-gray-300">{animal}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto">
          <button
            onClick={onRestart}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🔄 Hunt Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🏠 Main Menu
          </button>
        </div>

        {/* Leaderboard */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-black/40 to-gray-900/40 border-2 border-amber-600/50 rounded-lg backdrop-blur-sm p-8">
            <h3 className="text-2xl font-bold text-amber-300 mb-6 text-center">
              🏆 Animal Tracking Leaderboard
            </h3>
            <Leaderboard key="tracking-leaderboard" gameMode="tracking" />
          </div>
        </div>

        {/* Session Details */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <div className="bg-black/30 rounded-lg p-6 border border-amber-600/30">
            <h4 className="font-bold text-amber-400 mb-4">Session Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Hunt Duration:</span>
                <span className="text-white">{totalTime}s</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Kill Time:</span>
                <span className="text-white">{averageKillTime}s</span>
              </div>
              <div className="flex justify-between">
                <span>Headshots:</span>
                <span className="text-white">{accurateKills}/{killedAnimals}</span>
              </div>
              <div className="flex justify-between">
                <span>Eagle Eye Uses:</span>
                <span className="text-white">{trackedAnimals}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default TrackingAnalysisScreen;
