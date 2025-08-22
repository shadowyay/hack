import { useCallback } from 'react';
import { useGame } from './useGame';
import { playSound } from '../utils';

export interface SoundHookReturn {
  playGunshotSound: () => void;
  playReloadSound: () => void;
  playHitSound: () => void;
  playMissSound: () => void;
  playWinSound: () => void;
  playLoseSound: () => void;
  playAmbientSound: (environment: string) => void;
  playDrawSound: () => void;
  playFootstepSound: () => void;
  playRicochetSound: () => void;
}

export const useSound = (): SoundHookReturn => {
  const { settings } = useGame();
  const { sound } = settings;
  
  const playWithVolume = useCallback((soundPath: string, volumeMultiplier: number = 1) => {
    if (!sound.muted) {
      const volume = sound.masterVolume * sound.sfxVolume * volumeMultiplier;
      playSound(soundPath, volume);
    }
  }, [sound.muted, sound.masterVolume, sound.sfxVolume]);

  const playGunshotSound = useCallback(() => {
    playWithVolume('/assets/sounds/gunshot.mp3', 1.0);
  }, [playWithVolume]);

  const playReloadSound = useCallback(() => {
    playWithVolume('/assets/sounds/reload.mp3', 0.8);
  }, [playWithVolume]);

  const playHitSound = useCallback(() => {
    playWithVolume('/assets/sounds/hit.mp3', 0.9);
  }, [playWithVolume]);

  const playMissSound = useCallback(() => {
    playWithVolume('/assets/sounds/miss.mp3', 0.6);
  }, [playWithVolume]);

  const playWinSound = useCallback(() => {
    playWithVolume('/assets/sounds/win.mp3', 1.0);
  }, [playWithVolume]);

  const playLoseSound = useCallback(() => {
    playWithVolume('/assets/sounds/lose.mp3', 0.8);
  }, [playWithVolume]);

  const playDrawSound = useCallback(() => {
    playWithVolume('/assets/sounds/draw.mp3', 1.2);
  }, [playWithVolume]);

  const playFootstepSound = useCallback(() => {
    playWithVolume('/assets/sounds/footstep.mp3', 0.5);
  }, [playWithVolume]);

  const playRicochetSound = useCallback(() => {
    playWithVolume('/assets/sounds/ricochet.mp3', 0.7);
  }, [playWithVolume]);

  const playAmbientSound = useCallback((environment: string) => {
    if (!sound.muted) {
      const volume = sound.masterVolume * sound.ambientVolume;
      playSound(`/assets/sounds/ambient-${environment}.mp3`, volume);
    }
  }, [sound.muted, sound.masterVolume, sound.ambientVolume]);

  return {
    playGunshotSound,
    playReloadSound,
    playHitSound,
    playMissSound,
    playWinSound,
    playLoseSound,
    playAmbientSound,
    playDrawSound,
    playFootstepSound,
    playRicochetSound,
  };
};
