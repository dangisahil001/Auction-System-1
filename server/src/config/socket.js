const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
      } catch (err) {
        // Allow unauthenticated connections for public auction viewing
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join auction room
    socket.on('join-auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
      console.log(`Socket ${socket.id} joined auction:${auctionId}`);
    });

    // Leave auction room
    socket.on('leave-auction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
      console.log(`Socket ${socket.id} left auction:${auctionId}`);
    });

    // Join user's personal notification room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      console.log(`Socket ${socket.id} joined user:${socket.userId}`);
    }

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
