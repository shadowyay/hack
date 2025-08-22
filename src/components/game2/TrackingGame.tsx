import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { GameContext } from '../../context/GameContext';
import Leaderboard from '../ui/Leaderboard';

interface Animal {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  speed: number;
  color: string;
  points: number;
  health: number;
  maxHealth: number;
  currentHealth: number;
  tracked: boolean;
  direction: number;
  behaviorTimer: number;
}

interface Track {
  id: string;
  x: number;
  y: number;
  type: string;
  age: number;
  maxAge: number;
  size: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

interface KillStats {
  animalName: string;
  killTime: number;
  accuracy: boolean;
}

interface GameState {
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    health: number;
    direction: number;
  };
  animals: Animal[];
  tracks: Track[];
  particles: Particle[];
  score: number;
  trackedAnimals: number;
  eagleEyeActive: boolean;
  slowMotion: boolean;
  time: number;
  eagleEyeCooldown: number;
  killedAnimals: number;
  killStats: KillStats[];
  showAnalysis: boolean;
}

const RDR2TrackingGame: React.FC = () => {
  const gameContext = useContext(GameContext);
  const isPaused = gameContext?.gameState?.isPaused;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1200, height: typeof window !== 'undefined' ? window.innerHeight : 800 });
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef({ x: 0, y: 0, clicked: false });
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: 100,
      y: 400,
      width: 30,
      height: 40,
      speed: 3,
      health: 100,
      direction: 1
    },
    animals: [],
    tracks: [],
    particles: [],
    score: 0,
    trackedAnimals: 0,
    eagleEyeActive: false,
    slowMotion: false,
    time: 0,
    eagleEyeCooldown: 0,
    killedAnimals: 0,
    killStats: [],
    showAnalysis: false
  });

  // UI state
  const [crosshairPos, setCrosshairPos] = useState({ x: 0, y: 0 });
  const [eagleEyeStatus, setEagleEyeStatus] = useState('Ready');

  // Utility functions
  const spawnAnimal = useCallback((): Animal => {
    const W = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const H = typeof window !== 'undefined' ? window.innerHeight : 800;
    const animalTypes = [
      { name: 'Bear', size: 50, speed: 1, color: '#8B4513', points: 50, health: 3 },
      { name: 'Lion', size: 45, speed: 2, color: '#DAA520', points: 40, health: 2 },
      { name: 'Tiger', size: 40, speed: 2.5, color: '#FF6347', points: 35, health: 2 },
      { name: 'Wolf', size: 35, speed: 3, color: '#696969', points: 30, health: 2 },
      { name: 'Deer', size: 40, speed: 4, color: '#D2B48C', points: 20, health: 1 }
    ];
    
    const type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
    return {
      ...type,
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (W - 100) + 50,
      y: Math.random() * (H - 100) + 50,
      vx: (Math.random() - 0.5) * type.speed,
      vy: (Math.random() - 0.5) * type.speed,
      maxHealth: type.health,
      currentHealth: type.health,
      tracked: false,
      direction: Math.random() > 0.5 ? 1 : -1,
      behaviorTimer: 0
    };
  }, []);

  const createTrack = useCallback((x: number, y: number, animalType: string): Track => ({
    id: Math.random().toString(36).substr(2, 9),
    x: x + (Math.random() - 0.5) * 20,
    y: y + (Math.random() - 0.5) * 20,
    type: animalType,
    age: 0,
    maxAge: 300,
    size: Math.random() * 8 + 4
  }), []);

  const createParticle = useCallback((x: number, y: number, color: string, speed = 2): Particle[] => {
    const particles: Particle[] = [];
    for (let i = 0; i < 5; i++) {
      particles.push({
        id: Math.random().toString(36).substr(2, 9),
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        color: color,
        life: 30,
        maxLife: 30,
        size: Math.random() * 4 + 2
      });
    }
    return particles;
  }, []);

  // Drawing functions
  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, player: GameState['player']) => {
    ctx.save();
    
    // Player body
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(player.x - player.width/2, player.y - player.height/2, 
                player.width, player.height);
    
    // Player head
    ctx.fillStyle = '#F4A460';
    ctx.beginPath();
    ctx.arc(player.x, player.y - player.height/2 - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Hat
    ctx.fillStyle = '#654321';
    ctx.fillRect(player.x - 10, player.y - player.height/2 - 16, 20, 6);
    
    // Gun
    ctx.fillStyle = '#2F4F4F';
    const gunX = player.x + (player.direction > 0 ? 15 : -25);
    const gunY = player.y - 5;
    ctx.fillRect(gunX, gunY, 10, 3);
    
    ctx.restore();
  }, []);

  const drawAnimal = useCallback((ctx: CanvasRenderingContext2D, animal: Animal, eagleEyeActive: boolean) => {
    ctx.save();
    
    // Animal body with eagle eye effects
    if (eagleEyeActive) {
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 15;
      ctx.fillStyle = animal.tracked ? '#FFD700' : animal.color;
    } else {
      ctx.fillStyle = animal.color;
    }
    
    // Main body
    ctx.beginPath();
    ctx.ellipse(animal.x, animal.y, animal.size/2, animal.size/3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    const headX = animal.x + (animal.direction * animal.size/3);
    ctx.arc(headX, animal.y - 5, animal.size/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Health bar
    if (animal.currentHealth < animal.maxHealth) {
      const barWidth = 40;
      const barHeight = 4;
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(animal.x - barWidth/2, animal.y - animal.size/2 - 10, barWidth, barHeight);
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(animal.x - barWidth/2, animal.y - animal.size/2 - 10, 
                 (animal.currentHealth / animal.maxHealth) * barWidth, barHeight);
    }
    
    // Type label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(animal.name, animal.x, animal.y - animal.size/2 - 20);
    
    ctx.restore();
  }, []);

  const drawTracks = useCallback((ctx: CanvasRenderingContext2D, tracks: Track[], eagleEyeActive: boolean) => {
    tracks.forEach(track => {
      ctx.save();
      
      const alpha = 1 - (track.age / track.maxAge);
      
      if (eagleEyeActive) {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 8;
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(101, 67, 33, ${alpha * 0.6})`;
      }
      
      // Draw paw print
      ctx.beginPath();
      ctx.arc(track.x, track.y, track.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Toe prints
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2) + Math.PI / 4;
        const toeX = track.x + Math.cos(angle) * track.size * 0.6;
        const toeY = track.y + Math.sin(angle) * track.size * 0.6;
        ctx.beginPath();
        ctx.arc(toeX, toeY, track.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(particle => {
      ctx.save();
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  const drawEnvironment = useCallback((ctx: CanvasRenderingContext2D) => {
    const W = canvasRef.current?.width || 1200;
    const H = canvasRef.current?.height || 800;
    // Trees
    for (let i = 0; i < 8; i++) {
      const x = ((i + 1) * (W / 9));
      const y = Math.sin(i * 0.8) * 0.05 * H + 0.2 * H;
      
      // Trunk
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 8, y, 16, 60);
      
      // Leaves
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(x, y - 10, 25, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Grass patches
    ctx.fillStyle = '#32CD32';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * W;
      const y = H - Math.random() * 100;
      ctx.fillRect(x, y, 3, 8);
    }
  }, []);

  // Game logic functions - RESTORED!
  const shoot = useCallback(() => {
    setGameState(prevState => {
      const newState = { ...prevState };
      const newParticles = [...newState.particles];
      const newKillStats = [...newState.killStats];
      
      // Add muzzle flash
      newParticles.push(...createParticle(
        newState.player.x + (newState.player.direction * 20), 
        newState.player.y - 5, 
        'rgb(255, 255, 0)', 
        3
      ));
      
      // Check for hits
      const updatedAnimals = newState.animals.map(animal => {
        const animalDist = Math.sqrt(
          (animal.x - mouseRef.current.x) ** 2 + (animal.y - mouseRef.current.y) ** 2
        );
        
        if (animalDist < animal.size/2 + 20) {
          newParticles.push(...createParticle(animal.x, animal.y, 'rgb(255, 0, 0)', 4));
          
          const newHealth = animal.currentHealth - 1;
          if (newHealth <= 0) {
            newParticles.push(...createParticle(animal.x, animal.y, 'rgb(255, 215, 0)', 6));
            newState.score += animal.points;
            newState.killedAnimals++;
            
            // Track kill stats
            newKillStats.push({
              animalName: animal.name,
              killTime: newState.time,
              accuracy: animalDist < animal.size/4 // Headshot accuracy
            });
            
            // Show analysis if 10 animals killed
            if (newState.killedAnimals >= 10) {
              newState.showAnalysis = true;
            }
            
            return null; // Mark for removal
          }
          return { ...animal, currentHealth: newHealth };
        }
        return animal;
      }).filter(Boolean) as Animal[];
      
      return {
        ...newState,
        animals: updatedAnimals,
        particles: newParticles,
        killStats: newKillStats
      };
    });
  }, [createParticle]);

  // COMPLETE Game loop - RESTORED!
  const gameLoop = useCallback(() => {
    // Stop the loop entirely when analysis is shown or game is paused
    if (gameState.showAnalysis || isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setGameState(prevState => {
      const newState = { ...prevState };
      const speed = newState.slowMotion ? newState.player.speed * 0.3 : newState.player.speed;
      const moveSpeed = newState.slowMotion ? 0.3 : 1.0;
      
      // Update player - RESTORED!
      if (keysRef.current['w'] || keysRef.current['arrowup']) newState.player.y -= speed;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) newState.player.y += speed;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) {
        newState.player.x -= speed;
        newState.player.direction = -1;
      }
      if (keysRef.current['d'] || keysRef.current['arrowright']) {
        newState.player.x += speed;
        newState.player.direction = 1;
      }
      
  // Boundary check for player
  const W = canvasRef.current?.width || 1200;
  const H = canvasRef.current?.height || 800;
  newState.player.x = Math.max(20, Math.min(W - 20, newState.player.x));
  newState.player.y = Math.max(20, Math.min(H - 20, newState.player.y));
      
      // Eagle Eye - RESTORED!
      if (keysRef.current['e'] && newState.eagleEyeCooldown <= 0) {
        newState.eagleEyeActive = true;
      } else {
        newState.eagleEyeActive = false;
      }
      
      // Slow motion - RESTORED!
      newState.slowMotion = keysRef.current[' '] || keysRef.current['space'];
      
      // Shooting - RESTORED!
      if (mouseRef.current.clicked) {
        shoot();
        mouseRef.current.clicked = false;
      }
      
      // Update animals - RESTORED!
      const newTracks = [...newState.tracks];
      const newParticles = [...newState.particles];

      // Player takes damage if near animal
      let playerDamaged = false;
      newState.animals = newState.animals.map(animal => {
        const updatedAnimal = { ...animal };
        updatedAnimal.behaviorTimer++;

        // Random movement changes
        if (updatedAnimal.behaviorTimer % 120 === 0) {
          updatedAnimal.vx = (Math.random() - 0.5) * updatedAnimal.speed;
          updatedAnimal.vy = (Math.random() - 0.5) * updatedAnimal.speed;
          updatedAnimal.direction = updatedAnimal.vx > 0 ? 1 : -1;
        }

        // Update position
        updatedAnimal.x += updatedAnimal.vx * moveSpeed;
        updatedAnimal.y += updatedAnimal.vy * moveSpeed;

        // Boundary check
        if (updatedAnimal.x < 50 || updatedAnimal.x > (W - 50)) {
          updatedAnimal.vx *= -1;
          updatedAnimal.direction *= -1;
        }
        if (updatedAnimal.y < 50 || updatedAnimal.y > (H - 50)) {
          updatedAnimal.vy *= -1;
        }

        updatedAnimal.x = Math.max(50, Math.min(W - 50, updatedAnimal.x));
        updatedAnimal.y = Math.max(50, Math.min(H - 50, updatedAnimal.y));

        // Player damage logic
        const distToPlayer = Math.sqrt(
          (updatedAnimal.x - newState.player.x) ** 2 + (updatedAnimal.y - newState.player.y) ** 2
        );
        if (distToPlayer < updatedAnimal.size / 2 + newState.player.width / 2 + 10) {
          playerDamaged = true;
        }

        // Create tracks
        if (newState.time % 60 === 0) {
          newTracks.push(createTrack(updatedAnimal.x, updatedAnimal.y, updatedAnimal.name));
        }

        // Eagle Eye tracking
        if (newState.eagleEyeActive) {
          const playerDist = Math.sqrt(
            (updatedAnimal.x - newState.player.x) ** 2 + (updatedAnimal.y - newState.player.y) ** 2
          );
          if (playerDist < 200 && !updatedAnimal.tracked) {
            updatedAnimal.tracked = true;
            newState.trackedAnimals++;
            newState.score += 10;
            newParticles.push(...createParticle(updatedAnimal.x, updatedAnimal.y, 'rgb(0, 255, 255)', 3));
          }
        }

        return updatedAnimal;
      });

      // Apply player damage if near any animal
      if (playerDamaged) {
        newState.player.health = Math.max(0, newState.player.health - 1); // Lose 1 health per frame near animal
        // End game if health reaches 0
        if (newState.player.health === 0) {
          newState.showAnalysis = true;
        }
      }
      
      // Update tracks - RESTORED!
      newState.tracks = newTracks.map(track => ({ ...track, age: track.age + 1 }))
                                .filter(track => track.age < track.maxAge);
      
      // Update particles - RESTORED!
      newState.particles = newParticles.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1
      })).filter(particle => particle.life > 0);
      
      // Spawn new animals - RESTORED!
      if (newState.time % 300 === 0 && newState.animals.length < 5) {
        newState.animals.push(spawnAnimal());
      }
      
      // Update cooldowns - RESTORED!
      if (newState.eagleEyeCooldown > 0) {
        newState.eagleEyeCooldown--;
      }
      
      newState.time++;
      
      return newState;
    });
    
    // Render - COMPLETE!
  const W = canvasRef.current?.width || 1200;
  const H = canvasRef.current?.height || 800;
  ctx.clearRect(0, 0, W, H);
    
    // Apply slow motion filter
    if (gameState.slowMotion) {
      ctx.filter = 'blur(1px) brightness(0.8) sepia(0.3)';
    } else {
      ctx.filter = 'none';
    }
    
    drawEnvironment(ctx);
    drawTracks(ctx, gameState.tracks, gameState.eagleEyeActive);
    gameState.animals.forEach(animal => drawAnimal(ctx, animal, gameState.eagleEyeActive));
    drawPlayer(ctx, gameState.player);
    drawParticles(ctx, gameState.particles);
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, shoot, spawnAnimal, createTrack, createParticle, drawPlayer, drawAnimal, drawTracks, drawParticles, drawEnvironment]);

  // Event handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.key.toLowerCase()] = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.key.toLowerCase()] = false;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    setCrosshairPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseDown = useCallback(() => {
    mouseRef.current.clicked = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseRef.current.clicked = false;
  }, []);

  // Initialize game and setup event listeners
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
      const c = canvasRef.current;
      if (c) {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Initialize with some animals
    setGameState(prevState => ({
      ...prevState,
      animals: [spawnAnimal(), spawnAnimal(), spawnAnimal()]
    }));

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [spawnAnimal, handleKeyDown, handleKeyUp]);


  // Start or resume game loop
  useEffect(() => {
    if (!isPaused && !gameState.showAnalysis) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, isPaused, gameState.showAnalysis]);

  // Ensure we cancel any pending animation frames as soon as analysis starts
  useEffect(() => {
    if (gameState.showAnalysis && gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, [gameState.showAnalysis]);

  // Update Eagle Eye status
  useEffect(() => {
    if (gameState.eagleEyeActive) {
      setEagleEyeStatus('Active');
    } else if (gameState.eagleEyeCooldown <= 0) {
      setEagleEyeStatus('Ready');
    } else {
      setEagleEyeStatus(`Cooldown: ${Math.ceil(gameState.eagleEyeCooldown/60)}s`);
    }
  }, [gameState.eagleEyeActive, gameState.eagleEyeCooldown]);

  // Analysis Screen Component
  const AnalysisScreen = () => {
    const [scoreSubmitted, setScoreSubmitted] = React.useState(false);
    const totalTime = Math.floor(gameState.time / 60);
    const averageKillTime = gameState.killStats.length > 0 
      ? Math.floor(gameState.killStats.reduce((sum, stat) => sum + stat.killTime, 0) / gameState.killStats.length / 60)
      : 0;
    const accurateKills = gameState.killStats.filter(stat => stat.accuracy).length;
    const accuracyPercentage = gameState.killStats.length > 0 
      ? Math.round((accurateKills / gameState.killStats.length) * 100)
      : 0;

    // Submit score to backend when analysis screen is first shown
    React.useEffect(() => {
      if (scoreSubmitted) return;

      const submitScore = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const gameResult = {
          mode: 'tracking',
          score: gameState.score,
          accuracy: accuracyPercentage,
          reactionTime: averageKillTime * 1000, // Convert to milliseconds
          strategyRating: Math.min(100, Math.max(0, gameState.score / 50)), // Strategy based on score
          duration: totalTime * 1000, // Convert to milliseconds
          timestamp: new Date()
        };

        try {
          const response = await fetch('http://localhost:3001/performance/save-result', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(gameResult)
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Score saved successfully:', data);
            if (data.isNewHighScore) {
              console.log('🎉 New high score achieved!');
            }
            setScoreSubmitted(true);
          }
        } catch (error) {
          console.error('Failed to save tracking game score:', error);
        }
      };

      submitScore();
    }, [scoreSubmitted, accuracyPercentage, averageKillTime, totalTime]); // Include dependencies
    
    const animalCounts = gameState.killStats.reduce((counts, stat) => {
      counts[stat.animalName] = (counts[stat.animalName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Performance calculations
    const getHunterGrade = (accuracy: number, time: number, score: number): { grade: string; color: string; description: string } => {
      const performanceScore = (accuracy * 0.4) + ((300 - Math.min(time, 300)) / 300 * 30) + (Math.min(score, 1000) / 1000 * 30);
      
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

    const getSpeedRating = (time: number): { rating: string; color: string } => {
      if (time < 60) return { rating: 'Lightning Fast', color: 'text-yellow-400' };
      if (time < 90) return { rating: 'Very Fast', color: 'text-green-400' };
      if (time < 120) return { rating: 'Fast', color: 'text-blue-400' };
      if (time < 180) return { rating: 'Average', color: 'text-orange-400' };
      return { rating: 'Slow', color: 'text-red-400' };
    };

    const performance = getHunterGrade(accuracyPercentage, totalTime, gameState.score);
    const accuracyRating = getAccuracyRating(accuracyPercentage);
    const speedRating = getSpeedRating(totalTime);
    const isExcellent = performance.grade === 'S' || performance.grade === 'A';

    const restartGame = () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      
      setGameState({
        player: {
          x: 100,
          y: 400,
          width: 30,
          height: 40,
          speed: 3,
          health: 100,
          direction: 1
        },
        animals: [],
        tracks: [],
        particles: [],
        score: 0,
        trackedAnimals: 0,
        eagleEyeActive: false,
        slowMotion: false,
        time: 0,
        eagleEyeCooldown: 0,
        killedAnimals: 0,
        killStats: [],
        showAnalysis: false
      });

      // Restart with fresh animals
      setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          animals: [spawnAnimal(), spawnAnimal(), spawnAnimal()]
        }));
      }, 100);
    };

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 z-50 overflow-y-auto">
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
            
            <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${isExcellent ? 'text-yellow-300' : 'text-white'} drop-shadow-md`}>
              {isExcellent ? '🏆 EXCELLENT HUNT!' : '🎯 HUNT COMPLETE!'}
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
                {gameState.score.toLocaleString()}
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
                {gameState.trackedAnimals}
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
                    {gameState.trackedAnimals >= 5 && (
                      <li className="flex items-center text-green-300">
                        <span className="mr-3 text-green-400">✓</span>
                        <span>Good use of tracking skills</span>
                      </li>
                    )}
                    {gameState.score >= 400 && (
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
                    {gameState.trackedAnimals < 3 && (
                      <li className="flex items-center text-orange-300">
                        <span className="mr-3 text-orange-400">⚠</span>
                        <span>Use Eagle Eye more frequently</span>
                      </li>
                    )}
                    {gameState.score < 200 && (
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
                <h4 className="font-bold text-amber-400 mb-4 text-lg">� Hunt Breakdown</h4>
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
              onClick={restartGame}
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
                  <span className="text-white">{accurateKills}/{gameState.killedAnimals}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eagle Eye Uses:</span>
                  <span className="text-white">{gameState.trackedAnimals}</span>
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

  return (
    <div className="fixed inset-0 bg-amber-900 overflow-hidden">
      {/* HUD */}
      <div className="absolute top-5 left-5 text-white text-lg z-10 font-serif" 
           style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
        <div>Health: {gameState.player.health}</div>
        <div>Score: {gameState.score}</div>
        <div>Animals Tracked: {gameState.trackedAnimals}</div>
        <div>Animals Killed: {gameState.killedAnimals}/10</div>
        <div>Eagle Eye: {eagleEyeStatus}</div>
      </div>

      {/* Controls */}
      <div className="absolute top-10 left-5 mt-32 text-white text-sm z-10 font-serif leading-relaxed"
           style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
        <div className="font-bold">Controls:</div>
        <div>WASD - Move</div>
        <div>E - Eagle Eye (Hold)</div>
        <div>Mouse - Aim & Shoot</div>
        <div>Space - Slow Motion</div>
      </div>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="block w-screen h-screen border-2 border-amber-700"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #90EE90 30%, #228B22 100%)'
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />

      {/* Eagle Eye Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 z-5 ${
          gameState.eagleEyeActive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(100,149,237,0.3) 100%)'
        }}
      />

      {/* Crosshair */}
      <div 
        className="fixed w-8 h-8 border-2 border-white rounded-full pointer-events-none z-15 opacity-80"
        style={{ 
          left: crosshairPos.x - 16, 
          top: crosshairPos.y - 16,
          transform: 'translate(0, 0)'
        }}
      >
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Analysis Screen */}
      {gameState.showAnalysis && <AnalysisScreen />}
    </div>
  );
};

export default RDR2TrackingGame;