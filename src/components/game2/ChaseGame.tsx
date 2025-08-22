import React from 'react';

const ChaseGame: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-900 to-red-900">
      <div className="text-center p-8 bg-black/50 rounded-lg border border-orange-500">
        <h2 className="text-4xl font-western text-white mb-4">🐎 OUTLAW CHASE</h2>
        <p className="text-xl text-orange-300 mb-6">Coming Soon!</p>
        <p className="text-white/80 mb-4">
          Chase down notorious outlaws across the dusty frontier in this high-speed pursuit mode.
        </p>
        <div className="text-orange-400">
          <p>🌵 Dynamic desert environments</p>
          <p>🏃 Fast-paced chase sequences</p>
          <p>🎯 Strategic capture mechanics</p>
        </div>
      </div>
    </div>
  );
};

export default ChaseGame;
