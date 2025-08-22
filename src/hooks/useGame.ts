import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import type { GameContextType } from '../types';

// Hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
