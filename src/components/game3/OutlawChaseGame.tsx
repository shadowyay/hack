import { useState, useEffect, useCallback } from 'react';
import Leaderboard from '../ui/Leaderboard';

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  speed: number;
  lastShot: number;
  shootCooldown: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  owner: string;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

interface KillStats {
  enemyId: number;
  killTime: number;
  accuracy: boolean;
  wave: number;
}

interface GameStats {
  shotsFired: number;
  shotsHit: number;
  enemiesKilled: number;
  damageDealt: number;
  damageTaken: number;
  wavesSurvived: number;
  killStats: KillStats[];
  survivalTime: number;
  maxCombo: number;
  currentCombo: number;
  totalScore: number;
}

const OutlawChaseGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver, victory, analysis
  const [player, setPlayer] = useState({
    x: 100,
    y: 300,
    health: 100,
    maxHealth: 100,
    ammo: 20,
    speed: 5,
    isShooting: false
  });
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemyBullets, setEnemyBullets] = useState<Bullet[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [gameTime, setGameTime] = useState(0);
  
  const [gameStats, setGameStats] = useState<GameStats>({
    shotsFired: 0,
    shotsHit: 0,
    enemiesKilled: 0,
    damageDealt: 0,
    damageTaken: 0,
    wavesSurvived: 0,
    killStats: [],
    survivalTime: 0,
    maxCombo: 0,
    currentCombo: 0,
    totalScore: 0
  });
  
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  
  // Generate random obstacles
  const generateObstacles = () => {
    const obstacles = [];
    for (let i = 0; i < 8; i++) {
      obstacles.push({
        x: Math.random() * (GAME_WIDTH - 60) + 30,
        y: Math.random() * (GAME_HEIGHT - 60) + 30,
        width: 40,
        height: 40,
        type: Math.random() > 0.5 ? 'rock' : 'tree'
      });
    }
    return obstacles;
  };
  
  // Initialize game
  const initializeGame = useCallback(() => {
    setPlayer({
      x: 100,
      y: 300,
      health: 100,
      maxHealth: 100,
      ammo: 20,
      speed: 5,
      isShooting: false
    });
    setEnemies([]);
    setBullets([]);
    setEnemyBullets([]);
    setObstacles(generateObstacles());
    setScore(0);
    setWave(1);
    setGameTime(0);
    setGameStats({
      shotsFired: 0,
      shotsHit: 0,
      enemiesKilled: 0,
      damageDealt: 0,
      damageTaken: 0,
      wavesSurvived: 0,
      killStats: [],
      survivalTime: 0,
      maxCombo: 0,
      currentCombo: 0,
      totalScore: 0
    });
  }, []);
  
  // Spawn enemies
  const spawnEnemies = useCallback(() => {
    const newEnemies = [];
    const enemyCount = Math.min(3 + Math.floor(wave / 2), 8);
    
    for (let i = 0; i < enemyCount; i++) {
      const side = Math.random();
      let x, y;
      
      if (side < 0.25) { // Top
        x = Math.random() * GAME_WIDTH;
        y = -50;
      } else if (side < 0.5) { // Right
        x = GAME_WIDTH + 50;
        y = Math.random() * GAME_HEIGHT;
      } else if (side < 0.75) { // Bottom
        x = Math.random() * GAME_WIDTH;
        y = GAME_HEIGHT + 50;
      } else { // Left
        x = -50;
        y = Math.random() * GAME_HEIGHT;
      }
      
      newEnemies.push({
        id: Math.random(),
        x,
        y,
        health: 30,
        speed: 2 + Math.random() * 2,
        lastShot: 0,
        shootCooldown: 1000 + Math.random() * 1500
      });
    }
    
    setEnemies(newEnemies);
  }, [wave]);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Collision detection
  const checkCollision = (rect1: { x: number; y: number }, rect2: { x: number; y: number }, size1 = 30, size2 = 30) => {
    return (
      rect1.x < rect2.x + size2 &&
      rect1.x + size1 > rect2.x &&
      rect1.y < rect2.y + size2 &&
      rect1.y + size1 > rect2.y
    );
  };
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const gameLoop = setInterval(() => {
      setGameTime(prev => prev + 1);
      
      // Move player
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        if (keys['a'] || keys['arrowleft']) newX -= prev.speed;
        if (keys['d'] || keys['arrowright']) newX += prev.speed;
        if (keys['w'] || keys['arrowup']) newY -= prev.speed;
        if (keys['s'] || keys['arrowdown']) newY += prev.speed;
        
        // Boundary check
        newX = Math.max(0, Math.min(GAME_WIDTH - 30, newX));
        newY = Math.max(0, Math.min(GAME_HEIGHT - 30, newY));
        
        // Obstacle collision
        let collided = false;
        obstacles.forEach(obstacle => {
          if (checkCollision({ x: newX, y: newY }, obstacle, 30, 40)) {
            collided = true;
          }
        });
        
        if (collided) {
          return prev;
        }
        
        return { ...prev, x: newX, y: newY };
      });
      
      // Player shooting
      if (keys[' '] || keys['j']) {
        setPlayer(prev => {
          if (prev.ammo > 0 && !prev.isShooting) {
            setBullets(bullets => [...bullets, {
              id: Math.random(),
              x: prev.x + 15,
              y: prev.y + 15,
              dx: 8,
              dy: 0,
              owner: 'player'
            }]);
            
            // Update stats
            setGameStats(stats => ({
              ...stats,
              shotsFired: stats.shotsFired + 1
            }));
            
            return { ...prev, ammo: prev.ammo - 1, isShooting: true };
          }
          return prev;
        });
      } else {
        setPlayer(prev => ({ ...prev, isShooting: false }));
      }
      
      // Move and update enemies
      setEnemies(prev => prev.map(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const moveX = (dx / distance) * enemy.speed;
          const moveY = (dy / distance) * enemy.speed;
          
          let newX = enemy.x + moveX;
          let newY = enemy.y + moveY;
          
          // Boundary check for enemies
          newX = Math.max(-10, Math.min(GAME_WIDTH + 10, newX));
          newY = Math.max(-10, Math.min(GAME_HEIGHT + 10, newY));
          
          // Enemy shooting
          const now = Date.now();
          if (distance < 200 && now - enemy.lastShot > enemy.shootCooldown) {
            const bulletDx = (dx / distance) * 6;
            const bulletDy = (dy / distance) * 6;
            
            setEnemyBullets(bullets => [...bullets, {
              id: Math.random(),
              x: enemy.x + 15,
              y: enemy.y + 15,
              dx: bulletDx,
              dy: bulletDy,
              owner: 'enemy'
            }]);
            
            return { ...enemy, x: newX, y: newY, lastShot: now };
          }
          
          return { ...enemy, x: newX, y: newY };
        }
        return enemy;
      }));
      
      // Move bullets
      setBullets(prev => prev
        .map(bullet => ({
          ...bullet,
          x: bullet.x + bullet.dx,
          y: bullet.y + bullet.dy
        }))
        .filter(bullet => 
          bullet.x > -10 && bullet.x < GAME_WIDTH + 10 &&
          bullet.y > -10 && bullet.y < GAME_HEIGHT + 10
        )
      );
      
      setEnemyBullets(prev => prev
        .map(bullet => ({
          ...bullet,
          x: bullet.x + bullet.dx,
          y: bullet.y + bullet.dy
        }))
        .filter(bullet => 
          bullet.x > -10 && bullet.x < GAME_WIDTH + 10 &&
          bullet.y > -10 && bullet.y < GAME_HEIGHT + 10
        )
      );
      
      // Bullet collisions
      setBullets(prevBullets => {
        const remainingBullets: Bullet[] = [];
        
        prevBullets.forEach(bullet => {
          let hit = false;
          
          // Check enemy hits
          setEnemies(prevEnemies => {
            return prevEnemies.map(enemy => {
              if (!hit && checkCollision(bullet, enemy, 5, 30)) {
                hit = true;
                const newHealth = enemy.health - 15;
                
                // Update stats
                setGameStats(stats => ({
                  ...stats,
                  shotsHit: stats.shotsHit + 1,
                  damageDealt: stats.damageDealt + 15,
                  currentCombo: stats.currentCombo + 1,
                  maxCombo: Math.max(stats.maxCombo, stats.currentCombo + 1)
                }));
                
                if (newHealth <= 0) {
                  setScore(prev => prev + 100);
                  setGameStats(stats => ({
                    ...stats,
                    enemiesKilled: stats.enemiesKilled + 1,
                    killStats: [...stats.killStats, {
                      enemyId: enemy.id,
                      killTime: gameTime,
                      accuracy: true,
                      wave: wave
                    }]
                  }));
                  return null;
                }
                return { ...enemy, health: newHealth };
              }
              return enemy;
            }).filter(Boolean) as Enemy[];
          });
          
          if (!hit) {
            remainingBullets.push(bullet);
          } else {
            // Reset combo if missed
            setGameStats(stats => ({
              ...stats,
              currentCombo: 0
            }));
          }
        });
        
        return remainingBullets;
      });
      
      // Enemy bullet hits player
      setEnemyBullets(prevBullets => {
        const remainingBullets: Bullet[] = [];
        
        prevBullets.forEach(bullet => {
          if (checkCollision(bullet, player, 5, 30)) {
            setPlayer(prev => ({ ...prev, health: prev.health - 10 }));
            setGameStats(stats => ({
              ...stats,
              damageTaken: stats.damageTaken + 10,
              currentCombo: 0 // Reset combo when taking damage
            }));
          } else {
            remainingBullets.push(bullet);
          }
        });
        
        return remainingBullets;
      });
      
      // Enemy collision with player
      enemies.forEach(enemy => {
        if (checkCollision(enemy, player)) {
          setPlayer(prev => ({ ...prev, health: prev.health - 1 }));
          setGameStats(stats => ({
            ...stats,
            damageTaken: stats.damageTaken + 1,
            currentCombo: 0
          }));
        }
      });
      
    }, 16); // ~60 FPS
    
    return () => clearInterval(gameLoop);
  }, [gameState, keys, player, enemies, obstacles, gameTime, wave]);
  
  // Check win/lose conditions
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (player.health <= 0) {
      setGameStats(stats => ({
        ...stats,
        survivalTime: gameTime,
        wavesSurvived: wave - 1,
        totalScore: score
      }));
      setGameState('analysis');
    } else if (enemies.length === 0 && gameTime > 60) {
      setScore(prev => prev + wave * 200);
      if (wave >= 5) {
        setGameStats(stats => ({
          ...stats,
          survivalTime: gameTime,
          wavesSurvived: wave,
          totalScore: score + wave * 200
        }));
        setGameState('analysis');
      } else {
        setWave(prev => prev + 1);
        setGameStats(stats => ({
          ...stats,
          wavesSurvived: wave
        }));
        setPlayer(prev => ({ ...prev, ammo: Math.min(prev.ammo + 10, 50) }));
        setTimeout(() => spawnEnemies(), 2000);
      }
    }
  }, [player.health, enemies.length, wave, gameTime, gameState, spawnEnemies, score]);
  
  // Start game
  const startGame = () => {
    initializeGame();
    setGameState('playing');
    setTimeout(() => spawnEnemies(), 1000);
  };
  
  // Restart game
  const restartGame = () => {
    initializeGame();
    setGameState('menu');
  };

  // Analysis Screen Component
  const AnalysisScreen = () => {
    const totalTime = Math.floor(gameStats.survivalTime / 60);
    const accuracy = gameStats.shotsFired > 0 ? Math.round((gameStats.shotsHit / gameStats.shotsFired) * 100) : 0;
    const isVictory = gameStats.wavesSurvived >= 5;
    
    // Performance calculations
    const getOutlawGrade = (accuracy: number, score: number, waves: number): { grade: string; color: string; description: string } => {
      const performanceScore = (accuracy * 0.3) + (waves * 15) + (Math.min(score, 2000) / 2000 * 25) + (gameStats.maxCombo * 2);
      
      if (performanceScore >= 90) return { grade: 'S', color: 'text-yellow-400', description: 'Legendary Outlaw' };
      if (performanceScore >= 80) return { grade: 'A', color: 'text-green-400', description: 'Master Gunslinger' };
      if (performanceScore >= 70) return { grade: 'B', color: 'text-blue-400', description: 'Skilled Fighter' };
      if (performanceScore >= 50) return { grade: 'C', color: 'text-orange-400', description: 'Average Outlaw' };
      if (performanceScore >= 35) return { grade: 'D', color: 'text-red-400', description: 'Rookie Fighter' };
      return { grade: 'F', color: 'text-red-600', description: 'Practice More' };
    };

    const getAccuracyRating = (accuracy: number): { rating: string; color: string } => {
      if (accuracy >= 90) return { rating: 'Deadeye', color: 'text-yellow-400' };
      if (accuracy >= 80) return { rating: 'Sharpshooter', color: 'text-green-400' };
      if (accuracy >= 70) return { rating: 'Marksman', color: 'text-blue-400' };
      if (accuracy >= 50) return { rating: 'Decent Shot', color: 'text-orange-400' };
      return { rating: 'Needs Practice', color: 'text-red-400' };
    };

    const getSurvivalRating = (waves: number): { rating: string; color: string } => {
      if (waves >= 5) return { rating: 'Legendary', color: 'text-yellow-400' };
      if (waves >= 4) return { rating: 'Excellent', color: 'text-green-400' };
      if (waves >= 3) return { rating: 'Good', color: 'text-blue-400' };
      if (waves >= 2) return { rating: 'Fair', color: 'text-orange-400' };
      return { rating: 'Poor', color: 'text-red-400' };
    };

    const performance = getOutlawGrade(accuracy, gameStats.totalScore, gameStats.wavesSurvived);
    const accuracyRating = getAccuracyRating(accuracy);
    const survivalRating = getSurvivalRating(gameStats.wavesSurvived);
    const isExcellent = performance.grade === 'S' || performance.grade === 'A';

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 z-50 overflow-y-auto">
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
            
            <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${isVictory ? 'text-yellow-300' : 'text-red-300'} drop-shadow-md`}>
              {isVictory ? '🏆 ESCAPED!' : '💀 WANTED DEAD'}
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
                {gameStats.totalScore.toLocaleString()}
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
                {accuracy}%
              </div>
              <div className={`text-sm mt-2 ${accuracyRating.color}`}>
                {accuracyRating.rating}
              </div>
            </div>

            {/* Survival */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-2 border-blue-600/50 rounded-lg backdrop-blur-sm">
              <div className="text-4xl mb-2">⏱️</div>
              <h3 className="font-bold text-blue-400 mb-2">Survival</h3>
              <div className="text-3xl font-bold text-blue-300 drop-shadow-md">
                {gameStats.wavesSurvived} Waves
              </div>
              <div className={`text-sm mt-2 ${survivalRating.color}`}>
                {survivalRating.rating}
              </div>
            </div>

            {/* Combat Stats */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-2 border-purple-600/50 rounded-lg backdrop-blur-sm">
              <div className="text-4xl mb-2">⚔️</div>
              <h3 className="font-bold text-purple-400 mb-2">Max Combo</h3>
              <div className="text-3xl font-bold text-purple-300 drop-shadow-md">
                {gameStats.maxCombo}
              </div>
              <div className="text-sm text-purple-500 mt-2">
                Kill Streak
              </div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="p-8 bg-gradient-to-br from-black/40 to-gray-900/40 border-2 border-red-600/50 rounded-lg backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-red-300 mb-6 text-center">
                📊 Outlaw Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-green-400 mb-4 text-lg">🎯 Strengths</h4>
                  <ul className="space-y-3">
                    {accuracy >= 80 && (
                      <li className="flex items-center text-green-300">
                        <span className="mr-3 text-green-400">✓</span>
                        <span>Excellent shooting accuracy</span>
                      </li>
                    )}
                    {gameStats.wavesSurvived >= 4 && (
                      <li className="flex items-center text-green-300">
                        <span className="mr-3 text-green-400">✓</span>
                        <span>Outstanding survival skills</span>
                      </li>
                    )}
                    {gameStats.maxCombo >= 5 && (
                      <li className="flex items-center text-green-300">
                        <span className="mr-3 text-green-400">✓</span>
                        <span>Great combat flow</span>
                      </li>
                    )}
                    {gameStats.enemiesKilled >= 20 && (
                      <li className="flex items-center text-green-300">
                        <span className="mr-3 text-green-400">✓</span>
                        <span>High enemy elimination count</span>
                      </li>
                    )}
                    {gameStats.damageTaken < 50 && (
                      <li className="flex items-center text-green-300">
                        <span className="mr-3 text-green-400">✓</span>
                        <span>Good defensive positioning</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-orange-400 mb-4 text-lg">⚠️ Areas for Improvement</h4>
                  <ul className="space-y-3">
                    {accuracy < 60 && (
                      <li className="flex items-center text-orange-300">
                        <span className="mr-3 text-orange-400">⚠</span>
                        <span>Practice aim and precision shooting</span>
                      </li>
                    )}
                    {gameStats.wavesSurvived < 3 && (
                      <li className="flex items-center text-orange-300">
                        <span className="mr-3 text-orange-400">⚠</span>
                        <span>Work on survival tactics</span>
                      </li>
                    )}
                    {gameStats.maxCombo < 3 && (
                      <li className="flex items-center text-orange-300">
                        <span className="mr-3 text-orange-400">⚠</span>
                        <span>Focus on maintaining kill streaks</span>
                      </li>
                    )}
                    {gameStats.damageTaken > 100 && (
                      <li className="flex items-center text-red-300">
                        <span className="mr-3 text-red-400">✗</span>
                        <span>Improve defensive positioning</span>
                      </li>
                    )}
                    {accuracy < 40 && (
                      <li className="flex items-center text-red-300">
                        <span className="mr-3 text-red-400">✗</span>
                        <span>Significant shooting practice needed</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Combat Breakdown */}
              <div className="mt-8 pt-6 border-t border-red-600/30">
                <h4 className="font-bold text-red-400 mb-4 text-lg">🔫 Combat Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-black/20 rounded-lg">
                    <div className="text-lg font-bold text-white">{gameStats.shotsFired}</div>
                    <div className="text-sm text-gray-300">Shots Fired</div>
                  </div>
                  <div className="text-center p-3 bg-black/20 rounded-lg">
                    <div className="text-lg font-bold text-white">{gameStats.shotsHit}</div>
                    <div className="text-sm text-gray-300">Shots Hit</div>
                  </div>
                  <div className="text-center p-3 bg-black/20 rounded-lg">
                    <div className="text-lg font-bold text-white">{gameStats.enemiesKilled}</div>
                    <div className="text-sm text-gray-300">Enemies Killed</div>
                  </div>
                  <div className="text-center p-3 bg-black/20 rounded-lg">
                    <div className="text-lg font-bold text-white">{gameStats.damageTaken}</div>
                    <div className="text-sm text-gray-300">Damage Taken</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto">
            <button
              onClick={restartGame}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🔄 Try Again
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
            <div className="bg-gradient-to-br from-black/40 to-gray-900/40 border-2 border-red-600/50 rounded-lg backdrop-blur-sm p-8">
              <h3 className="text-2xl font-bold text-red-300 mb-6 text-center">
                🏆 Outlaw Chase Leaderboard
              </h3>
              <Leaderboard gameMode="chase" />
            </div>
          </div>

          {/* Session Details */}
          <div className="mt-12 max-w-2xl mx-auto text-center">
            <div className="bg-black/30 rounded-lg p-6 border border-red-600/30">
              <h4 className="font-bold text-red-400 mb-4">Session Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Fight Duration:</span>
                  <span className="text-white">{totalTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="text-white">{accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Enemies Killed:</span>
                  <span className="text-white">{gameStats.enemiesKilled}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waves Survived:</span>
                  <span className="text-white">{gameStats.wavesSurvived}</span>
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

  if (gameState === 'analysis') {
    return <AnalysisScreen />;
  }

  if (gameState === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-900 to-red-900 text-white">
        <div className="text-center p-8 bg-black bg-opacity-50 rounded-lg border-2 border-yellow-600">
          <h1 className="text-6xl font-bold mb-4 text-yellow-400">OUTLAW CHASE</h1>
          <p className="text-xl mb-6">A Red Dead Redemption Style Chase Game</p>
          <div className="text-left mb-6 space-y-2">
            <p><strong>Controls:</strong></p>
            <p>WASD / Arrow Keys - Move</p>
            <p>SPACEBAR / J - Shoot</p>
            <p>Survive 5 waves of bounty hunters!</p>
          </div>
          <button 
            onClick={startGame}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-bold border-2 border-yellow-600 transition-colors"
          >
            START GAME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-800 to-yellow-700 p-4">
      {/* UI */}
      <div className="flex justify-between w-full max-w-4xl mb-2 text-white font-bold">
        <div className="flex gap-6">
          <div className="bg-black bg-opacity-50 px-4 py-2 rounded border border-yellow-600">
            Health: {player.health}
          </div>
          <div className="bg-black bg-opacity-50 px-4 py-2 rounded border border-yellow-600">
            Ammo: {player.ammo}
          </div>
          <div className="bg-black bg-opacity-50 px-4 py-2 rounded border border-yellow-600">
            Score: {score}
          </div>
          <div className="bg-black bg-opacity-50 px-4 py-2 rounded border border-yellow-600">
            Combo: {gameStats.currentCombo}
          </div>
        </div>
        <div className="bg-black bg-opacity-50 px-4 py-2 rounded border border-yellow-600">
          Wave: {wave}
        </div>
      </div>
      
      {/* Game Area */}
      <div 
        className="relative bg-gradient-to-br from-yellow-600 to-orange-700 border-4 border-yellow-900 shadow-2xl"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Obstacles */}
        {obstacles.map((obstacle, index) => (
          <div
            key={index}
            className={`absolute ${obstacle.type === 'rock' ? 'bg-gray-700 rounded-full' : 'bg-green-800 rounded-sm'} border border-black`}
            style={{
              left: obstacle.x,
              top: obstacle.y,
              width: obstacle.width,
              height: obstacle.height
            }}
          />
        ))}
        
        {/* Player */}
        <div
          className="absolute bg-blue-600 border-2 border-blue-800 rounded-sm flex items-center justify-center text-white font-bold"
          style={{ left: player.x, top: player.y, width: 30, height: 30 }}
        >
          🤠
        </div>
        
        {/* Enemies */}
        {enemies.map(enemy => (
          <div
            key={enemy.id}
            className="absolute bg-red-600 border-2 border-red-800 rounded-sm flex items-center justify-center text-white font-bold"
            style={{ left: enemy.x, top: enemy.y, width: 30, height: 30 }}
          >
            💀
          </div>
        ))}
        
        {/* Player Bullets */}
        {bullets.map(bullet => (
          <div
            key={bullet.id}
            className="absolute bg-yellow-400 border border-yellow-600 rounded-full"
            style={{ left: bullet.x, top: bullet.y, width: 5, height: 5 }}
          />
        ))}
        
        {/* Enemy Bullets */}
        {enemyBullets.map(bullet => (
          <div
            key={bullet.id}
            className="absolute bg-red-400 border border-red-600 rounded-full"
            style={{ left: bullet.x, top: bullet.y, width: 5, height: 5 }}
          />
        ))}
      </div>
      
      {/* Instructions */}
      <div className="mt-2 text-center text-white">
        <p>WASD/Arrows: Move | SPACE/J: Shoot | Survive all waves!</p>
      </div>
    </div>
  );
};

export default OutlawChaseGame;
