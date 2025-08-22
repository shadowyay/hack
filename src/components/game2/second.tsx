import React, { useState, useEffect, useRef, useCallback } from 'react';

const RDR2TrackingGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const keysRef = useRef({});
  const mouseRef = useRef({ x: 0, y: 0, clicked: false });
  
  // Game state
  const [gameState, setGameState] = useState({
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
    eagleEyeCooldown: 0
  });

  // UI state
  const [crosshairPos, setCrosshairPos] = useState({ x: 0, y: 0 });
  const [eagleEyeStatus, setEagleEyeStatus] = useState('Ready');

  // Animal types configuration
  const animalTypes = [
    { name: 'Bear', size: 50, speed: 1, color: '#8B4513', points: 50, health: 3 },
    { name: 'Lion', size: 45, speed: 2, color: '#DAA520', points: 40, health: 2 },
    { name: 'Tiger', size: 40, speed: 2.5, color: '#FF6347', points: 35, health: 2 },
    { name: 'Wolf', size: 35, speed: 3, color: '#696969', points: 30, health: 2 },
    { name: 'Deer', size: 40, speed: 4, color: '#D2B48C', points: 20, health: 1 }
  ];

  // Utility functions
  const spawnAnimal = useCallback(() => {
    const type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
    return {
      ...type,
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 1100 + 50,
      y: Math.random() * 700 + 50,
      vx: (Math.random() - 0.5) * type.speed,
      vy: (Math.random() - 0.5) * type.speed,
      maxHealth: type.health,
      currentHealth: type.health,
      tracked: false,
      direction: Math.random() > 0.5 ? 1 : -1,
      behaviorTimer: 0
    };
  }, []);

  const createTrack = useCallback((x, y, animalType) => ({
    id: Math.random().toString(36).substr(2, 9),
    x: x + (Math.random() - 0.5) * 20,
    y: y + (Math.random() - 0.5) * 20,
    type: animalType,
    age: 0,
    maxAge: 300,
    size: Math.random() * 8 + 4
  }), []);

  const createParticle = useCallback((x, y, color, speed = 2) => {
    const particles = [];
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
  const drawPlayer = useCallback((ctx, player) => {
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

  const drawAnimal = useCallback((ctx, animal, eagleEyeActive) => {
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

  const drawTracks = useCallback((ctx, tracks, eagleEyeActive) => {
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

  const drawParticles = useCallback((ctx, particles) => {
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

  const drawEnvironment = useCallback((ctx) => {
    // Trees
    for (let i = 0; i < 8; i++) {
      const x = (i * 150) + 80;
      const y = Math.sin(i * 0.8) * 50 + 150;
      
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
      const x = Math.random() * 1200;
      const y = 800 - Math.random() * 100;
      ctx.fillRect(x, y, 3, 8);
    }
  }, []);

  // Game logic functions
  const shoot = useCallback(() => {
    setGameState(prevState => {
      const newState = { ...prevState };
      const newParticles = [...newState.particles];
      
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
            return null; // Mark for removal
          }
          return { ...animal, currentHealth: newHealth };
        }
        return animal;
      }).filter(Boolean);
      
      return {
        ...newState,
        animals: updatedAnimals,
        particles: newParticles
      };
    });
  }, [createParticle]);

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    setGameState(prevState => {
      const newState = { ...prevState };
      const speed = newState.slowMotion ? newState.player.speed * 0.3 : newState.player.speed;
      const moveSpeed = newState.slowMotion ? 0.3 : 1.0;
      
      // Update player
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
      newState.player.x = Math.max(20, Math.min(1180, newState.player.x));
      newState.player.y = Math.max(20, Math.min(780, newState.player.y));
      
      // Eagle Eye
      if (keysRef.current['e'] && newState.eagleEyeCooldown <= 0) {
        newState.eagleEyeActive = true;
      } else {
        newState.eagleEyeActive = false;
      }
      
      // Slow motion
      newState.slowMotion = keysRef.current[' '] || keysRef.current['space'];
      
      // Shooting
      if (mouseRef.current.clicked) {
        shoot();
        mouseRef.current.clicked = false;
      }
      
      // Update animals
      const newTracks = [...newState.tracks];
      const newParticles = [...newState.particles];
      
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
        if (updatedAnimal.x < 50 || updatedAnimal.x > 1150) {
          updatedAnimal.vx *= -1;
          updatedAnimal.direction *= -1;
        }
        if (updatedAnimal.y < 50 || updatedAnimal.y > 750) {
          updatedAnimal.vy *= -1;
        }
        
        updatedAnimal.x = Math.max(50, Math.min(1150, updatedAnimal.x));
        updatedAnimal.y = Math.max(50, Math.min(750, updatedAnimal.y));
        
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
      
      // Update tracks
      newState.tracks = newTracks.map(track => ({ ...track, age: track.age + 1 }))
                                .filter(track => track.age < track.maxAge);
      
      // Update particles
      newState.particles = newParticles.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1
      })).filter(particle => particle.life > 0);
      
      // Spawn new animals
      if (newState.time % 300 === 0 && newState.animals.length < 5) {
        newState.animals.push(spawnAnimal());
      }
      
      // Update cooldowns
      if (newState.eagleEyeCooldown > 0) {
        newState.eagleEyeCooldown--;
      }
      
      newState.time++;
      
      return newState;
    });
    
    // Render
    ctx.clearRect(0, 0, 1200, 800);
    
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
  const handleKeyDown = useCallback((e) => {
    keysRef.current[e.key.toLowerCase()] = true;
  }, []);

  const handleKeyUp = useCallback((e) => {
    keysRef.current[e.key.toLowerCase()] = false;
  }, []);

  const handleMouseMove = useCallback((e) => {
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
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [spawnAnimal, handleKeyDown, handleKeyUp]);

  // Start game loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  // Update Eagle Eye status
  useEffect(() => {
    if (gameState.eagleEyeActive) {
      setEagleEyeStatus('Active');
    } else if (gameState.eagleEyeCooldown <= 0) {
      setEagleEyeStatus('Ready');
    } else {
      setEagleEyeStatus(Cooldown: ${Math.ceil(gameState.eagleEyeCooldown/60)}s);
    }
  }, [gameState.eagleEyeActive, gameState.eagleEyeCooldown]);

  return (
    <div className="relative bg-amber-900 min-h-screen overflow-hidden cursor-none">
      {/* HUD */}
      <div className="absolute top-5 left-5 text-white text-lg z-10 font-serif" 
           style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
        <div>Health: {gameState.player.health}</div>
        <div>Score: {gameState.score}</div>
        <div>Animals Tracked: {gameState.trackedAnimals}</div>
        <div>Eagle Eye: {eagleEyeStatus}</div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-5 left-5 text-white text-sm z-10 font-serif leading-relaxed"
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
        width={1200}
        height={800}
        className="block mx-auto border-2 border-amber-700"
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
    </div>
  );
};

export default RDR2TrackingGame;