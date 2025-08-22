module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for player actions
    socket.on('playerAction', (data) => {
      // Broadcast to opponent or all in room
      if (data.mode === 'duel') {
        io.emit('opponentMove', { playerId: data.playerId, action: data.action });
      }
    });

    // Example: Broadcast DRAW! signal in duel mode
    socket.on('startDuel', () => {
      io.emit('drawSignal', { message: 'DRAW!' });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
