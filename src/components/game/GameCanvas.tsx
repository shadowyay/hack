import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import type { GameMode } from '../../types';

interface GameCanvasProps {
  mode: GameMode;
  onGameEnd: (result: { score: number; accuracy: number; reactionTime: number; strategyRating: number }) => void;
}

class DuelScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private opponent!: Phaser.GameObjects.Rectangle;
  private bullets: Phaser.GameObjects.Rectangle[] = [];
  private background!: Phaser.GameObjects.TileSprite;
  private dustParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private canShoot = false;
  private reactionStartTime = 0;
  private shots = 0;
  private hits = 0;
  private gameEndCallback?: (result: { score: number; accuracy: number; reactionTime: number; strategyRating: number }) => void;

  constructor() {
    super({ key: 'DuelScene' });
  }

  preload() {
    // Create colored rectangles as placeholders for sprites
    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    this.load.image('opponent', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create parallax background
    this.background = this.add.tileSprite(0, 0, width, height, 'player');
    this.background.setTint(0x8B4513); // Brown desert color
    this.background.setOrigin(0, 0);

    // Create ground
    this.add.rectangle(width / 2, height - 50, width, 100, 0x654321);
    
    // Create player (left side)
    this.player = this.add.rectangle(100, height - 150, 40, 80, 0x4169E1);
    this.player.setStrokeStyle(2, 0x000000);

    // Create opponent (right side)
    this.opponent = this.add.rectangle(width - 100, height - 150, 40, 80, 0xDC143C);
    this.opponent.setStrokeStyle(2, 0x000000);

    // Create dust particle system
    this.dustParticles = this.add.particles(0, 0, 'player', {
      tint: 0xD2B48C,
      scale: { start: 0.1, end: 0 },
      speed: { min: 10, max: 30 },
      lifespan: 1000,
      alpha: { start: 0.6, end: 0 },
      emitting: false,
    });

    // Add some atmospheric elements
    this.createAtmosphere();

    // Setup input
    this.input.on('pointerdown', this.shoot, this);
    this.input.keyboard?.on('keydown-SPACE', this.shoot, this);

    // Start the duel countdown
    this.startDuelCountdown();
  }

  private createAtmosphere() {
    const { width, height } = this.cameras.main;
    
    // Add some building silhouettes
    const buildings = [
      { x: 200, y: height - 100, width: 80, height: 120 },
      { x: 300, y: height - 100, width: 60, height: 100 },
      { x: width - 300, y: height - 100, width: 70, height: 110 },
      { x: width - 200, y: height - 100, width: 90, height: 130 },
    ];

    buildings.forEach(building => {
      const rect = this.add.rectangle(
        building.x, 
        building.y - building.height / 2, 
        building.width, 
        building.height, 
        0x2F1B14
      );
      rect.setAlpha(0.7);
    });

    // Add sun
    const sun = this.add.circle(width - 100, 80, 40, 0xFFD700);
    sun.setAlpha(0.8);
  }

  private async startDuelCountdown() {
    const { width, height } = this.cameras.main;
    
    // Create countdown text
    const countdownText = this.add.text(width / 2, height / 2, '3', {
      fontSize: '128px',
      color: '#FFD700',
      fontFamily: 'Rye, serif',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Countdown from 3 to 1
    for (let i = 3; i > 0; i--) {
      countdownText.setText(i.toString());
      countdownText.setScale(2);
      this.tweens.add({
        targets: countdownText,
        scale: 1,
        duration: 800,
        ease: 'Back.out',
      });
      await this.delay(1000);
    }

    // Show DRAW!
    countdownText.setText('DRAW!');
    countdownText.setStyle({ color: '#FF0000', fontSize: '96px' });
    countdownText.setScale(2);
    
    this.tweens.add({
      targets: countdownText,
      scale: 1,
      duration: 300,
      ease: 'Back.out',
    });

    // Enable shooting and start opponent timer
    this.canShoot = true;
    this.reactionStartTime = Date.now();
    
    // Opponent shoots after random delay (200-800ms)
    const opponentDelay = Phaser.Math.Between(200, 800);
    this.time.delayedCall(opponentDelay, () => {
      this.opponentShoot();
    });

    // Remove countdown text after a moment
    this.time.delayedCall(1500, () => {
      countdownText.destroy();
    });
  }

  private shoot() {
    if (!this.canShoot) return;

    this.canShoot = false;
    this.shots++;

    const reactionTime = Date.now() - this.reactionStartTime;
    
    // Create bullet
    const bullet = this.add.rectangle(this.player.x + 20, this.player.y, 8, 3, 0xFFFF00);
    this.bullets.push(bullet);

    // Animate bullet
    this.tweens.add({
      targets: bullet,
      x: this.opponent.x - 20,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        // Check if hit
        const hit = Math.abs(bullet.y - this.opponent.y) < 40;
        
        if (hit) {
          this.hits++;
          this.createHitEffect(this.opponent.x, this.opponent.y);
          
          // Opponent falls
          this.tweens.add({
            targets: this.opponent,
            angle: 90,
            y: this.opponent.y + 40,
            duration: 500,
            ease: 'Bounce.out',
          });
        } else {
          this.createMissEffect(bullet.x, bullet.y);
        }

        bullet.destroy();
        this.endDuel(hit, reactionTime);
      }
    });

    // Player shooting animation
    this.tweens.add({
      targets: this.player,
      scaleX: 1.2,
      duration: 100,
      yoyo: true,
    });
  }

  private opponentShoot() {
    if (!this.canShoot) return; // Player already shot

    // Opponent missed (they always miss for now)
    const bullet = this.add.rectangle(this.opponent.x - 20, this.opponent.y, 8, 3, 0xFF0000);
    
    this.tweens.add({
      targets: bullet,
      x: this.player.x + 20,
      y: this.player.y + Phaser.Math.Between(-30, 30), // Some inaccuracy
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        this.createMissEffect(bullet.x, bullet.y);
        bullet.destroy();
      }
    });

    // If player hasn't shot yet, they lose
    if (this.canShoot) {
      this.canShoot = false;
      this.time.delayedCall(500, () => {
        this.endDuel(false, Date.now() - this.reactionStartTime);
      });
    }
  }

  private createHitEffect(x: number, y: number) {
    // Blood splatter effect
    const particles = this.add.particles(x, y, 'player', {
      tint: 0xFF0000,
      scale: { start: 0.2, end: 0 },
      speed: { min: 50, max: 100 },
      lifespan: 500,
      quantity: 10,
    });

    this.time.delayedCall(600, () => particles.destroy());
  }

  private createMissEffect(x: number, y: number) {
    // Dust cloud
    this.dustParticles.setPosition(x, y);
    this.dustParticles.explode(5);
  }

  private endDuel(playerWon: boolean, reactionTime: number) {
    const accuracy = this.shots > 0 ? (this.hits / this.shots) * 100 : 0;
    const score = playerWon ? 100 : 0;
    const strategyRating = reactionTime < 300 ? 1.0 : reactionTime < 500 ? 0.8 : 0.6;

    this.time.delayedCall(1000, () => {
      if (this.gameEndCallback) {
        this.gameEndCallback({
          score,
          accuracy,
          reactionTime,
          strategyRating,
        });
      }
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }

  setGameEndCallback(callback: (result: { score: number; accuracy: number; reactionTime: number; strategyRating: number }) => void) {
    this.gameEndCallback = callback;
  }

  update() {
    // Animate background
    if (this.background) {
      this.background.tilePositionX += 0.5;
    }
  }
}

const GameCanvas: React.FC<GameCanvasProps> = ({ mode, onGameEnd }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Phaser game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: canvasRef.current,
      backgroundColor: '#87CEEB', // Sky blue
      scene: DuelScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    // Create game
    gameRef.current = new Phaser.Game(config);

    // Set up game end callback
    const scene = gameRef.current.scene.getScene('DuelScene') as DuelScene;
    if (scene) {
      scene.setGameEndCallback(onGameEnd);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [mode, onGameEnd]);

  return (
    <div className="flex justify-center items-center w-full h-full bg-gradient-to-b from-orange-400 to-yellow-600">
      <div
        ref={canvasRef}
        className="game-canvas max-w-full max-h-full"
        style={{ aspectRatio: '4/3' }}
      />
    </div>
  );
};

export default GameCanvas;
