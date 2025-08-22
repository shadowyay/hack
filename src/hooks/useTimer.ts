import { useEffect, useRef, useCallback } from 'react';
import { useGame } from './useGame';

export interface TimerHookReturn {
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  getCurrentTime: () => number;
}

export const useTimer = (): TimerHookReturn => {
  const { gameState, updateGameState } = useGame();
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const updateTimer = useCallback(() => {
    if (!gameState.isPaused && gameState.isPlaying) {
      const now = Date.now();
      const elapsed = now - startTimeRef.current - pausedTimeRef.current;
      
      const totalSeconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const milliseconds = elapsed % 1000;

      updateGameState({
        timer: { minutes, seconds, milliseconds },
        stats: {
          ...gameState.stats,
          time: elapsed,
        },
      });
    }
  }, [gameState.isPaused, gameState.isPlaying, gameState.stats, updateGameState]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    
    intervalRef.current = setInterval(updateTimer, 16) as unknown as number; // ~60fps
  }, [updateTimer]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    updateGameState({
      timer: { minutes: 0, seconds: 0, milliseconds: 0 },
      stats: {
        ...gameState.stats,
        time: 0,
      },
    });
  }, [stopTimer, updateGameState, gameState.stats]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (!intervalRef.current && gameState.isPlaying) {
      const pauseStartTime = Date.now() - (gameState.timer.minutes * 60000 + gameState.timer.seconds * 1000 + gameState.timer.milliseconds);
      pausedTimeRef.current += Date.now() - pauseStartTime;
      intervalRef.current = setInterval(updateTimer, 16) as unknown as number;
    }
  }, [gameState.isPlaying, gameState.timer, updateTimer]);

  const getCurrentTime = useCallback(() => {
    return gameState.timer.minutes * 60000 + gameState.timer.seconds * 1000 + gameState.timer.milliseconds;
  }, [gameState.timer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-start/stop based on game state
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      if (!intervalRef.current) {
        startTimer();
      }
    } else {
      if (intervalRef.current) {
        pauseTimer();
      }
    }
  }, [gameState.isPlaying, gameState.isPaused, startTimer, pauseTimer]);

  return {
    startTimer,
    stopTimer,
    resetTimer,
    pauseTimer,
    resumeTimer,
    getCurrentTime,
  };
};
