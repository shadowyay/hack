require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const scenarioRoutes = require('./routes/scenario');
const performanceRoutes = require('./routes/performance');
const feedbackRoutes = require('./routes/feedback');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/scenario', scenarioRoutes);
app.use('/performance', performanceRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/leaderboard', leaderboardRoutes);

// WebSocket logic
require('./services/socketService')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
