import { Server } from 'socket.io';

let io;

/**
 * Attach Socket.IO to an existing HTTP server.
 *
 * Usage in src/index.js:
 *   import { createServer } from 'http';
 *   import { initSocket, getIO } from './modules/socket/socket.js';
 *
 *   const httpServer = createServer(app);
 *   initSocket(httpServer);
 *   httpServer.listen(PORT);
 */
export function initSocket(httpServer, corsOrigin = '*') {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });

    // ── Example events ────────────────────────────────────────────────────────
    socket.on('ping', (data, callback) => {
      callback?.({ pong: true, echo: data });
    });

    socket.on('join-room', (room) => {
      socket.join(room);
      io.to(room).emit('room-joined', { room, id: socket.id });
    });
  });

  return io;
}

/**
 * Get the Socket.IO instance from anywhere in the app.
 * Call initSocket() first.
 */
export function getIO() {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocket(httpServer) first.');
  return io;
}
