// Sample data for development/testing
module.exports = {
  players: [
    { playerId: 'p1', name: 'HunterA', reactionTime: 350, accuracy: 80, strategyScore: 60, mode: 'duel' },
    { playerId: 'p2', name: 'HunterB', reactionTime: 420, accuracy: 75, strategyScore: 55, mode: 'chase' },
    { playerId: 'p3', name: 'HunterC', reactionTime: 500, accuracy: 65, strategyScore: 40, mode: 'tracking' }
  ],
  scenarios: [
    { mode: 'duel', difficulty: 'easy', details: { positions: [{x:10,y:20},{x:30,y:40}], objectives: 'Defeat the opponent', opponentSkill: 'novice', environment: 'desert' } },
    { mode: 'chase', difficulty: 'medium', details: { positions: [{x:50,y:60},{x:70,y:80}], objectives: 'Capture the flag', opponentSkill: 'intermediate', environment: 'forest' } }
  ]
};
