// src/game/DuelScene.ts
import Phaser from 'phaser';

export default class DuelScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DuelScene' });
  }

  // Public helpers
  setGameEndCallback!: (r: Result) => void;
  setDifficulty(level: 'easy' | 'medium' | 'hard') {
    const presets = {
      easy: { approach: 120, retreat: 110, jump: 12, shoot: 40, bullet: 450, tick: 260 },
      medium: { approach: 150, retreat: 130, jump: 18, shoot: 60, bullet: 500, tick: 200 },
      hard: { approach: 190, retreat: 170, jump: 24, shoot: 75, bullet: 560, tick: 150 },
    } as const;
    this.aiConfig = presets[level];
    if (this.aiTimer) {
      this.aiTimer.remove(false);
      this.aiTimer = this.time.addEvent({ delay: this.aiConfig.tick, loop: true, callback: this.aiLogic, callbackScope: this });
    }
  }

  // Private state
  private player!: Phaser.Physics.Arcade.Sprite;
  private opponent!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;
  private aiBullets!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private groundPlatform!: Phaser.GameObjects.Rectangle;
  private puff!: Phaser.GameObjects.Particles.ParticleEmitter;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private shootKey!: Phaser.Input.Keyboard.Key;
  private playerLabel!: Phaser.GameObjects.Text;
  private botLabel!: Phaser.GameObjects.Text;

  // Gameplay
  private shots = 0;
  private hits = 0;
  private playerAmmo = 10; // Each player gets 10 bullets
  private aiAmmo = 10;
  private playerHP = 100;
  private streak = 0;
  private score = 0;
  private gameEnded = false;
  private aiConfig = { approach: 150, retreat: 130, jump: 18, shoot: 60, bullet: 500, tick: 200 };
  private aiTimer!: Phaser.Time.TimerEvent;
  private gameStartTime = 0;

  // Ground level for consistent spawning
  private groundLevel!: number;

  preload() {
    // Generate simple 1x1 pixel for particles and bullets
    this.textures.generate('pixel', { data: ['1'], pixelWidth: 1 });
    
    // Create cowboy sprites using graphics
    this.createCowboyTextures();
  }

  private createCowboyTextures() {
    // Player cowboy (blue)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x8B4513); // Brown hat
    playerGraphics.fillEllipse(15, 8, 20, 12);
    playerGraphics.fillStyle(0xFFDBB5); // Skin tone
    playerGraphics.fillEllipse(15, 18, 12, 14);
    playerGraphics.fillStyle(0x0066CC); // Blue shirt
    playerGraphics.fillRect(10, 25, 10, 20);
    playerGraphics.fillStyle(0x654321); // Brown pants
    playerGraphics.fillRect(11, 45, 8, 15);
    playerGraphics.fillStyle(0x8B4513); // Brown boots
    playerGraphics.fillRect(10, 58, 4, 6);
    playerGraphics.fillRect(16, 58, 4, 6);
    // Gun holster
    playerGraphics.fillStyle(0x2F1B14);
    playerGraphics.fillRect(8, 35, 3, 8);
    playerGraphics.generateTexture('player-cowboy', 30, 64);
    playerGraphics.destroy();

    // AI cowboy (red)
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x2F1B14); // Black hat
    aiGraphics.fillEllipse(15, 8, 20, 12);
    aiGraphics.fillStyle(0xFFDBB5); // Skin tone
    aiGraphics.fillEllipse(15, 18, 12, 14);
    aiGraphics.fillStyle(0xCC0000); // Red shirt
    aiGraphics.fillRect(10, 25, 10, 20);
    aiGraphics.fillStyle(0x654321); // Brown pants
    aiGraphics.fillRect(11, 45, 8, 15);
    aiGraphics.fillStyle(0x8B4513); // Brown boots
    aiGraphics.fillRect(10, 58, 4, 6);
    aiGraphics.fillRect(16, 58, 4, 6);
    // Gun holster
    aiGraphics.fillStyle(0x2F1B14);
    aiGraphics.fillRect(19, 35, 3, 8);
    aiGraphics.generateTexture('ai-cowboy', 30, 64);
    aiGraphics.destroy();

    // Bullet texture
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xFFD700); // Gold bullet
    bulletGraphics.fillEllipse(6, 3, 12, 6);
    bulletGraphics.fillStyle(0xB8860B); // Darker gold tip
    bulletGraphics.fillEllipse(10, 3, 4, 4);
    bulletGraphics.generateTexture('bullet', 12, 6);
    bulletGraphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Set ground level consistently
    this.groundLevel = Math.floor(height * 0.6);

    // 1) Background – RDR2-style desert with sun
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xffd700, 0xff4500, 1);
    sky.fillRect(0, 0, width, height * 0.6);
    sky.setDepth(0);

    // Add sun in the sky
    const sun = this.add.graphics();
    sun.fillStyle(0xFFFF00, 0.9); // Bright yellow sun
    sun.fillCircle(width * 0.8, height * 0.15, 40);
    sun.fillStyle(0xFFA500, 0.7); // Orange glow
    sun.fillCircle(width * 0.8, height * 0.15, 50);
    sun.setDepth(1);

    const ground = this.add.graphics();
    ground.fillStyle(0x8b4513, 1);
    ground.fillRect(0, this.groundLevel, width, height * 0.4);
    ground.setDepth(0);

    // Procedural clouds
    this.add.graphics()
      .fillStyle(0xffffff, 0.6)
      .fillEllipse(width * 0.2, 80, 100, 50)
      .fillEllipse(width * 0.7, 60, 120, 60)
      .setDepth(1);

    // Mesa silhouettes in background
    const mesa = this.add.graphics();
    mesa.fillStyle(0x654321, 0.8);
    mesa.fillTriangle(width * 0.1, this.groundLevel, width * 0.25, this.groundLevel - 200, width * 0.4, this.groundLevel);
    mesa.fillTriangle(width * 0.6, this.groundLevel, width * 0.75, this.groundLevel - 250, width * 0.9, this.groundLevel);
    mesa.setDepth(0);

    // 2) Ground platform - physics enabled
    this.physics.world.setBounds(0, 0, width, height);
    // Position ground platform so its TOP surface is at groundLevel for characters to stand on
    const groundThickness = height - this.groundLevel;
    this.groundPlatform = this.add.rectangle(width/2, this.groundLevel + groundThickness/2, width, groundThickness, 0x704214);
    this.physics.add.existing(this.groundPlatform, true);
    (this.groundPlatform.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    this.groundPlatform.setDepth(1);

    // 3) Create obstacles (cover points and platforms) - attached to ground
    this.obstacles = this.physics.add.staticGroup();
    
    // Cover walls - smaller heights for jumping
    const wall1 = this.add.rectangle(width * 0.25, this.groundLevel - 30, 20, 60, 0x654321);
    const wall2 = this.add.rectangle(width * 0.5, this.groundLevel - 25, 30, 50, 0x654321);
    const wall3 = this.add.rectangle(width * 0.75, this.groundLevel - 35, 25, 70, 0x654321);
    
    // Jumping platforms - lower heights
    const platform1 = this.add.rectangle(width * 0.35, this.groundLevel - 80, 80, 20, 0x8b4513);
    const platform2 = this.add.rectangle(width * 0.65, this.groundLevel - 70, 90, 20, 0x8b4513);
    
    this.obstacles.addMultiple([wall1, wall2, wall3, platform1, platform2]);
    
    // Add physics to obstacles
    this.obstacles.children.iterate((child) => {
      const obstacle = child as Phaser.GameObjects.Rectangle;
      this.physics.add.existing(obstacle, true);
      (obstacle.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      obstacle.setDepth(2);
      return true;
    });

    // 4) Player & AI sprites - positioned on ground at SAME Y level
    const MARGIN_X = 20;
    const halfW = 15;
    const playerSpawnX = MARGIN_X + halfW;
    const botSpawnX = width - (MARGIN_X + halfW);
    
    // Both spawn just above the ground surface to land on it properly
    const spawnY = this.groundLevel - 30; // 30 pixels above ground surface for both

    this.player = this.physics.add.sprite(playerSpawnX, spawnY, 'player-cowboy')
      .setCollideWorldBounds(true)
      .setDepth(5);

    this.opponent = this.physics.add.sprite(botSpawnX, spawnY, 'ai-cowboy')
      .setCollideWorldBounds(true)
      .setDepth(5);

    // Ensure physics bodies match visible size for proper collisions
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(30, 60, true);
    (this.opponent.body as Phaser.Physics.Arcade.Body).setSize(30, 60, true);

    // Name labels for visibility
    this.playerLabel = this.add.text(this.player.x, this.player.y - 40, 'PLAYER', { 
      color: '#ffffff', 
      fontSize: '12px',
      fontFamily: 'serif',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(8);
    
    this.botLabel = this.add.text(this.opponent.x, this.opponent.y - 40, 'BOT', { 
      color: '#ffffff', 
      fontSize: '12px',
      fontFamily: 'serif',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(8);

    // 5) Physics collisions - CRITICAL: Add colliders for both characters
    this.physics.add.collider(this.player, this.groundPlatform);
    this.physics.add.collider(this.opponent, this.groundPlatform);
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.opponent, this.obstacles);

    // 6) Bullet groups
    this.bullets = this.physics.add.group({ maxSize: 20 });
    this.aiBullets = this.physics.add.group({ maxSize: 20 });

    // Bullet collisions with obstacles
    this.physics.add.collider(this.bullets, this.obstacles, (bullet) => {
      const bulletObj = bullet as Phaser.Physics.Arcade.Sprite;
      this.puff.emitParticleAt(bulletObj.x, bulletObj.y);
      bulletObj.destroy();
    }, undefined, this);
    
    this.physics.add.collider(this.aiBullets, this.obstacles, (bullet) => {
      const bulletObj = bullet as Phaser.Physics.Arcade.Sprite;
      this.puff.emitParticleAt(bulletObj.x, bulletObj.y);
      bulletObj.destroy();
    }, undefined, this);

    // Destroy bullets when leaving world bounds
    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      const go = body.gameObject as Phaser.GameObjects.GameObject | null;
      if (!go) return;
      const gameObj = go as Phaser.GameObjects.GameObject;
      if (this.bullets.contains(gameObj) || this.aiBullets.contains(gameObj)) {
        gameObj.destroy();
      }
    });

    // 7) Game ending bullet hits
    this.physics.add.overlap(this.bullets, this.opponent, (bullet) => {
      if (this.gameEnded) return;
      bullet.destroy();
      this.gameEnded = true;
      this.hits++;
      
      const finalScore = this.calculateFinalScore(true);
      this.score = finalScore;
      
      this.opponent.setTint(0xffffff).setAlpha(0.3);
      this.cameras.main.flash(500, 255, 255, 255);
      this.puff.emitParticleAt(this.opponent.x, this.opponent.y);
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'PLAYER WINS!', {
        fontSize: '48px',
        color: '#00FF00',
        fontFamily: 'serif',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
      
      // Dispatch game end event
      this.time.delayedCall(2000, () => {
        const gameDuration = (this.time.now - this.gameStartTime) / 1000;
        window.dispatchEvent(new CustomEvent('GAME_END', {
          detail: {
            score: finalScore,
            accuracy: this.shots ? (this.hits / this.shots * 100) : 0,
            reactionTime: Math.max(200, Math.min(500, gameDuration * 100)),
            strategyRating: Math.min(100, 60 + (this.playerAmmo * 4) + (finalScore > 2000 ? 25 : 0))
          }
        }));
      });
    }, undefined, this);
    
    this.physics.add.overlap(this.aiBullets, this.player, (bullet) => {
      if (this.gameEnded) return;
      bullet.destroy();
      this.gameEnded = true;
      
      const finalScore = this.calculateFinalScore(false);
      this.score = finalScore;
      
      this.player.setTint(0xff0000).setAlpha(0.3);
      this.cameras.main.flash(500, 255, 0, 0);
      this.puff.emitParticleAt(this.player.x, this.player.y);
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'AI WINS!', {
        fontSize: '48px',
        color: '#FF0000',
        fontFamily: 'serif',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
      
      // Dispatch game end event
      this.time.delayedCall(2000, () => {
        const gameDuration = (this.time.now - this.gameStartTime) / 1000;
        window.dispatchEvent(new CustomEvent('GAME_END', {
          detail: {
            score: finalScore,
            accuracy: this.shots ? (this.hits / this.shots * 100) : 0,
            reactionTime: Math.max(400, Math.min(800, gameDuration * 150)),
            strategyRating: Math.max(20, Math.min(60, this.shots * 5))
          }
        }));
      });
    }, undefined, this);

    // 8) Particle effects
    this.puff = this.add.particles(0, 0, 'pixel', {
      speed: { min: 20, max: 50 },
      scale: { start: 0.6, end: 0 },
      lifespan: 600,
      quantity: 5,
      blendMode: 'ADD',
      emitting: false,
    });

    // 9) Input setup - WASD + Space + Click
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D,SPACE') as { [key: string]: Phaser.Input.Keyboard.Key };
    this.shootKey = this.input.keyboard!.addKey('SPACE');
    
    // Mouse click to shoot
    this.input.on('pointerdown', () => {
      if (!this.gameEnded) this.fireBullet();
    });

    // 10) AI behavior loop (tunable)
    this.aiTimer = this.time.addEvent({ delay: this.aiConfig.tick, loop: true, callback: this.aiLogic, callbackScope: this });

    // Allow external difficulty changes
    window.addEventListener('DUEL_SET_DIFFICULTY', (ev: Event) => {
      const ce = ev as CustomEvent;
      const level = (ce.detail?.level ?? 'medium') as 'easy' | 'medium' | 'hard';
      this.setDifficulty(level);
    });

    // Track game start time for scoring
    this.gameStartTime = this.time.now;
  }

  update() {
    if (!this.gameEnded) {
      this.handlePlayerInput();
      this.updateStats();
    }
    
    // Keep labels aligned to sprites
    if (this.playerLabel && this.player) {
      this.playerLabel.x = this.player.x;
      this.playerLabel.y = this.player.y - 40;
    }
    if (this.botLabel && this.opponent) {
      this.botLabel.x = this.opponent.x;
      this.botLabel.y = this.opponent.y - 40;
    }
  }

  private handlePlayerInput() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    
    // Movement with A/D keys
    if (this.wasdKeys.A.isDown) {
      body.setVelocityX(-200);
      this.player.setFlipX(true);
      this.player.setScale(1.1, 1); // Run animation
    } else if (this.wasdKeys.D.isDown) {
      body.setVelocityX(200);
      this.player.setFlipX(false);
      this.player.setScale(1.1, 1);
    } else {
      body.setVelocityX(0);
      this.player.setScale(1, 1); // Idle
    }

    // Jump with W key
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.W) && body.blocked.down) {
      body.setVelocityY(-400);
      this.player.setScale(0.9, 1.3); // Jump stretch
      this.time.delayedCall(300, () => {
        if (this.player) this.player.setScale(1, 1);
      });
    }

    // Shoot with Space
    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.fireBullet();
    }
  }

  private calculateFinalScore(won: boolean): number {
    const gameDuration = (this.time.now - this.gameStartTime) / 1000; // in seconds
    let finalScore = this.score;

    if (won) {
      // Base victory bonus
      finalScore += 1000;
      
      // Time bonus (faster = more points)
      const timeBonus = Math.max(0, Math.floor((30 - gameDuration) * 20)); // Up to 600 points for very fast wins
      finalScore += timeBonus;
      
      // Accuracy bonus
      const accuracy = this.shots > 0 ? (this.hits / this.shots) : 0;
      const accuracyBonus = Math.floor(accuracy * 500); // Up to 500 points for perfect accuracy
      finalScore += accuracyBonus;
      
      // Ammo conservation bonus
      const ammoBonus = this.playerAmmo * 25; // 25 points per bullet saved
      finalScore += ammoBonus;
      
      // Difficulty multiplier
      const difficultyMultiplier = this.aiConfig.tick === 150 ? 1.5 : // hard
                                  this.aiConfig.tick === 200 ? 1.2 : // medium  
                                  1.0; // easy
      finalScore = Math.floor(finalScore * difficultyMultiplier);
    } else {
      // Even in defeat, award some points for effort
      finalScore += Math.floor(this.shots * 10); // 10 points per shot fired
      finalScore += Math.floor((this.hits / Math.max(this.shots, 1)) * 200); // Accuracy points
    }

    return Math.max(0, finalScore);
  }

  private fireBullet() {
    if (this.playerAmmo <= 0 || this.gameEnded) return;
    
    const direction = this.player.flipX ? -1 : 1;
    const bullet = this.bullets.create(
      this.player.x + (direction * 25), 
      this.player.y - 10, 
      'bullet'
    ) as Phaser.Physics.Arcade.Image;
    
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(direction * 600, 0);
      bullet.setCollideWorldBounds(true);
      body.onWorldBounds = true;
    }
    bullet.setDepth(7);
    
    // Muzzle flash effect
    this.puff.emitParticleAt(this.player.x + (direction * 20), this.player.y - 10);
    
    // Shoot animation
    this.player.setScale(1.3, 0.9);
    this.time.delayedCall(150, () => {
      if (this.player) this.player.setScale(1, 1);
    });
    
    // Camera shake
    this.cameras.main.shake(100, 0.01);
    
    this.playerAmmo--;
    this.shots++;
  }

  private aiFire() {
    if (this.gameEnded || this.aiAmmo <= 0) return;
    
    const dx = this.player.x - this.opponent.x;
    const direction = Math.sign(dx);
    const bullet = this.aiBullets.create(
      this.opponent.x + (direction * 25), 
      this.opponent.y - 10, 
      'bullet'
    ) as Phaser.Physics.Arcade.Image;
    
    bullet.setTint(0xFF4444); // Red tint for AI bullets
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(direction * this.aiConfig.bullet, 0);
      bullet.setCollideWorldBounds(true);
      body.onWorldBounds = true;
    }
    bullet.setDepth(7);
    
    // AI muzzle flash
    this.puff.emitParticleAt(this.opponent.x + (direction * 20), this.opponent.y - 10);
    
    // AI shoot animation
    this.opponent.setScale(1.3, 0.9);
    this.time.delayedCall(150, () => {
      if (this.opponent) this.opponent.setScale(1, 1);
    });
    
    this.aiAmmo--;
  }

  private aiLogic() {
    if (this.gameEnded || !this.opponent || !this.player) return;
    
    const body = this.opponent.body as Phaser.Physics.Arcade.Body;
    const distance = this.player.x - this.opponent.x;
    
    // FIXED: AI movement strategy - more responsive and grounded
    let vx = 0;
    if (Math.abs(distance) > 300) {
      // Move closer
      vx = Math.sign(distance) * this.aiConfig.approach;
      this.opponent.setFlipX(distance < 0);
    } else if (Math.abs(distance) < 120) {
      // Move away for better shot
      vx = -Math.sign(distance) * this.aiConfig.retreat;
      this.opponent.setFlipX(distance > 0);
    } else {
      // Stop and aim
      vx = 0;
      this.opponent.setFlipX(distance < 0);
    }

    // Obstacle avoidance: if blocked in intended direction, stop and optionally jump
    if ((vx > 0 && (body.blocked.right || body.touching.right)) || (vx < 0 && (body.blocked.left || body.touching.left))) {
      vx = 0;
      if (body.blocked.down) {
        // Small chance to hop over low cover when blocked
        if (Phaser.Math.Between(0, 100) < Math.min(35, this.aiConfig.jump + 10)) {
          body.setVelocityY(-400);
          this.opponent.setScale(0.9, 1.3);
          this.time.delayedCall(300, () => {
            if (this.opponent) this.opponent.setScale(1, 1);
          });
        }
      }
    }

    body.setVelocityX(vx);
    
    // FIXED: Jump logic - only jump when on ground and for good reason
  const shouldJump = (
      body.blocked.down && // Must be on ground
      (
  Phaser.Math.Between(0, 100) < this.aiConfig.jump || // Random evasion
        (Math.abs(distance) < 200 && Math.abs(this.player.y - this.opponent.y) > 50) // Jump to reach player level
      )
    );
    
    if (shouldJump) {
      body.setVelocityY(-400);
      this.opponent.setScale(0.9, 1.3); // Jump stretch
      this.time.delayedCall(300, () => {
        if (this.opponent) this.opponent.setScale(1, 1);
      });
    }
    
    // FIXED: Shooting logic - more strategic and frequent
    const canShoot = (
      Math.abs(distance) < 500 && 
      Math.abs(this.player.y - this.opponent.y) < 100 && // Similar height
  Phaser.Math.Between(0, 100) < this.aiConfig.shoot // chance to shoot when in range
    );
    
    if (canShoot) {
      this.aiFire();
    }
  }

  private updateStats() {
    // Send stats to HUD
    window.dispatchEvent(new CustomEvent('GAME_STATS', {
      detail: {
        health: this.playerHP,
        ammo: this.playerAmmo,
        score: this.score,
        accuracy: this.shots ? (this.hits / this.shots * 100) : 0,
        streak: this.streak,
        aiAmmo: this.aiAmmo // Add AI ammo for debugging
      }
    }));
  }
}

type Result = { score: number; accuracy: number; reactionTime: number; strategyRating: number };