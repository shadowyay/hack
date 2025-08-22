// src/components/GameCanvas.tsx (unchanged)
import React, { useEffect, useRef, useContext } from 'react';
import { GameContext } from '../../context/GameContext';
import Phaser from 'phaser';
import DuelScene from './DuelScene';

interface Props { 
  mode: string; 
}

const GameCanvas: React.FC<Props> = ({ mode }) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  const gameContext = useContext(GameContext);
  const isPaused = gameContext?.gameState?.isPaused;

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'phaser-root',
      scene: DuelScene,
      physics: { 
        default: 'arcade', 
        arcade: { 
          gravity: { x: 0, y: 800 },
          debug: false 
        } 
      },
      scale: { 
        mode: Phaser.Scale.RESIZE, 
        autoCenter: Phaser.Scale.CENTER_BOTH 
      },
      backgroundColor: '#2c1810'
    };

    // Only create game if it doesn't exist
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(config);
    }

    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mode]);

  // Pause/resume Phaser game when isPaused changes
  useEffect(() => {
    if (gameRef.current && gameRef.current.scene) {
      const sceneKey = gameRef.current.scene.scenes[0]?.scene.key || 'default';
      if (isPaused) {
        gameRef.current.scene.pause(sceneKey);
      } else {
        gameRef.current.scene.resume(sceneKey);
      }
    }
  }, [isPaused]);

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="phaser-root" className="w-full h-full" />;
};

export default GameCanvas;
