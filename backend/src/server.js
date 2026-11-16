/**
 * Express & Socket.IO Main Application Entry
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const trafficRoutes = require('./routes/trafficRoutes');
const signalRoutes = require('./routes/signalRoutes');
const intersectionRoutes = require('./routes/intersectionRoutes');
const alertRoutes = require('./routes/alertRoutes');
const authRoutes = require('./routes/authRoutes');
const trafficEngine = require('./services/trafficEngine');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Setup WebSocket server with wide CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach routes
app.use('/api/traffic', trafficRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/intersections', intersectionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "Smart Traffic Management Backend API",
    activeDirection: trafficEngine.activeDirection,
    uptime: process.uptime()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send immediate initial state
  socket.emit('traffic_update', trafficEngine.getSnapshot());

  socket.on('request_state', () => {
    socket.emit('traffic_update', trafficEngine.getSnapshot());
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Pass Socket.IO instance to TrafficEngine
trafficEngine.setSocketIO(io);

// Start server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚦 Smart Traffic Management Backend Server Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});
