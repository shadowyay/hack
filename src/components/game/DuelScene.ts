// src/game/DuelScene.ts
import Phaser from 'phaser';

export default class DuelScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DuelScene' });
  }

  // Public helpers
  setGameEndCallback!: (r: Result) => void;
  setDifficulty(_: 'easy' | 'medium' | 'hard') {}

  // Private state
  private player!: Phaser.Physics.Arcade.Sprite;
  private opponent!: Phaser.Physics.Arcade.Sprite;
  private playerVis!: Phaser.GameObjects.Rectangle;
  private botVis!: Phaser.GameObjects.Rectangle;
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

  // Ground level for consistent spawning
  private groundLevel!: number;

  preload() {
    // Generate simple 1x1 pixel for particles and bullets
    this.textures.generate('pixel', { data: ['1'], pixelWidth: 1 });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Set ground level consistently
    this.groundLevel = Math.floor(height * 0.6);

    // 1) Background – RDR2-style desert
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xffd700, 0xff4500, 1);
    sky.fillRect(0, 0, width, height * 0.6);
    sky.setDepth(0);

    const ground = this.add.graphics();
    ground.fillStyle(0x8b4513, 1);
    ground.fillRect(0, this.groundLevel, width, height * 0.4);
    ground.setDepth(0);

    // Procedural clouds
    this.add.graphics()
      .fillStyle(0xffffff, 0.6)
      .fillEllipse(width * 0.2, 80, 100, 50)
      .fillEllipse(width * 0.7, 60, 120, 60);

    // Mesa silhouettes in background
    const mesa = this.add.graphics();
    mesa.fillStyle(0x654321, 0.8);
    mesa.fillTriangle(width * 0.1, this.groundLevel, width * 0.25, this.groundLevel - 200, width * 0.4, this.groundLevel);
    mesa.fillTriangle(width * 0.6, this.groundLevel, width * 0.75, this.groundLevel - 250, width * 0.9, this.groundLevel);
    mesa.setDepth(0);

    // 2) Ground platform - physics enabled
    this.physics.world.setBounds(0, 0, width, height);
    this.groundPlatform = this.add.rectangle(0, this.groundLevel, width, height - this.groundLevel, 0x704214).setOrigin(0);
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
    
    // CRITICAL FIX: Both spawn at exactly the same Y coordinate
    const spawnY = this.groundLevel - 30; // 30 pixels above ground for both

    this.player = this.physics.add.sprite(playerSpawnX, spawnY, 'pixel')
      .setDisplaySize(30, 60)
      .setTint(0x00a2ff) // Bright blue cowboy
      .setCollideWorldBounds(true)
      .setDepth(5);

    this.opponent = this.physics.add.sprite(botSpawnX, spawnY, 'pixel')
      .setDisplaySize(30, 60)
      .setTint(0xff3300) // Red cowboy
      .setCollideWorldBounds(true)
      .setDepth(5);

    // Ensure physics bodies match visible size for proper collisions
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(30, 60, true);
    (this.opponent.body as Phaser.Physics.Arcade.Body).setSize(30, 60, true);

    // Name labels for visibility
    this.playerLabel = this.add.text(this.player.x, this.player.y - 50, 'PLAYER', { 
      color: '#ffffff', 
      fontSize: '14px',
      fontFamily: 'serif',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(8);
    
    this.botLabel = this.add.text(this.opponent.x, this.opponent.y - 50, 'BOT', { 
      color: '#ffffff', 
      fontSize: '14px',
      fontFamily: 'serif',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(8);

    // Strong visual rectangles that follow sprites (debug/visibility)
    this.playerVis = this.add.rectangle(this.player.x, this.player.y, 30, 60, 0x00a2ff, 0.6)
      .setDepth(9)
      .setStrokeStyle(2, 0xffffff);
    this.botVis = this.add.rectangle(this.opponent.x, this.opponent.y, 30, 60, 0xff3300, 0.6)
      .setDepth(9)
      .setStrokeStyle(2, 0xffffff);

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
      this.score += 1000; // Victory bonus
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
        window.dispatchEvent(new CustomEvent('GAME_END', {
          detail: {
            score: this.score,
            accuracy: this.shots ? (this.hits / this.shots * 100) : 0,
            reactionTime: 300,
            strategyRating: 85
          }
        }));
      });
    }, undefined, this);
    
    this.physics.add.overlap(this.aiBullets, this.player, (bullet) => {
      if (this.gameEnded) return;
      bullet.destroy();
      this.gameEnded = true;
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
        window.dispatchEvent(new CustomEvent('GAME_END', {
          detail: {
            score: this.score,
            accuracy: this.shots ? (this.hits / this.shots * 100) : 0,
            reactionTime: 500,
            strategyRating: 50
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

    // 10) AI behavior - FIXED: More frequent updates for better synchronization
    this.time.addEvent({ delay: 200, loop: true, callback: this.aiLogic, callbackScope: this });

    // 11) Game instructions
    this.add.text(width / 2, 30, 'HIGH NOON DUEL', {
      fontSize: '32px',
      color: '#FFD700',
      fontFamily: 'serif'
    }).setOrigin(0.5);

    this.add.text(width / 2, 70, 'Use A/D to move, W to jump, SPACE or CLICK to shoot!', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.add.text(width / 2, 100, 'First hit wins! Use obstacles for cover.', {
      fontSize: '14px',
      color: '#FFFF00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 3 }
    }).setOrigin(0.5);
  }

  update() {
    if (!this.gameEnded) {
      this.handlePlayerInput();
      this.updateStats();
    }
    
    // Keep visual rectangles aligned to physics sprites
    if (this.playerVis && this.player) {
      this.playerVis.x = this.player.x;
      this.playerVis.y = this.player.y;
    }
    if (this.botVis && this.opponent) {
      this.botVis.x = this.opponent.x;
      this.botVis.y = this.opponent.y;
    }
    if (this.playerLabel && this.player) {
      this.playerLabel.x = this.player.x;
      this.playerLabel.y = this.player.y - 50;
    }
    if (this.botLabel && this.opponent) {
      this.botLabel.x = this.opponent.x;
      this.botLabel.y = this.opponent.y - 50;
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

  private fireBullet() {
    if (this.playerAmmo <= 0 || this.gameEnded) return;
    
    const direction = this.player.flipX ? -1 : 1;
    const bullet = this.bullets.create(
      this.player.x + (direction * 25), 
      this.player.y - 10, 
      'pixel'
    ) as Phaser.Physics.Arcade.Image;
    
    bullet.setDisplaySize(12, 4).setTint(0xffff00); // Yellow bullet
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
      'pixel'
    ) as Phaser.Physics.Arcade.Image;
    
    bullet.setDisplaySize(12, 4).setTint(0xff0000); // Red bullet
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(direction * 500, 0);
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
    if (Math.abs(distance) > 300) {
      // Move closer
      body.setVelocityX(Math.sign(distance) * 150);
      this.opponent.setFlipX(distance < 0);
    } else if (Math.abs(distance) < 120) {
      // Move away for better shot
      body.setVelocityX(-Math.sign(distance) * 120);
      this.opponent.setFlipX(distance > 0);
    } else {
      // Stop and aim
      body.setVelocityX(0);
      this.opponent.setFlipX(distance < 0);
    }
    
    // FIXED: Jump logic - only jump when on ground and for good reason
    const shouldJump = (
      body.blocked.down && // Must be on ground
      (
        Phaser.Math.Between(0, 100) < 20 || // Random evasion
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
      Phaser.Math.Between(0, 100) < 60 // 60% chance to shoot when in range
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